"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  useActiveSpeakerId,
  useParticipantIds,
  useParticipantProperty,
  useParticipantCounts,
  useLocalParticipant,
  useScreenShare,
  useDaily,
  useAppMessage,
  useDailyEvent,
  DailyVideo,
} from "@daily-co/daily-react";
import { MicOff, Eye, LogOut } from "lucide-react";
import DailyChat from "./DailyChat";
import DailyControls from "./DailyControls";
import DailyActionOverlay from "./DailyActionOverlay";
import ParticipantNotifications from "./ParticipantNotifications";
import NetworkQuality from "./NetworkQuality";
import ParticipantManager from "../admin/ParticipantManager";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DailyLivestreamProps {
  onLeave?: () => void;
  isRecording?: boolean;
  sessionId: string;
  isAdmin?: boolean;
  sessionTitle?: string;
  sessionType?: string;
}

interface HandRaise {
  sessionId: string;
  userName: string;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SpeakerTile({
  sessionId,
  isActive,
}: {
  sessionId: string;
  isActive: boolean;
}) {
  const [userName, videoState, audioState] = useParticipantProperty(
    sessionId,
    ["user_name", "tracks.video.state", "tracks.audio.state"]
  );
  const hasVideo = videoState === "playable";
  const hasAudio = audioState === "playable";

  return (
    <div
      className={`relative bg-gray-800 aspect-video overflow-hidden ${
        isActive ? "ring-2 ring-yellow-500" : ""
      }`}
    >
      {hasVideo ? (
        <DailyVideo
          automirror
          sessionId={sessionId}
          type="video"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-12 h-12 bg-gray-700 flex items-center justify-center text-xl font-bold text-gray-400">
            {(userName || "S").charAt(0).toUpperCase()}
          </div>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1 flex items-center justify-between">
        <span className="text-white text-xs font-medium truncate">
          {userName || "Speaker"}
        </span>
        {!hasAudio && <MicOff className="w-3 h-3 text-red-400 flex-shrink-0 ml-1" />}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function DailyLivestream({
  onLeave,
  isRecording,
  sessionId,
  isAdmin,
  sessionTitle,
  sessionType,
}: DailyLivestreamProps) {
  const daily = useDaily();
  const activeSpeakerId = useActiveSpeakerId();
  const { screens } = useScreenShare();
  const localParticipant = useLocalParticipant();

  // Efficient speaker detection via native filtered hooks (no hidden components)
  const ownerIds = useParticipantIds({ filter: "owner" });
  const promotedFilter = useCallback((p: any) => {
    if (p.owner) return false; // Owners tracked separately via string filter
    const canSend = p.permissions?.canSend;
    const hasCanSend = canSend !== false && canSend !== undefined;
    const isBroadcasting =
      p.tracks?.video?.state === "playable" || p.tracks?.audio?.state === "playable";
    return hasCanSend || isBroadcasting;
  }, []);
  const promotedIds = useParticipantIds({ filter: promotedFilter });
  const participantCounts = useParticipantCounts();

  const [promotedBannerDismissed, setPromotedBannerDismissed] = useState(false);
  const [handRaises, setHandRaises] = useState<HandRaise[]>([]);
  const [endingSoon, setEndingSoon] = useState<string | null>(null);

  // -------------------------------------------------------------------------
  // Detect if local participant is promoted
  // -------------------------------------------------------------------------

  const localIsOwner = !!localParticipant?.owner;
  const localCanSend =
    localParticipant?.permissions?.canSend !== false &&
    localParticipant?.permissions?.canSend !== undefined;
  const localCanAdmin = localParticipant?.permissions?.canAdmin;
  const localIsCoHost =
    !localIsOwner &&
    localCanAdmin instanceof Set &&
    localCanAdmin.has("participants");
  const localIsPromoted = !localIsOwner && localCanSend;

  const [sidebarTab, setSidebarTab] = useState<"chat" | "people">("chat");

  useEffect(() => {
    if (!localIsPromoted) {
      setPromotedBannerDismissed(false);
    }
  }, [localIsPromoted]);

  // -------------------------------------------------------------------------
  // Hand raise listener
  // -------------------------------------------------------------------------

  useAppMessage({
    onAppMessage: useCallback(
      (ev: { data: Record<string, unknown>; fromId: string }) => {
        if (ev.data.type === "hand-raise") {
          setHandRaises((prev) => {
            if (prev.some((h) => h.sessionId === ev.fromId)) return prev;
            return [
              ...prev,
              {
                sessionId: ev.fromId,
                userName: (ev.data.userName as string) || "Viewer",
                timestamp: Date.now(),
              },
            ];
          });
        }
        if (ev.data.type === "hand-lower") {
          setHandRaises((prev) =>
            prev.filter((h) => h.sessionId !== ev.fromId)
          );
        }
        if (ev.data.type === "session-ending-soon") {
          const msg = (ev.data.message as string) || "This session is ending soon.";
          setEndingSoon(msg);
          setTimeout(() => setEndingSoon(null), 30_000);
        }
      },
      []
    ),
  });

  // Send re-promote request on reconnect if previously promoted
  useEffect(() => {
    if (!daily || localIsOwner) return;
    try {
      const wasPromoted = sessionStorage.getItem("daily-was-promoted");
      if (wasPromoted === "true") {
        const localUser = daily.participants()?.local;
        daily.sendAppMessage(
          {
            type: "re-promote-request",
            userName: localUser?.user_name || "Viewer",
          },
          "*"
        );
      }
    } catch {}
    // Only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daily]);

  // Clean up hand raises when a specific participant leaves (event-driven)
  useDailyEvent(
    "participant-left",
    useCallback((ev: any) => {
      const leftId = ev?.participant?.session_id;
      if (leftId) {
        setHandRaises((prev) => prev.filter((h) => h.sessionId !== leftId));
      }
    }, [])
  );

  // -------------------------------------------------------------------------
  // Build speaker list
  // -------------------------------------------------------------------------

  const speakerIds = useMemo(
    () => [...ownerIds, ...promotedIds],
    [ownerIds, promotedIds]
  );

  const activeSpeakerIsSpeaker =
    activeSpeakerId && speakerIds.includes(activeSpeakerId);
  const mainSpeakerId = activeSpeakerIsSpeaker
    ? activeSpeakerId
    : speakerIds[0] || null;
  const otherSpeakers = mainSpeakerId
    ? speakerIds.filter((id) => id !== mainSpeakerId)
    : [];

  const hasScreenShare = screens.length > 0;
  const hasSpeakers = speakerIds.length > 0;
  const viewerCount = Math.max(0, participantCounts.present - speakerIds.length);

  // -------------------------------------------------------------------------
  // Leave handler
  // -------------------------------------------------------------------------

  const handleLeave = useCallback(() => {
    daily?.leave();
    if (onLeave) {
      onLeave();
    } else {
      window.history.back();
    }
  }, [daily, onLeave]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Left column: header + video */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Left header bar */}
        <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={handleLeave}
              className="text-gray-400 hover:text-white flex-shrink-0 cursor-pointer"
              title="Leave stream"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            {sessionTitle && (
              <div className="min-w-0">
                <h1 className="text-white font-bold text-sm truncate">{sessionTitle}</h1>
                <p className="text-gray-500 text-xs">{sessionType === "livestream" ? "Livestream" : "Video Call"}</p>
              </div>
            )}
            <div className="flex items-center gap-3 ml-auto flex-shrink-0">
              {isRecording && (
                <div className="flex items-center gap-1.5 text-xs text-white select-none">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full bg-red-500 opacity-75 rounded-full" />
                    <span className="relative inline-flex h-2 w-2 bg-red-600 rounded-full" />
                  </span>
                  REC
                </div>
              )}
              {hasSpeakers && viewerCount > 0 && (
                <div className="flex items-center gap-1 text-gray-400 text-xs">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{viewerCount}</span>
                </div>
              )}
              {handRaises.length > 0 && (localIsOwner || localIsPromoted) && (
                <div
                  className="flex items-center gap-1 text-yellow-400 text-xs"
                  title={handRaises.map((h) => h.userName).join(", ")}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                  </svg>
                  {handRaises.length} raised
                </div>
              )}
              {hasSpeakers && <NetworkQuality />}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-400 text-xs font-medium">LIVE</span>
            </div>
            <button
              onClick={handleLeave}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-medium cursor-pointer"
              title="Leave stream"
              aria-label="Leave stream"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Leave</span>
            </button>
          </div>
        </div>

        {/* Video area */}
        <div className="flex-1 bg-gray-900 relative flex flex-col min-h-0">
          <ParticipantNotifications />

          {/* Main video / screen share */}
          <div className="flex-1 relative min-h-0">
            {hasScreenShare ? (
              <DailyVideo
                sessionId={screens[0].session_id}
                type="screenVideo"
                className="w-full h-full object-contain"
              />
            ) : mainSpeakerId ? (
              <DailyVideo
                automirror
                sessionId={mainSpeakerId}
                type="video"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-lg font-medium mb-1">
                    Waiting for the stream to begin...
                  </p>
                  <p className="text-sm text-gray-500">
                    {viewerCount > 1
                      ? `${viewerCount} viewers waiting`
                      : "You'll see the stream once a speaker starts broadcasting"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Speaker strip */}
          {(otherSpeakers.length > 0 ||
            (hasScreenShare && mainSpeakerId)) && (
            <div className="flex gap-1 p-2 bg-gray-950 overflow-x-auto flex-shrink-0">
              {hasScreenShare && mainSpeakerId && (
                <div className="w-40 flex-shrink-0">
                  <SpeakerTile
                    sessionId={mainSpeakerId}
                    isActive={mainSpeakerId === activeSpeakerId}
                  />
                </div>
              )}
              {otherSpeakers.map((id) => (
                <div key={id} className="w-40 flex-shrink-0">
                  <SpeakerTile
                    sessionId={id}
                    isActive={id === activeSpeakerId}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Promoted speaker banner */}
          {localIsPromoted && !promotedBannerDismissed && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 bg-yellow-500 text-black px-4 py-2 text-sm font-medium shadow-lg">
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
              <span>{localIsCoHost ? "You are now a co-host" : "You are now a speaker"}</span>
              <button
                onClick={() => setPromotedBannerDismissed(true)}
                className="ml-1 hover:opacity-70 cursor-pointer"
                aria-label="Dismiss promoted notification"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Self-view PiP for viewers (not promoted, not owner) */}
          {!localIsOwner && !localIsPromoted && localParticipant?.video && localParticipant?.session_id && (
            <div className="absolute bottom-16 right-3 z-10 w-32 aspect-video bg-gray-800 shadow-lg border border-gray-700 overflow-hidden">
              <DailyVideo
                automirror
                sessionId={localParticipant.session_id}
                type="video"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Session ending soon warning */}
          {endingSoon && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-amber-600 text-white px-4 py-2 text-sm font-medium shadow-lg">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {endingSoon}
              <button onClick={() => setEndingSoon(null)} className="ml-1 hover:opacity-70 cursor-pointer" aria-label="Dismiss">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Controls bar: promoted speakers get full controls, viewers get viewer controls */}
          {localIsPromoted && (
            <div className="bg-gray-900 border-t border-gray-800 flex-shrink-0">
              <DailyControls mode="speaker" />
            </div>
          )}
          {!localIsOwner && !localIsPromoted && (
            <div className="bg-gray-900 border-t border-gray-800 flex-shrink-0">
              <DailyControls mode="viewer" />
            </div>
          )}
        </div>
      </div>

      {/* Sidebar column: bottom on mobile, right on desktop */}
      <div className="h-52 sm:h-64 lg:h-auto lg:w-80 flex flex-col border-t lg:border-t-0 lg:border-l border-gray-700 flex-shrink-0">
        {localIsCoHost ? (
          <>
            {/* Tabbed header for co-hosts */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
              <button
                onClick={() => setSidebarTab("chat")}
                className={`flex-1 px-4 py-2 text-sm font-bold transition-colors cursor-pointer ${
                  sidebarTab === "chat"
                    ? "text-yellow-500 border-b-2 border-yellow-500"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setSidebarTab("people")}
                className={`flex-1 px-4 py-2 text-sm font-bold transition-colors cursor-pointer ${
                  sidebarTab === "people"
                    ? "text-yellow-500 border-b-2 border-yellow-500"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                People
              </button>
            </div>
            <div className="flex-1 min-h-0">
              {sidebarTab === "chat" ? (
                <DailyChat sessionId={sessionId} isAdmin={isAdmin} />
              ) : (
                <div className="overflow-y-auto h-full p-4">
                  <ParticipantManager />
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                Chat
              </h3>
            </div>
            <div className="flex-1 min-h-0">
              <DailyChat sessionId={sessionId} isAdmin={isAdmin} />
            </div>
          </>
        )}
      </div>

      <DailyActionOverlay sessionId={sessionId} />
    </div>
  );
}

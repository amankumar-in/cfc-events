"use client";

import { useState, useCallback, useEffect } from "react";
import {
  useActiveSpeakerId,
  useParticipantIds,
  useParticipantProperty,
  useLocalParticipant,
  useScreenShare,
  useDaily,
  useAppMessage,
  DailyVideo,
} from "@daily-co/daily-react";
import { MicOff } from "lucide-react";
import DailyChat from "./DailyChat";
import DailyControls from "./DailyControls";
import DailyActionOverlay from "./DailyActionOverlay";
import ParticipantNotifications from "./ParticipantNotifications";
import NetworkQuality from "./NetworkQuality";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DailyLivestreamProps {
  onLeave?: () => void;
  isRecording?: boolean;
  sessionId: string;
  isAdmin?: boolean;
}

interface HandRaise {
  sessionId: string;
  userName: string;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ParticipantSpeakerChecker({
  sessionId,
  onResult,
}: {
  sessionId: string;
  onResult: (sessionId: string, isSpeaker: boolean) => void;
}) {
  const [owner, canSend, videoState, audioState] = useParticipantProperty(
    sessionId,
    [
      "owner",
      "permissions.canSend",
      "tracks.video.state",
      "tracks.audio.state",
    ]
  );

  useEffect(() => {
    const isOwner = !!owner;
    const hasCanSend = canSend !== false && canSend !== undefined;
    const isBroadcasting =
      videoState === "playable" || audioState === "playable";

    onResult(sessionId, isOwner || hasCanSend || isBroadcasting);
  }, [sessionId, owner, canSend, videoState, audioState, onResult]);

  return null;
}

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
}: DailyLivestreamProps) {
  const daily = useDaily();
  const activeSpeakerId = useActiveSpeakerId();
  const { screens } = useScreenShare();
  const localParticipant = useLocalParticipant();

  const allIds = useParticipantIds();
  const ownerIds = useParticipantIds({ filter: "owner" });

  const [promotedIds, setPromotedIds] = useState<Set<string>>(new Set());
  const [chatOpen, setChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
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
  const localIsPromoted = !localIsOwner && localCanSend;

  useEffect(() => {
    if (!localIsPromoted) {
      setPromotedBannerDismissed(false);
    }
  }, [localIsPromoted]);

  // -------------------------------------------------------------------------
  // ParticipantSpeakerChecker callback
  // -------------------------------------------------------------------------

  const handleSpeakerCheckResult = useCallback(
    (sessionIdParam: string, isSpeaker: boolean) => {
      setPromotedIds((prev) => {
        const isOwner = ownerIds.includes(sessionIdParam);
        if (isOwner) {
          if (prev.has(sessionIdParam)) {
            const next = new Set(prev);
            next.delete(sessionIdParam);
            return next;
          }
          return prev;
        }

        if (isSpeaker && !prev.has(sessionIdParam)) {
          const next = new Set(prev);
          next.add(sessionIdParam);
          return next;
        }
        if (!isSpeaker && prev.has(sessionIdParam)) {
          const next = new Set(prev);
          next.delete(sessionIdParam);
          return next;
        }
        return prev;
      });
    },
    [ownerIds]
  );

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

  // Clean up hand raises when participants leave
  useEffect(() => {
    const allIdsSet = new Set(allIds);
    setHandRaises((prev) =>
      prev.filter((h) => allIdsSet.has(h.sessionId))
    );
  }, [allIds]);

  // -------------------------------------------------------------------------
  // Build speaker list
  // -------------------------------------------------------------------------

  const speakerIds = [
    ...ownerIds,
    ...Array.from(promotedIds).filter((id) => !ownerIds.includes(id)),
  ];

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
  const viewerCount = allIds.length - speakerIds.length;

  const idsToCheck = allIds.filter((id) => !ownerIds.includes(id));

  // -------------------------------------------------------------------------
  // Chat unread handler
  // -------------------------------------------------------------------------

  const handleUnreadChange = useCallback(
    (count: number) => {
      if (!chatOpen) setUnreadCount(count);
    },
    [chatOpen]
  );

  const toggleChat = () => {
    setChatOpen((prev) => {
      if (!prev) setUnreadCount(0);
      return !prev;
    });
  };

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
    <div className="flex flex-col h-full">
      {/* Hidden speaker checkers */}
      {idsToCheck.map((id) => (
        <ParticipantSpeakerChecker
          key={id}
          sessionId={id}
          onResult={handleSpeakerCheckResult}
        />
      ))}

      <div className="flex-1 flex min-h-0">
        {/* Main content area */}
        <div className="flex-1 bg-gray-900 relative min-w-0 flex flex-col">
          <ParticipantNotifications />

          {/* Recording indicator */}
          {isRecording && (
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-red-600 text-white text-xs font-medium px-2 py-1">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              REC
            </div>
          )}

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
            <div className="flex gap-1 p-2 bg-gray-950 overflow-x-auto">
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
              <span>You are now a speaker</span>
              <button
                onClick={() => setPromotedBannerDismissed(true)}
                className="ml-1 hover:opacity-70"
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

          {/* Viewer count + hand raises */}
          {hasSpeakers && (
            <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-2">
              {viewerCount > 0 && (
                <div className="bg-black/60 text-white text-xs px-2 py-1 flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  {viewerCount}
                </div>
              )}

              {handRaises.length > 0 && (
                <div className="bg-black/60 text-white text-xs px-2 py-1 max-w-[200px]">
                  <div className="flex items-center gap-1 mb-1 text-yellow-400 font-medium">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
                      />
                    </svg>
                    {handRaises.length} raised
                  </div>
                  <div className="space-y-0.5">
                    {handRaises.slice(0, 5).map((h) => (
                      <div key={h.sessionId} className="truncate text-gray-300">
                        {h.userName}
                      </div>
                    ))}
                    {handRaises.length > 5 && (
                      <div className="text-gray-400">
                        +{handRaises.length - 5} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Self-view PiP for viewers (not promoted, not owner) */}
          {!localIsOwner && !localIsPromoted && localParticipant?.video && localParticipant?.session_id && (
            <div className="absolute bottom-3 right-3 z-10 w-32 aspect-video bg-gray-800 shadow-lg border border-gray-700 overflow-hidden">
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
              <button onClick={() => setEndingSoon(null)} className="ml-1 hover:opacity-70" aria-label="Dismiss">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Network quality */}
          {hasSpeakers && (
            <div className="absolute bottom-3 left-3 z-10">
              <NetworkQuality />
            </div>
          )}

          {/* Controls for promoted viewers */}
          {localIsPromoted && (
            <div className="bg-gray-900 border-t border-gray-800">
              <DailyControls />
            </div>
          )}
        </div>

        {/* Desktop chat sidebar */}
        <div className="w-80 hidden lg:flex flex-col border-l border-gray-700">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">
              Chat
            </h3>
          </div>
          <div className="flex-1 min-h-0">
            <DailyChat sessionId={sessionId} isAdmin={isAdmin} onUnreadChange={handleUnreadChange} />
          </div>
        </div>
      </div>

      {/* Bottom bar with mobile chat toggle + leave button */}
      <div className="flex items-center justify-between bg-gray-900 px-3 py-2 lg:py-0 lg:px-0">
        {/* Leave button */}
        <button
          onClick={handleLeave}
          className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-800 lg:p-3"
          title="Leave stream"
          aria-label="Leave stream"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>

        {/* Mobile chat toggle */}
        <button
          onClick={toggleChat}
          className="lg:hidden p-2 text-white hover:bg-gray-700 relative"
          title="Toggle chat"
          aria-label={`Toggle chat${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile chat overlay */}
      {chatOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setChatOpen(false)}
          />
          <div className="fixed right-0 top-0 bottom-0 w-80 z-50 lg:hidden flex flex-col bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                Chat
              </h3>
              <button
                onClick={() => setChatOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
                aria-label="Close chat"
              >
                <svg
                  className="w-5 h-5"
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
            <div className="flex-1 min-h-0">
              <DailyChat sessionId={sessionId} isAdmin={isAdmin} onUnreadChange={handleUnreadChange} />
            </div>
          </div>
        </>
      )}

      <DailyActionOverlay sessionId={sessionId} />
    </div>
  );
}

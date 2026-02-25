"use client";

import { useState, useCallback, useMemo } from "react";
import { MicOff, User } from "lucide-react";
import {
  useActiveSpeakerId,
  useParticipantIds,
  useParticipantProperty,
  useParticipantCounts,
  useScreenShare,
  useDailyEvent,
  DailyVideo,
} from "@daily-co/daily-react";

const MAX_TILES = 9;

type LayoutMode = "gallery" | "speaker";

function ParticipantTile({
  sessionId,
  isSpeaking,
  isPinned,
  onPin,
}: {
  sessionId: string;
  isSpeaking: boolean;
  isPinned?: boolean;
  onPin?: (id: string) => void;
}) {
  const [userName, videoState, audioState] = useParticipantProperty(sessionId, [
    "user_name",
    "tracks.video.state",
    "tracks.audio.state",
  ]);

  const hasVideo = videoState === "playable";
  const hasAudio = audioState === "playable";

  return (
    <div
      className={`relative bg-gray-800 aspect-video overflow-hidden cursor-pointer group ${isSpeaking ? "ring-2 ring-yellow-500" : ""} ${isPinned ? "ring-2 ring-blue-500" : ""}`}
      onClick={() => onPin?.(sessionId)}
      title={isPinned ? "Click to unpin" : "Click to pin"}
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
          <div className="w-16 h-16 bg-gray-700 flex items-center justify-center text-2xl font-bold text-gray-400">
            {(userName || "G").charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      {/* Pin indicator */}
      {isPinned && (
        <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-medium px-1.5 py-0.5 flex items-center gap-1">
          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
          </svg>
          Pinned
        </div>
      )}

      {/* Name + audio/speaking indicator */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 flex items-center justify-between">
        <span className="text-white text-xs font-medium truncate flex items-center gap-1.5">
          {/* Speaking indicator dot */}
          {isSpeaking && hasAudio && (
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
          )}
          {userName || "Guest"}
        </span>
        {!hasAudio && <MicOff className="w-3.5 h-3.5 text-red-400 flex-shrink-0 ml-1" />}
      </div>
    </div>
  );
}

export default function DailyParticipantGrid() {
  const activeSpeakerId = useActiveSpeakerId();
  const { screens } = useScreenShare();
  const participantCounts = useParticipantCounts();
  const [layout, setLayout] = useState<LayoutMode>("gallery");
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [hideNoVideo, setHideNoVideo] = useState(false);

  // Native filtered IDs — only applies hideNoVideo filter in gallery view
  const participantFilter = useMemo(() => {
    if (layout !== "gallery" || !hideNoVideo) return undefined;
    return (p: any) => p.tracks?.video?.state === "playable";
  }, [hideNoVideo, layout]);

  const filteredIds = useParticipantIds({ filter: participantFilter });

  // Clear pinned participant when they leave (event-driven, not render-time check)
  useDailyEvent(
    "participant-left",
    useCallback((ev: any) => {
      const leftId = ev?.participant?.session_id;
      if (leftId) {
        setPinnedId((prev) => (prev === leftId ? null : prev));
      }
    }, [])
  );

  const handlePin = (id: string) => {
    setPinnedId((prev) => (prev === id ? null : id));
  };

  // Sort: pinned first, then active speaker. Ensure both are always in visible set.
  const sortedIds = useMemo(() => {
    const ids = [...filteredIds];
    if (activeSpeakerId && !ids.includes(activeSpeakerId)) {
      ids.push(activeSpeakerId);
    }
    if (pinnedId && !ids.includes(pinnedId)) {
      ids.push(pinnedId);
    }
    return ids.sort((a, b) => {
      if (pinnedId) {
        if (a === pinnedId) return -1;
        if (b === pinnedId) return 1;
      }
      if (a === activeSpeakerId) return -1;
      if (b === activeSpeakerId) return 1;
      return 0;
    });
  }, [filteredIds, pinnedId, activeSpeakerId]);

  const hasScreenShare = screens.length > 0;

  // Pinned view: show pinned participant as main, others in strip
  if (pinnedId && !hasScreenShare) {
    const stripIds = sortedIds.filter((id) => id !== pinnedId).slice(0, 6);

    return (
      <div className="flex flex-col w-full h-full bg-gray-900">
        <LayoutToggle layout={layout} onToggle={setLayout} />
        <div className="flex-1 relative min-h-0">
          <ParticipantTile
            sessionId={pinnedId}
            isSpeaking={pinnedId === activeSpeakerId}
            isPinned
            onPin={handlePin}
          />
        </div>
        {stripIds.length > 0 && (
          <div className="flex gap-1 p-2 bg-gray-950 overflow-x-auto flex-shrink-0">
            {stripIds.map((id) => (
              <div key={id} className="w-36 flex-shrink-0">
                <ParticipantTile sessionId={id} isSpeaking={id === activeSpeakerId} onPin={handlePin} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Speaker view: main speaker + small strip
  if (layout === "speaker" || hasScreenShare) {
    const mainId = hasScreenShare ? null : (activeSpeakerId || sortedIds[0]);
    const stripIds = hasScreenShare
      ? sortedIds.slice(0, 6)
      : sortedIds.filter((id) => id !== mainId).slice(0, 6);

    return (
      <div className="flex flex-col w-full h-full bg-gray-900">
        {/* Layout toggle */}
        {!hasScreenShare && (
          <LayoutToggle layout={layout} onToggle={setLayout} />
        )}

        {/* Main video */}
        <div className="flex-1 relative min-h-0">
          {hasScreenShare ? (
            <div className="relative w-full h-full">
              <DailyVideo
                sessionId={screens[0].session_id}
                type="screenVideo"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-medium px-2 py-0.5">
                Screen Share
              </div>
            </div>
          ) : mainId ? (
            <ParticipantTile
              sessionId={mainId}
              isSpeaking={mainId === activeSpeakerId}
              onPin={handlePin}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Waiting for participants...
            </div>
          )}
        </div>

        {/* Speaker strip */}
        {stripIds.length > 0 && (
          <div className="flex gap-1 p-2 bg-gray-950 overflow-x-auto flex-shrink-0">
            {stripIds.map((id) => (
              <div key={id} className="w-36 flex-shrink-0">
                <ParticipantTile sessionId={id} isSpeaking={id === activeSpeakerId} onPin={handlePin} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Gallery view — sortedIds already filtered by useParticipantIds native filter
  const visibleIds = sortedIds.slice(0, MAX_TILES);
  const overflow = sortedIds.length - visibleIds.length;

  const tileCount = visibleIds.length + screens.length;
  const gridCols =
    tileCount <= 1
      ? "grid-cols-1"
      : tileCount <= 4
      ? "grid-cols-2"
      : "grid-cols-3";

  return (
    <div className="relative w-full h-full bg-gray-900">
      {/* Layout toggle + hide no-video toggle */}
      <LayoutToggle layout={layout} onToggle={setLayout} hideNoVideo={hideNoVideo} onToggleHide={setHideNoVideo} />

      <div className={`grid ${gridCols} gap-1 w-full h-full`}>
        {/* Screen shares */}
        {screens.map((screen) => (
          <div
            key={`screen-${screen.session_id}`}
            className="relative bg-gray-800 aspect-video col-span-full"
          >
            <DailyVideo
              sessionId={screen.session_id}
              type="screenVideo"
              className="w-full h-full object-contain"
            />
            <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-medium px-2 py-0.5">
              Screen Share
            </div>
          </div>
        ))}

        {/* Participant tiles */}
        {visibleIds.map((id) => (
          <ParticipantTile key={id} sessionId={id} isSpeaking={id === activeSpeakerId} onPin={handlePin} />
        ))}

        {/* Overflow */}
        {overflow > 0 && (
          <div className="relative bg-gray-800 aspect-video overflow-hidden flex items-center justify-center">
            <span className="text-gray-300 text-lg font-medium">
              +{overflow} other{overflow !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {participantCounts.present === 0 && screens.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-400">
            Waiting for participants...
          </div>
        )}
      </div>
    </div>
  );
}

function LayoutToggle({
  layout,
  onToggle,
  hideNoVideo,
  onToggleHide,
}: {
  layout: LayoutMode;
  onToggle: (mode: LayoutMode) => void;
  hideNoVideo?: boolean;
  onToggleHide?: (hide: boolean) => void;
}) {
  return (
    <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
      {onToggleHide !== undefined && (
        <button
          onClick={() => onToggleHide?.(!hideNoVideo)}
          className={`px-2 py-1 text-xs cursor-pointer bg-gray-800/80 border border-gray-700 ${
            hideNoVideo ? "text-yellow-400" : "text-gray-400 hover:text-gray-300"
          }`}
          title={hideNoVideo ? "Show all participants" : "Hide participants without video"}
          aria-label={hideNoVideo ? "Show all participants" : "Hide participants without video"}
          aria-pressed={!!hideNoVideo}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {hideNoVideo ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            )}
          </svg>
        </button>
      )}
      <div className="flex bg-gray-800/80 border border-gray-700 text-xs">
        <button
          onClick={() => onToggle("gallery")}
          className={`px-2 py-1 cursor-pointer ${layout === "gallery" ? "bg-yellow-500 text-black" : "text-gray-300 hover:bg-gray-700"}`}
          title="Gallery view"
          aria-label="Gallery view"
          aria-pressed={layout === "gallery"}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </button>
        <button
          onClick={() => onToggle("speaker")}
          className={`px-2 py-1 cursor-pointer ${layout === "speaker" ? "bg-yellow-500 text-black" : "text-gray-300 hover:bg-gray-700"}`}
          title="Speaker view"
          aria-label="Speaker view"
          aria-pressed={layout === "speaker"}
        >
          <User className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

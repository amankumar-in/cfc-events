"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import DailyRoom from "@/components/daily/DailyRoom";
import DailyErrorBoundary from "@/components/daily/DailyErrorBoundary";
import DailyParticipantGrid from "@/components/daily/DailyParticipantGrid";
import DailyControls from "@/components/daily/DailyControls";
import DailyActionOverlay from "@/components/daily/DailyActionOverlay";
import ParticipantNotifications from "@/components/daily/ParticipantNotifications";
import ActionsSidebar from "./ActionsSidebar";
import { useDaily, useParticipantIds } from "@daily-co/daily-react";
import type { LiveStatus } from "@/lib/hooks/useSessionStatus";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LiveControlPanelInnerProps {
  sessionId: string;
  roomName?: string;
  liveStatus: LiveStatus;
  onSendAction: (action: Record<string, unknown>) => void;
  onGoLive: () => Promise<void>;
  onEndSession: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Recording timer helper
// ---------------------------------------------------------------------------

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

// ---------------------------------------------------------------------------
// LiveControlPanelInner
// ---------------------------------------------------------------------------

function LiveControlPanelInner({
  sessionId,
  roomName,
  liveStatus,
  onSendAction,
  onGoLive,
  onEndSession,
}: LiveControlPanelInnerProps) {
  const daily = useDaily();
  const participantIds = useParticipantIds();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const recIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Go live / end session loading
  const [goLiveLoading, setGoLiveLoading] = useState(false);
  const [endLoading, setEndLoading] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);

  // ── Listen for recording events from Daily.co ─────────────────────────

  useEffect(() => {
    if (!daily) return;

    const handleRecordingStarted = () => {
      setIsRecording(true);
      setRecSeconds(0);
    };

    const handleRecordingStopped = () => {
      setIsRecording(false);
      setRecSeconds(0);
      if (recIntervalRef.current) {
        clearInterval(recIntervalRef.current);
        recIntervalRef.current = null;
      }
    };

    daily.on("recording-started", handleRecordingStarted);
    daily.on("recording-stopped", handleRecordingStopped);

    return () => {
      daily.off("recording-started", handleRecordingStarted);
      daily.off("recording-stopped", handleRecordingStopped);
    };
  }, [daily]);

  // ── Recording timer ───────────────────────────────────────────────────

  useEffect(() => {
    if (isRecording) {
      recIntervalRef.current = setInterval(() => {
        setRecSeconds((s) => s + 1);
      }, 1000);
    } else if (recIntervalRef.current) {
      clearInterval(recIntervalRef.current);
      recIntervalRef.current = null;
    }
    return () => {
      if (recIntervalRef.current) {
        clearInterval(recIntervalRef.current);
      }
    };
  }, [isRecording]);

  // ── Recording controls ────────────────────────────────────────────────

  const toggleRecording = useCallback(() => {
    if (!daily) return;
    if (isRecording) {
      daily.stopRecording();
      // Notify all participants recording stopped
      daily.sendAppMessage({ type: "recording-stopped" }, "*");
    } else {
      daily.startRecording();
      // Notify all participants recording started (consent requirement)
      daily.sendAppMessage({ type: "recording-started" }, "*");
    }
  }, [daily, isRecording]);

  // ── Action handler ────────────────────────────────────────────────────

  const handleSendAction = useCallback(
    (action: Record<string, unknown>) => {
      daily?.sendAppMessage({ type: "action", action }, "*");
      onSendAction(action);
    },
    [daily, onSendAction]
  );

  // ── Go Live / End Session ─────────────────────────────────────────────

  const handleGoLive = useCallback(async () => {
    setGoLiveLoading(true);
    try {
      await onGoLive();
    } finally {
      setGoLiveLoading(false);
    }
  }, [onGoLive]);

  const handleEndSession = useCallback(async () => {
    setEndLoading(true);
    try {
      await onEndSession();
    } finally {
      setEndLoading(false);
      setConfirmEnd(false);
    }
  }, [onEndSession]);

  // ── Status badge ──────────────────────────────────────────────────────

  const statusBadge = (() => {
    switch (liveStatus) {
      case "live":
        return (
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 bg-red-600" />
            </span>
            <span className="text-red-400 text-xs font-bold tracking-wider">LIVE</span>
          </div>
        );
      case "ended":
        return (
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 bg-amber-500" />
            <span className="text-amber-400 text-xs font-bold tracking-wider">ENDED</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 bg-gray-500" />
            <span className="text-gray-400 text-xs font-bold tracking-wider">IDLE</span>
          </div>
        );
    }
  })();

  // ── Idle overlay ──────────────────────────────────────────────────────

  if (liveStatus === "idle") {
    return (
      <div className="flex h-full">
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-900 min-w-0">
          <div className="text-center max-w-md px-6">
            <div className="mb-4 flex justify-center">
              <span className="h-4 w-4 bg-gray-500" />
            </div>
            <h2 className="text-white text-xl font-bold mb-2">Session is Idle</h2>
            <p className="text-gray-400 text-sm mb-8">
              The session room is ready. Go live to start broadcasting to viewers.
            </p>
            <button
              onClick={handleGoLive}
              disabled={goLiveLoading}
              className="px-8 py-3 bg-yellow-500 text-black font-bold text-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {goLiveLoading ? "Going Live..." : "Go Live"}
            </button>
          </div>
        </div>
        {/* Sidebar still available for chat / setup */}
        <div className="w-80 xl:w-96 hidden lg:block flex-shrink-0">
          <ActionsSidebar onSendAction={handleSendAction} sessionId={sessionId} roomName={roomName} />
        </div>
      </div>
    );
  }

  // ── Ended overlay ─────────────────────────────────────────────────────

  if (liveStatus === "ended") {
    return (
      <div className="flex h-full">
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-900 min-w-0">
          <div className="text-center max-w-md px-6">
            <div className="mb-4 flex justify-center">
              <span className="h-4 w-4 bg-amber-500" />
            </div>
            <h2 className="text-white text-xl font-bold mb-2">Session Has Ended</h2>
            <p className="text-gray-400 text-sm mb-8">
              This session has concluded. You can restart it if needed.
            </p>
            <button
              onClick={handleGoLive}
              disabled={goLiveLoading}
              className="px-8 py-3 border border-yellow-500 text-yellow-500 font-bold hover:bg-yellow-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {goLiveLoading ? "Restarting..." : "Restart Session"}
            </button>
          </div>
        </div>
        <div className="w-80 xl:w-96 hidden lg:block flex-shrink-0">
          <ActionsSidebar onSendAction={handleSendAction} sessionId={sessionId} roomName={roomName} />
        </div>
      </div>
    );
  }

  // ── Live state: full layout ───────────────────────────────────────────

  return (
    <div className="flex h-full">
      {/* Video area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sub-header: status + viewer count + recording + end */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50 border-b border-gray-700/50 flex-shrink-0">
          <div className="flex items-center gap-4">
            {statusBadge}
            <span className="text-gray-500 text-xs">
              {participantIds.length} viewer{participantIds.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Recording toggle */}
            <button
              onClick={toggleRecording}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium ${
                isRecording
                  ? "bg-red-600 text-white hover:bg-red-500"
                  : "border border-gray-600 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {isRecording ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full bg-white opacity-75" />
                    <span className="relative inline-flex h-2 w-2 bg-white" />
                  </span>
                  REC {formatDuration(recSeconds)}
                </>
              ) : (
                <>
                  <span className="h-2 w-2 bg-red-500" />
                  Record
                </>
              )}
            </button>

            {/* Warn ending soon */}
            <button
              onClick={() => {
                daily?.sendAppMessage(
                  { type: "session-ending-soon", message: "This session is ending in 5 minutes." },
                  "*"
                );
              }}
              className="px-3 py-1.5 text-xs font-medium border border-amber-500/50 text-amber-400 hover:bg-amber-900/20"
              title="Broadcast a warning that the session is ending soon"
            >
              Warn Ending
            </button>

            {/* End Session */}
            {!confirmEnd ? (
              <button
                onClick={() => setConfirmEnd(true)}
                className="px-3 py-1.5 text-xs font-medium border border-red-500/50 text-red-400 hover:bg-red-900/20"
              >
                End Session
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  onClick={handleEndSession}
                  disabled={endLoading}
                  className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white hover:bg-red-500 disabled:opacity-50"
                >
                  {endLoading ? "Ending..." : "Confirm End"}
                </button>
                <button
                  onClick={() => setConfirmEnd(false)}
                  className="px-2 py-1.5 text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Video grid */}
        <div className="flex-1 relative">
          <DailyParticipantGrid />
          <ParticipantNotifications />
        </div>

        {/* Controls bar */}
        <div className="flex items-center bg-gray-900">
          <div className="flex-1">
            <DailyControls isRecording={isRecording} />
          </div>
          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-3 text-white hover:bg-gray-700 mr-2"
            title="Toggle panel"
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Sidebar - desktop: always visible, mobile: overlay */}
      <div className="w-80 xl:w-96 hidden lg:block flex-shrink-0">
        <ActionsSidebar onSendAction={handleSendAction} sessionId={sessionId} roomName={roomName} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed right-0 top-0 bottom-0 w-80 z-50 lg:hidden">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
                <span className="text-white font-medium text-sm">Panel</span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-gray-400 hover:text-white"
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
              <div className="flex-1">
                <ActionsSidebar onSendAction={handleSendAction} sessionId={sessionId} roomName={roomName} />
              </div>
            </div>
          </div>
        </>
      )}

      <DailyActionOverlay sessionId={sessionId} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// LiveControlPanel (default export, wraps in DailyRoom)
// ---------------------------------------------------------------------------

interface LiveControlPanelProps {
  sessionId: string;
  roomUrl: string;
  token?: string;
  liveStatus: LiveStatus;
  onSendAction: (action: Record<string, unknown>) => void;
  onGoLive: () => Promise<void>;
  onEndSession: () => Promise<void>;
}

export default function LiveControlPanel({
  sessionId,
  roomUrl,
  token,
  liveStatus,
  onSendAction,
  onGoLive,
  onEndSession,
}: LiveControlPanelProps) {
  // Extract room name from the Daily.co URL (e.g. https://xxx.daily.co/room-name)
  let roomName: string | undefined;
  try {
    roomName = new URL(roomUrl).pathname.slice(1) || undefined;
  } catch {
    // invalid URL, leave undefined
  }

  return (
    <DailyErrorBoundary>
      <DailyRoom sessionId={sessionId} roomUrl={roomUrl} token={token} userName="Admin">
        <LiveControlPanelInner
          sessionId={sessionId}
          roomName={roomName}
          liveStatus={liveStatus}
          onSendAction={onSendAction}
          onGoLive={onGoLive}
          onEndSession={onEndSession}
        />
      </DailyRoom>
    </DailyErrorBoundary>
  );
}

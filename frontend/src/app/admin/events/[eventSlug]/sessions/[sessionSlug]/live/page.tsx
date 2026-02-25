"use client";

import { use, useCallback, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/useAuth";
import { useSession } from "@/lib/hooks/useSession";
import { sendAction, createRoom, goLive, endSession } from "@/lib/api/daily";
import LiveControlPanel from "@/components/admin/LiveControlPanel";
import { Button } from "@/components/ui/Button";
import type { LiveStatus } from "@/lib/hooks/useSessionStatus";

export default function AdminLivePage({
  params,
}: {
  params: Promise<{ eventSlug: string; sessionSlug: string }>;
}) {
  const { sessionSlug } = use(params);
  const { isAuthenticated, isLoading, token, user } = useAuth();
  const {
    data: session,
    isLoading: sessionLoading,
    refetch: refetchSession,
  } = useSession(sessionSlug);

  // Derive liveStatus from session data, default to "idle"
  const liveStatus: LiveStatus =
    (session?.liveStatus as LiveStatus) || "idle";

  const handleSendAction = useCallback(
    async (action: Record<string, unknown>) => {
      if (!session || !token) return;
      const roomName = (session.dailyRoomName as string) || "";
      if (roomName) {
        try {
          await sendAction(roomName, action, token);
        } catch (err) {
          console.error("Failed to send action:", err);
        }
      }
    },
    [session, token]
  );

  const handleGoLive = useCallback(async () => {
    if (!session || !token) return;
    try {
      await goLive(session.documentId as string, token);
      refetchSession();
    } catch (err) {
      console.error("Failed to go live:", err);
    }
  }, [session, token, refetchSession]);

  const handleEndSession = useCallback(async () => {
    if (!session || !token) return;
    try {
      await endSession(session.documentId as string, token);
      refetchSession();
    } catch (err) {
      console.error("Failed to end session:", err);
    }
  }, [session, token, refetchSession]);

  // ── Loading ───────────────────────────────────────────────────────────

  if (isLoading || sessionLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="w-12 h-12 border-t-2 border-yellow-500 border-solid rounded-full animate-spin" />
      </div>
    );
  }

  // ── Auth gate ─────────────────────────────────────────────────────────

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Authentication Required
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You must be signed in as an admin to access this page.
          </p>
          <Button variant="primary" href="/auth/login">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  // ── No session ────────────────────────────────────────────────────────

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Session Not Found
          </h1>
          <Button variant="primary" href="/">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  // ── No room yet ───────────────────────────────────────────────────────

  const roomUrl = session.dailyRoomUrl as string;
  if (!roomUrl) {
    return (
      <NoRoomFallback
        sessionId={session.documentId as string}
        sessionTitle={session.Title as string}
        token={token!}
        onCreated={() => refetchSession()}
      />
    );
  }

  // ── Status badge for header ───────────────────────────────────────────

  const headerStatusBadge = (() => {
    switch (liveStatus) {
      case "live":
        return (
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 bg-red-600" />
            </span>
            <span className="text-red-400 text-xs font-bold tracking-wider">LIVE</span>
          </div>
        );
      case "ended":
        return (
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 bg-amber-500" />
            <span className="text-amber-400 text-xs font-bold tracking-wider">ENDED</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 bg-gray-500" />
            <span className="text-gray-400 text-xs font-bold tracking-wider">IDLE</span>
          </div>
        );
    }
  })();

  // ── Main layout ───────────────────────────────────────────────────────

  return (
    <main className="bg-gray-900 h-screen flex flex-col overflow-hidden">
      {/* Header bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/events/${(session.event as { Slug?: string })?.Slug ?? ""}/sessions/${session.Slug}`}
            className="text-gray-400 hover:text-white flex-shrink-0"
            title="Back to session"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </Link>
          {headerStatusBadge}
          <div className="min-w-0">
            <h1 className="text-white font-bold text-sm truncate">
              {session.Title as string}
            </h1>
            <p className="text-gray-500 text-xs">Admin Live</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-gray-500 text-xs hidden sm:block">
            {user?.email}
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        <LiveControlPanel
          sessionId={session.documentId as string}
          roomUrl={roomUrl}
          liveStatus={liveStatus}
          onSendAction={handleSendAction}
          onGoLive={handleGoLive}
          onEndSession={handleEndSession}
        />
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// NoRoomFallback
// ---------------------------------------------------------------------------

function NoRoomFallback({
  sessionId,
  sessionTitle,
  token,
  onCreated,
}: {
  sessionId: string;
  sessionTitle: string;
  token: string;
  onCreated: () => void;
}) {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setCreating(true);
    setError(null);
    try {
      await createRoom(sessionId, token);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create room");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          No Room Configured
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          {sessionTitle}
        </p>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          This session does not have a Daily.co room yet. Create one to start
          the live session.
        </p>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button
          onClick={handleCreate}
          disabled={creating}
          className="px-6 py-3 bg-yellow-500 text-black font-bold hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {creating ? "Creating Room..." : "Create Room"}
        </button>
      </div>
    </div>
  );
}

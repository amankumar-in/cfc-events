"use client";

import { use, useCallback } from "react";
import { useAuth } from "@/components/auth/useAuth";
import { useSession } from "@/lib/hooks/useSession";
import { sendAction } from "@/lib/api/daily";
import LiveControlPanel from "@/components/admin/LiveControlPanel";
import { Button } from "@/components/ui/Button";

export default function AdminLivePage({
  params,
}: {
  params: Promise<{ eventSlug: string; sessionSlug: string }>;
}) {
  const { sessionSlug } = use(params);
  const { isAuthenticated, isLoading, token, user } = useAuth();
  const { data: session, isLoading: sessionLoading } = useSession(sessionSlug);

  const handleSendAction = useCallback(
    async (action: Record<string, unknown>) => {
      if (!session || !token) return;
      const roomName = (session.DailyRoomName as string) || "";
      if (roomName) {
        try {
          await sendAction(roomName, JSON.stringify(action), token);
        } catch (err) {
          console.error("Failed to send action:", err);
        }
      }
    },
    [session, token]
  );

  if (isLoading || sessionLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="w-12 h-12 border-t-2 border-yellow-500 border-solid rounded-full animate-spin" />
      </div>
    );
  }

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

  const roomUrl = session.DailyRoomUrl as string;
  if (!roomUrl) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            No Room Configured
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            This session does not have a Daily.co room URL configured.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-gray-900 min-h-screen">
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-white font-bold">{session.Title as string}</h1>
          <p className="text-gray-400 text-sm">Admin Live Controls</p>
        </div>
        <div className="text-gray-400 text-sm">
          Logged in as {user?.email}
        </div>
      </div>
      <LiveControlPanel
        sessionId={session.id as number}
        roomUrl={roomUrl}
        onSendAction={handleSendAction}
      />
    </main>
  );
}

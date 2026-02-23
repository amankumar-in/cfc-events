"use client";

import { useEffect, useState, ReactNode, useCallback } from "react";
import DailyIframe, { DailyCall as DailyCallType } from "@daily-co/daily-js";
import { DailyProvider } from "@daily-co/daily-react";
import { getMeetingToken } from "@/lib/api/daily";
import { getToken } from "@/lib/auth/token";

interface DailyRoomProps {
  sessionId: number;
  roomUrl: string;
  token?: string;
  userName?: string;
  children: ReactNode;
}

export default function DailyRoom({
  sessionId,
  roomUrl,
  token: propToken,
  userName,
  children,
}: DailyRoomProps) {
  const [callObject, setCallObject] = useState<DailyCallType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(true);

  const joinRoom = useCallback(async () => {
    try {
      setJoining(true);
      let meetingToken = propToken;

      if (!meetingToken) {
        const jwt = getToken();
        const res = await getMeetingToken(sessionId, userName, jwt ?? undefined);
        meetingToken = res.token;
      }

      const daily = DailyIframe.createCallObject();
      await daily.join({ url: roomUrl, token: meetingToken });
      setCallObject(daily);
    } catch (err) {
      console.error("Failed to join Daily room:", err);
      setError("Failed to join the session. Please try again.");
    } finally {
      setJoining(false);
    }
  }, [roomUrl, propToken, sessionId, userName]);

  useEffect(() => {
    joinRoom();

    return () => {
      callObject?.leave();
      callObject?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joinRoom]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              joinRoom();
            }}
            className="px-4 py-2 bg-yellow-500 text-black font-medium hover:bg-yellow-400"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (joining || !callObject) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800">
        <div className="text-center">
          <div className="w-10 h-10 border-t-2 border-yellow-500 border-solid rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Joining session...</p>
        </div>
      </div>
    );
  }

  return <DailyProvider callObject={callObject}>{children}</DailyProvider>;
}

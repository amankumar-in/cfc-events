"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useDaily } from "@daily-co/daily-react";

interface Notification {
  id: string;
  message: string;
  type: "join" | "leave" | "screenshare";
}

export default function ParticipantNotifications() {
  const daily = useDaily();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const timerRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  const addNotification = useCallback(
    (message: string, type: Notification["type"]) => {
      const id = `${Date.now()}-${Math.random()}`;
      setNotifications((prev) => [...prev.slice(-4), { id, message, type }]);

      const timer = setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        timerRef.current.delete(id);
      }, 3000);
      timerRef.current.set(id, timer);
    },
    []
  );

  useEffect(() => {
    if (!daily) return;

    const handleJoined = (ev: { participant?: { local?: boolean; user_name?: string } }) => {
      if (ev?.participant?.local) return;
      const name = ev?.participant?.user_name || "Someone";
      addNotification(`${name} joined`, "join");
    };

    const handleLeft = (ev: { participant?: { local?: boolean; user_name?: string } }) => {
      if (ev?.participant?.local) return;
      const name = ev?.participant?.user_name || "Someone";
      addNotification(`${name} left`, "leave");
    };

    const handleTrackStarted = (ev: Record<string, unknown>) => {
      const participant = ev?.participant as { local?: boolean; user_name?: string } | null;
      if (!participant || participant.local) return;
      const track = ev?.track as Record<string, unknown> | undefined;
      if (track?.kind === "screenVideo" || track?.type === "screenVideo") {
        const name = participant.user_name || "Someone";
        addNotification(`${name} started screen sharing`, "screenshare");
      }
    };

    const handleTrackStopped = (ev: Record<string, unknown>) => {
      const participant = ev?.participant as { local?: boolean; user_name?: string } | null;
      if (!participant || participant.local) return;
      const track = ev?.track as Record<string, unknown> | undefined;
      if (track?.kind === "screenVideo" || track?.type === "screenVideo") {
        const name = participant.user_name || "Someone";
        addNotification(`${name} stopped screen sharing`, "screenshare");
      }
    };

    daily.on("participant-joined", handleJoined);
    daily.on("participant-left", handleLeft);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    daily.on("track-started", handleTrackStarted as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    daily.on("track-stopped", handleTrackStopped as any);

    return () => {
      daily.off("participant-joined", handleJoined);
      daily.off("participant-left", handleLeft);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      daily.off("track-started", handleTrackStarted as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      daily.off("track-stopped", handleTrackStopped as any);
      timerRef.current.forEach((timer) => clearTimeout(timer));
      timerRef.current.clear();
    };
  }, [daily, addNotification]);

  if (notifications.length === 0) return null;

  return (
    <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 space-y-1 pointer-events-none">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`px-3 py-1.5 text-xs font-medium text-white shadow-lg ${
            n.type === "join"
              ? "bg-green-600/90"
              : n.type === "screenshare"
              ? "bg-blue-600/90"
              : "bg-gray-600/90"
          }`}
        >
          {n.message}
        </div>
      ))}
    </div>
  );
}

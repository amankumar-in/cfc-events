"use client";

import { useState, useCallback, useEffect } from "react";
import { useDaily, useParticipantIds } from "@daily-co/daily-react";
import { updateRoom } from "@/lib/api/daily";
import { getToken } from "@/lib/auth/token";

interface WaitingParticipant {
  id: string;
  name: string;
}

interface RoomControlsProps {
  roomName?: string;
}

export default function RoomControls({ roomName }: RoomControlsProps) {
  const daily = useDaily();
  const participantIds = useParticipantIds();
  const [chatDisabled, setChatDisabled] = useState(false);
  const [screenShareDisabled, setScreenShareDisabled] = useState(false);
  const [roomLocked, setRoomLocked] = useState(false);
  const [waitingRoomEnabled, setWaitingRoomEnabled] = useState(false);
  const [waitingParticipants, setWaitingParticipants] = useState<WaitingParticipant[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  // Listen for waiting room events
  useEffect(() => {
    if (!daily) return;

    const handleWaitingAdded = (ev: Record<string, unknown>) => {
      const participant = ev?.participant as { id?: string; name?: string } | undefined;
      if (participant?.id) {
        setWaitingParticipants((prev) => {
          if (prev.some((p) => p.id === participant.id)) return prev;
          return [...prev, { id: participant.id!, name: participant.name || "Guest" }];
        });
      }
    };

    const handleWaitingRemoved = (ev: Record<string, unknown>) => {
      const participant = ev?.participant as { id?: string } | undefined;
      if (participant?.id) {
        setWaitingParticipants((prev) => prev.filter((p) => p.id !== participant.id));
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    daily.on("waiting-participant-added" as any, handleWaitingAdded);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    daily.on("waiting-participant-removed" as any, handleWaitingRemoved);

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      daily.off("waiting-participant-added" as any, handleWaitingAdded);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      daily.off("waiting-participant-removed" as any, handleWaitingRemoved);
    };
  }, [daily]);

  const handleAdmitParticipant = useCallback(
    (id: string) => {
      try {
        (daily as unknown as { updateWaitingParticipant: (id: string, opts: { grantRequestedAccess: boolean }) => void })
          ?.updateWaitingParticipant(id, { grantRequestedAccess: true });
        setWaitingParticipants((prev) => prev.filter((p) => p.id !== id));
      } catch (err) {
        console.error("Failed to admit participant:", err);
      }
    },
    [daily]
  );

  const handleDenyParticipant = useCallback(
    (id: string) => {
      try {
        (daily as unknown as { updateWaitingParticipant: (id: string, opts: { grantRequestedAccess: boolean }) => void })
          ?.updateWaitingParticipant(id, { grantRequestedAccess: false });
        setWaitingParticipants((prev) => prev.filter((p) => p.id !== id));
      } catch (err) {
        console.error("Failed to deny participant:", err);
      }
    },
    [daily]
  );

  const handleToggleWaitingRoom = useCallback(async () => {
    if (!roomName) return;
    const next = !waitingRoomEnabled;
    setLoading("waiting");
    try {
      const token = getToken();
      if (token) {
        await updateRoom(roomName, { enable_knocking: next }, token);
      }
      setWaitingRoomEnabled(next);
    } catch (err) {
      console.error("Failed to toggle waiting room:", err);
    } finally {
      setLoading(null);
    }
  }, [roomName, waitingRoomEnabled]);

  const handleToggleChat = useCallback(() => {
    if (!daily) return;
    const next = !chatDisabled;
    daily.sendAppMessage(
      { type: next ? "chat-disabled" : "chat-enabled" },
      "*"
    );
    setChatDisabled(next);
  }, [daily, chatDisabled]);

  const handleToggleScreenShare = useCallback(async () => {
    if (!roomName) return;
    const next = !screenShareDisabled;
    setLoading("screenshare");
    try {
      const token = getToken();
      if (token) {
        await updateRoom(roomName, { enable_screenshare: !next }, token);
      }
      setScreenShareDisabled(next);
    } catch (err) {
      console.error("Failed to update room:", err);
    } finally {
      setLoading(null);
    }
  }, [roomName, screenShareDisabled]);

  const handleToggleLock = useCallback(async () => {
    if (!roomName) return;
    const next = !roomLocked;
    setLoading("lock");
    try {
      const token = getToken();
      if (token) {
        // Lock: set max_participants to current count. Unlock: remove limit (set high).
        const maxParticipants = next ? participantIds.length : 200;
        await updateRoom(roomName, { max_participants: maxParticipants }, token);
      }
      setRoomLocked(next);
    } catch (err) {
      console.error("Failed to toggle room lock:", err);
    } finally {
      setLoading(null);
    }
  }, [roomName, roomLocked, participantIds.length]);

  return (
    <div className="space-y-4">
      <h4 className="font-bold text-gray-900 dark:text-white text-sm">
        Room Controls
      </h4>

      <div className="space-y-3">
        {/* Lock room toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-900 dark:text-white">Lock Room</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {roomLocked
                ? `Locked at ${participantIds.length} participants`
                : "New participants can join"}
            </p>
          </div>
          <button
            onClick={handleToggleLock}
            disabled={loading === "lock"}
            className={`relative w-10 h-5 transition-colors ${
              roomLocked ? "bg-red-500" : "bg-green-500"
            } disabled:opacity-50`}
            role="switch"
            aria-checked={roomLocked}
            aria-label={roomLocked ? "Unlock room" : "Lock room"}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white transition-transform ${
                roomLocked ? "translate-x-5" : ""
              }`}
            />
          </button>
        </div>

        {/* Chat toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-900 dark:text-white">Chat</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {chatDisabled ? "Disabled for viewers" : "Enabled for everyone"}
            </p>
          </div>
          <button
            onClick={handleToggleChat}
            className={`relative w-10 h-5 transition-colors ${
              chatDisabled ? "bg-gray-400" : "bg-green-500"
            }`}
            role="switch"
            aria-checked={!chatDisabled}
            aria-label={chatDisabled ? "Enable chat" : "Disable chat"}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white transition-transform ${
                chatDisabled ? "" : "translate-x-5"
              }`}
            />
          </button>
        </div>

        {/* Waiting room toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-900 dark:text-white">Waiting Room</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {waitingRoomEnabled
                ? `Enabled${waitingParticipants.length > 0 ? ` (${waitingParticipants.length} waiting)` : ""}`
                : "Participants join directly"}
            </p>
          </div>
          <button
            onClick={handleToggleWaitingRoom}
            disabled={loading === "waiting"}
            className={`relative w-10 h-5 transition-colors ${
              waitingRoomEnabled ? "bg-yellow-500" : "bg-gray-400"
            } disabled:opacity-50`}
            role="switch"
            aria-checked={waitingRoomEnabled}
            aria-label={waitingRoomEnabled ? "Disable waiting room" : "Enable waiting room"}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white transition-transform ${
                waitingRoomEnabled ? "translate-x-5" : ""
              }`}
            />
          </button>
        </div>

        {/* Waiting participants list */}
        {waitingRoomEnabled && waitingParticipants.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-2 space-y-1.5">
            <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400">
              Waiting to join:
            </p>
            {waitingParticipants.map((wp) => (
              <div key={wp.id} className="flex items-center justify-between text-xs">
                <span className="text-gray-800 dark:text-gray-200 truncate">{wp.name}</span>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleAdmitParticipant(wp.id)}
                    className="px-2 py-0.5 bg-green-500 text-white text-[10px] font-medium hover:bg-green-400"
                  >
                    Admit
                  </button>
                  <button
                    onClick={() => handleDenyParticipant(wp.id)}
                    className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-medium hover:bg-red-400"
                  >
                    Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Screen share toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-900 dark:text-white">
              Screen Share
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {screenShareDisabled
                ? "Disabled for viewers"
                : "Enabled for everyone"}
            </p>
          </div>
          <button
            onClick={handleToggleScreenShare}
            disabled={loading === "screenshare"}
            className={`relative w-10 h-5 transition-colors ${
              screenShareDisabled ? "bg-gray-400" : "bg-green-500"
            } disabled:opacity-50`}
            role="switch"
            aria-checked={!screenShareDisabled}
            aria-label={
              screenShareDisabled
                ? "Enable screen share"
                : "Disable screen share"
            }
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white transition-transform ${
                screenShareDisabled ? "" : "translate-x-5"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

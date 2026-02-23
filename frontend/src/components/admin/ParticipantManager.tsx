"use client";

import { useParticipantIds, useDaily } from "@daily-co/daily-react";
import { useCallback } from "react";

export default function ParticipantManager() {
  const daily = useDaily();
  const participantIds = useParticipantIds();
  const participants = daily?.participants() ?? {};

  const updateParticipant = useCallback(
    (sessionId: string, updates: Record<string, boolean>) => {
      daily?.updateParticipant(sessionId, updates);
    },
    [daily]
  );

  return (
    <div className="space-y-2">
      <h4 className="font-bold text-gray-900 dark:text-white text-sm">
        Participants ({participantIds.length})
      </h4>

      <div className="max-h-64 overflow-y-auto space-y-1">
        {participantIds.map((id) => {
          const p = participants[id];
          if (!p) return null;
          const name = p.user_name || "Guest";
          const isLocal = p.local;

          return (
            <div
              key={id}
              className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 text-sm"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`w-2 h-2 flex-shrink-0 ${
                    p.audio ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span className="text-gray-900 dark:text-white truncate">
                  {name}
                  {isLocal && (
                    <span className="text-gray-400 ml-1">(You)</span>
                  )}
                </span>
              </div>

              {!isLocal && (
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() =>
                      updateParticipant(id, {
                        setAudio: !p.audio,
                      })
                    }
                    className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                    title={p.audio ? "Mute" : "Unmute"}
                  >
                    {p.audio ? "Mute" : "Unmute"}
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {participantIds.length === 0 && (
          <p className="text-gray-400 text-sm">No participants yet</p>
        )}
      </div>
    </div>
  );
}

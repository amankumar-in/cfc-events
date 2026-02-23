"use client";

import { useParticipantIds, DailyVideo } from "@daily-co/daily-react";

export default function DailyParticipantGrid() {
  const participantIds = useParticipantIds();

  const gridCols =
    participantIds.length <= 1
      ? "grid-cols-1"
      : participantIds.length <= 4
      ? "grid-cols-2"
      : participantIds.length <= 9
      ? "grid-cols-3"
      : "grid-cols-4";

  return (
    <div className={`grid ${gridCols} gap-1 w-full h-full bg-gray-900`}>
      {participantIds.map((id) => (
        <div key={id} className="relative bg-gray-800 aspect-video">
          <DailyVideo
            automirror
            sessionId={id}
            type="video"
            className="w-full h-full object-cover"
          />
        </div>
      ))}
      {participantIds.length === 0 && (
        <div className="flex items-center justify-center h-full text-gray-400">
          Waiting for participants...
        </div>
      )}
    </div>
  );
}

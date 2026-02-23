"use client";

import { useActiveSpeakerId, DailyVideo } from "@daily-co/daily-react";
import DailyChat from "./DailyChat";
import DailyActionOverlay from "./DailyActionOverlay";

export default function DailyLivestream() {
  const activeSpeakerId = useActiveSpeakerId();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex">
        {/* Active speaker video */}
        <div className="flex-1 bg-gray-900 relative min-w-0">
          {activeSpeakerId ? (
            <DailyVideo
              automirror
              sessionId={activeSpeakerId}
              type="video"
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p>Waiting for the stream to begin...</p>
              </div>
            </div>
          )}
        </div>

        {/* Chat sidebar */}
        <div className="w-80 hidden lg:block">
          <DailyChat />
        </div>
      </div>

      <DailyActionOverlay />
    </div>
  );
}

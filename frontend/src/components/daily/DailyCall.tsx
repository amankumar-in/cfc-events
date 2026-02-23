"use client";

import DailyParticipantGrid from "./DailyParticipantGrid";
import DailyControls from "./DailyControls";
import DailyChat from "./DailyChat";
import DailyActionOverlay from "./DailyActionOverlay";

export default function DailyCall() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex">
        <div className="flex-1 min-w-0">
          <DailyParticipantGrid />
        </div>
        <div className="w-80 hidden lg:block">
          <DailyChat />
        </div>
      </div>
      <DailyControls />
      <DailyActionOverlay />
    </div>
  );
}

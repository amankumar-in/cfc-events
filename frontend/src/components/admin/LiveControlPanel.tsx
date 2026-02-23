"use client";

import { useCallback } from "react";
import DailyRoom from "@/components/daily/DailyRoom";
import DailyParticipantGrid from "@/components/daily/DailyParticipantGrid";
import DailyControls from "@/components/daily/DailyControls";
import ActionsSidebar from "./ActionsSidebar";
import { useDaily } from "@daily-co/daily-react";

interface LiveControlPanelInnerProps {
  onSendAction: (action: Record<string, unknown>) => void;
}

function LiveControlPanelInner({ onSendAction }: LiveControlPanelInnerProps) {
  const daily = useDaily();

  const handleSendAction = useCallback(
    (action: Record<string, unknown>) => {
      // Send via Daily app message to all participants
      daily?.sendAppMessage({ type: "action", action }, "*");
      // Also call backend API
      onSendAction(action);
    },
    [daily, onSendAction]
  );

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Video area - 2/3 */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1">
          <DailyParticipantGrid />
        </div>
        <DailyControls />
      </div>

      {/* Controls sidebar - 1/3 */}
      <div className="w-96 hidden lg:block">
        <ActionsSidebar onSendAction={handleSendAction} />
      </div>
    </div>
  );
}

interface LiveControlPanelProps {
  sessionId: number;
  roomUrl: string;
  token?: string;
  onSendAction: (action: Record<string, unknown>) => void;
}

export default function LiveControlPanel({
  sessionId,
  roomUrl,
  token,
  onSendAction,
}: LiveControlPanelProps) {
  return (
    <DailyRoom sessionId={sessionId} roomUrl={roomUrl} token={token} userName="Admin">
      <LiveControlPanelInner onSendAction={onSendAction} />
    </DailyRoom>
  );
}

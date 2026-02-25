"use client";

import { useState, useCallback } from "react";
import DailyParticipantGrid from "./DailyParticipantGrid";
import DailyControls from "./DailyControls";
import DailyChat from "./DailyChat";
import DailyActionOverlay from "./DailyActionOverlay";
import ParticipantNotifications from "./ParticipantNotifications";

interface DailyCallProps {
  onLeave?: () => void;
  isRecording?: boolean;
  sessionId: string;
  isAdmin?: boolean;
}

export default function DailyCall({ onLeave, isRecording, sessionId, isAdmin }: DailyCallProps) {
  const [chatOpen, setChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleUnreadChange = useCallback(
    (count: number) => {
      if (!chatOpen) setUnreadCount(count);
    },
    [chatOpen]
  );

  const toggleChat = () => {
    setChatOpen((prev) => {
      if (!prev) setUnreadCount(0);
      return !prev;
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex min-h-0">
        <div className="flex-1 min-w-0 relative">
          <DailyParticipantGrid />
          <ParticipantNotifications />
        </div>
        <div className="w-80 hidden lg:flex flex-col border-l border-gray-700">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Chat</h3>
          </div>
          <div className="flex-1 min-h-0">
            <DailyChat sessionId={sessionId} isAdmin={isAdmin} onUnreadChange={handleUnreadChange} />
          </div>
        </div>
      </div>
      <DailyControls onLeave={onLeave} isRecording={isRecording} />

      {/* Mobile chat toggle */}
      <button
        onClick={toggleChat}
        className="lg:hidden fixed bottom-20 right-4 z-30 p-3 bg-gray-700 text-white hover:bg-gray-600 shadow-lg"
        title="Toggle chat"
        aria-label={`Toggle chat${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Mobile chat overlay */}
      {chatOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setChatOpen(false)}
          />
          <div className="fixed right-0 top-0 bottom-0 w-80 z-50 lg:hidden flex flex-col bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Chat</h3>
              <button
                onClick={() => setChatOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
                aria-label="Close chat"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <DailyChat sessionId={sessionId} isAdmin={isAdmin} onUnreadChange={handleUnreadChange} />
            </div>
          </div>
        </>
      )}

      <DailyActionOverlay sessionId={sessionId} />
    </div>
  );
}

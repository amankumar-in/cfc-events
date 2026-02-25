"use client";

import { useState, useEffect } from "react";
import PollCreator from "./PollCreator";
import AnnouncementSender from "./AnnouncementSender";
import DownloadLinkSender from "./DownloadLinkSender";
import RoomControls from "./RoomControls";
import ParticipantManager from "./ParticipantManager";
import DailyChat from "@/components/daily/DailyChat";
import { getActiveActions } from "@/lib/api/daily";

type Tab = "chat" | "participants" | "actions";

function ActionHistory({ sessionId }: { sessionId: string }) {
  const [actions, setActions] = useState<{ type: string; payload: Record<string, unknown> }[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!sessionId || loaded) return;
    setLoaded(true);
    getActiveActions(sessionId)
      .then((data: unknown) => {
        if (Array.isArray(data)) setActions(data);
      })
      .catch(() => {});
  }, [sessionId, loaded]);

  if (actions.length === 0) return null;

  return (
    <div>
      <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-2">Action History</h4>
      <div className="space-y-1.5 max-h-40 overflow-y-auto">
        {actions.map((a, i) => (
          <div key={i} className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-2 py-1.5">
            <span className="font-medium text-gray-800 dark:text-gray-200 capitalize">{a.type}</span>
            {a.type === "poll" && !!(a.payload as Record<string, unknown>)?.question && (
              <span className="ml-1">— {String((a.payload as Record<string, unknown>).question)}</span>
            )}
            {a.type === "announcement" && !!(a.payload as Record<string, unknown>)?.message && (
              <span className="ml-1">— {String((a.payload as Record<string, unknown>).message).slice(0, 50)}</span>
            )}
            {a.type === "download" && !!(a.payload as Record<string, unknown>)?.label && (
              <span className="ml-1">— {String((a.payload as Record<string, unknown>).label)}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface ActionsSidebarProps {
  onSendAction: (action: Record<string, unknown>) => void;
  sessionId?: string;
  roomName?: string;
}

export default function ActionsSidebar({ onSendAction, sessionId, roomName }: ActionsSidebarProps) {
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    if (typeof window !== "undefined") {
      return (sessionStorage.getItem("admin-sidebar-tab") as Tab) || "chat";
    }
    return "chat";
  });

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    sessionStorage.setItem("admin-sidebar-tab", tab);
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    {
      key: "chat",
      label: "Chat",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      key: "participants",
      label: "People",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
      {/* Tab bar */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-xs font-medium ${
              activeTab === tab.key
                ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-b-2 border-yellow-500"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === "chat" ? (
          <DailyChat sessionId={sessionId || ""} isAdmin />
        ) : activeTab === "participants" ? (
          <div className="flex-1 overflow-y-auto p-4">
            <ParticipantManager />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <RoomControls roomName={roomName} />
            <hr className="border-gray-200 dark:border-gray-700" />
            <PollCreator
              onSend={(poll) =>
                onSendAction({
                  type: "poll",
                  question: poll.question,
                  options: poll.options.map((label) => ({ label })),
                })
              }
            />
            <hr className="border-gray-200 dark:border-gray-700" />
            <AnnouncementSender
              onSend={(data) =>
                onSendAction({ type: "announcement", ...data })
              }
            />
            <hr className="border-gray-200 dark:border-gray-700" />
            <DownloadLinkSender
              onSend={(data) =>
                onSendAction({ type: "download", ...data })
              }
            />
            {sessionId && (
              <>
                <hr className="border-gray-200 dark:border-gray-700" />
                <ActionHistory sessionId={sessionId} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

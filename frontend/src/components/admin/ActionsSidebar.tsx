"use client";

import { useState } from "react";
import PollCreator from "./PollCreator";
import AnnouncementSender from "./AnnouncementSender";
import DownloadLinkSender from "./DownloadLinkSender";
import ParticipantManager from "./ParticipantManager";

type Tab = "actions" | "participants";

interface ActionsSidebarProps {
  onSendAction: (action: Record<string, unknown>) => void;
}

export default function ActionsSidebar({ onSendAction }: ActionsSidebarProps) {
  const [activeTab, setActiveTab] = useState<Tab>("actions");

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
      {/* Tab bar */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("actions")}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeTab === "actions"
              ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-b-2 border-yellow-500"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          Actions
        </button>
        <button
          onClick={() => setActiveTab("participants")}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeTab === "participants"
              ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-b-2 border-yellow-500"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          Participants
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activeTab === "actions" ? (
          <>
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
          </>
        ) : (
          <ParticipantManager />
        )}
      </div>
    </div>
  );
}

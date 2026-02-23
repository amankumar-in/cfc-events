"use client";

import { useState, useCallback } from "react";
import { useAppMessage } from "@daily-co/daily-react";

interface PollOption {
  label: string;
  votes?: number;
}

interface PollAction {
  type: "poll";
  question: string;
  options: PollOption[];
}

interface AnnouncementAction {
  type: "announcement";
  message: string;
  link?: string;
}

interface DownloadAction {
  type: "download";
  label: string;
  url: string;
}

type ActionPayload = PollAction | AnnouncementAction | DownloadAction;

export default function DailyActionOverlay() {
  const [activePoll, setActivePoll] = useState<PollAction | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [announcements, setAnnouncements] = useState<AnnouncementAction[]>([]);
  const [downloads, setDownloads] = useState<DownloadAction[]>([]);

  useAppMessage({
    onAppMessage: useCallback(
      (ev: { data: { type?: string; action?: ActionPayload } }) => {
        const action = ev.data.action;
        if (!action) return;

        switch (action.type) {
          case "poll":
            setActivePoll(action);
            setSelectedOption(null);
            break;
          case "announcement":
            setAnnouncements((prev) => [...prev, action]);
            setTimeout(() => {
              setAnnouncements((prev) => prev.slice(1));
            }, 10000);
            break;
          case "download":
            setDownloads((prev) => [...prev, action]);
            break;
        }
      },
      []
    ),
  });

  return (
    <>
      {/* Poll Modal */}
      {activePoll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full mx-4">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
              {activePoll.question}
            </h3>
            <div className="space-y-2 mb-6">
              {activePoll.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedOption(i)}
                  className={`w-full text-left px-4 py-3 border ${
                    selectedOption === i
                      ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                      : "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  } text-gray-900 dark:text-white`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setActivePoll(null)}
                className="flex-1 px-4 py-2 bg-yellow-500 text-black font-medium hover:bg-yellow-400 disabled:opacity-50"
                disabled={selectedOption === null}
              >
                Submit
              </button>
              <button
                onClick={() => setActivePoll(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Announcement Toasts */}
      <div className="fixed top-20 right-4 z-40 space-y-2 max-w-sm">
        {announcements.map((ann, i) => (
          <div
            key={i}
            className="bg-blue-600 text-white p-4 shadow-lg animate-slide-in"
          >
            <p className="font-medium text-sm">{ann.message}</p>
            {ann.link && (
              <a
                href={ann.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs underline mt-1 inline-block"
              >
                Learn more
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Download Cards */}
      {downloads.length > 0 && (
        <div className="fixed bottom-20 right-4 z-40 space-y-2 max-w-sm">
          {downloads.map((dl, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 shadow-lg flex items-center gap-3"
            >
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {dl.label}
                </p>
              </div>
              <a
                href={dl.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-yellow-500 text-black text-xs font-medium hover:bg-yellow-400 flex-shrink-0"
              >
                Download
              </a>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

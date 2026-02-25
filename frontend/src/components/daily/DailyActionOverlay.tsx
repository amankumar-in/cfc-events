"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useAppMessage, useDaily } from "@daily-co/daily-react";
import { getActiveActions } from "@/lib/api/daily";

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

interface DailyActionOverlayProps {
  sessionId: string;
}

function useFocusTrap(ref: React.RefObject<HTMLDivElement | null>, active: boolean) {
  useEffect(() => {
    if (!active || !ref.current) return;

    const el = ref.current;
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length > 0) focusable[0].focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    el.addEventListener("keydown", handleKeyDown);
    return () => el.removeEventListener("keydown", handleKeyDown);
  }, [ref, active]);
}

export default function DailyActionOverlay({ sessionId }: DailyActionOverlayProps) {
  const daily = useDaily();
  const promotionRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<HTMLDivElement>(null);
  const [activePoll, setActivePoll] = useState<PollAction | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [pollSubmitted, setPollSubmitted] = useState(false);
  const [announcements, setAnnouncements] = useState<AnnouncementAction[]>([]);
  const [downloads, setDownloads] = useState<DownloadAction[]>([]);
  const [promotionPrompt, setPromotionPrompt] = useState(false);
  const [endingSoon, setEndingSoon] = useState<string | null>(null);

  // Focus traps for modals
  useFocusTrap(promotionRef, promotionPrompt);
  useFocusTrap(pollRef, !!activePoll);

  // -------------------------------------------------------------------------
  // Fetch active actions for late joiners
  // -------------------------------------------------------------------------

  useEffect(() => {
    getActiveActions(sessionId)
      .then((data: unknown) => {
        const actions = data as { type: string; payload: Record<string, unknown> }[];
        if (!Array.isArray(actions)) return;
        for (const entry of actions) {
          const action = entry.payload as unknown as ActionPayload;
          if (!action) continue;
          switch (entry.type) {
            case "poll":
              setActivePoll(action as PollAction);
              setSelectedOption(null);
              setPollSubmitted(false);
              break;
            case "download":
              setDownloads((prev) => {
                const dl = action as DownloadAction;
                if (prev.some((d) => d.url === dl.url)) return prev;
                return [...prev, dl];
              });
              break;
            case "announcement":
              setAnnouncements((prev) => [...prev, action as AnnouncementAction]);
              setTimeout(() => {
                setAnnouncements((p) => p.slice(1));
              }, 10000);
              break;
          }
        }
      })
      .catch((err: unknown) => console.warn("Failed to load active actions:", err));
  }, [sessionId]);

  // -------------------------------------------------------------------------
  // Listen for live actions
  // -------------------------------------------------------------------------

  useAppMessage({
    onAppMessage: useCallback(
      (ev: { data: Record<string, unknown> }) => {
        // Co-host assignment/removal
        if (ev.data.type === "co-host-assigned") {
          setAnnouncements((prev) => [
            ...prev,
            {
              type: "announcement",
              message: (ev.data.message as string) || "You have been made a co-host",
            },
          ]);
          setTimeout(() => setAnnouncements((p) => p.slice(1)), 5000);
          return;
        }
        if (ev.data.type === "co-host-removed") {
          setAnnouncements((prev) => [
            ...prev,
            {
              type: "announcement",
              message: (ev.data.message as string) || "Your co-host role has been removed",
            },
          ]);
          setTimeout(() => setAnnouncements((p) => p.slice(1)), 5000);
          return;
        }

        // Promote/demote
        if (ev.data.type === "promote") {
          setPromotionPrompt(true);
          return;
        }
        if (ev.data.type === "demote") {
          daily?.setLocalAudio(false);
          daily?.setLocalVideo(false);
          setPromotionPrompt(false);
          try { sessionStorage.removeItem("daily-was-promoted"); } catch {}
          setAnnouncements((prev) => [
            ...prev,
            {
              type: "announcement",
              message: (ev.data.message as string) || "You have been moved to audience",
            },
          ]);
          setTimeout(() => {
            setAnnouncements((p) => p.slice(1));
          }, 5000);
          return;
        }

        // Session ending soon
        if (ev.data.type === "session-ending-soon") {
          const msg = (ev.data.message as string) || "This session is ending soon.";
          setEndingSoon(msg);
          setTimeout(() => setEndingSoon(null), 30_000);
          return;
        }

        // Session status
        if (ev.data.type === "session-status" && ev.data.status === "ended") {
          setAnnouncements((prev) => [
            ...prev,
            { type: "announcement", message: "This session has ended." },
          ]);
          return;
        }

        const action = ev.data.action as ActionPayload | undefined;
        if (!action) return;

        switch (action.type) {
          case "poll":
            setActivePoll(action);
            setSelectedOption(null);
            setPollSubmitted(false);
            break;
          case "announcement":
            setAnnouncements((prev) => [...prev, action]);
            setTimeout(() => {
              setAnnouncements((p) => p.slice(1));
            }, 10000);
            break;
          case "download":
            setDownloads((prev) => [...prev, action]);
            break;
        }
      },
      [daily]
    ),
  });

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  const handleAcceptPromotion = () => {
    daily?.setLocalAudio(true);
    daily?.setLocalVideo(true);
    setPromotionPrompt(false);
    // Persist promoted status for reconnection
    try { sessionStorage.setItem("daily-was-promoted", "true"); } catch {}
  };

  const handleDeclinePromotion = () => {
    setPromotionPrompt(false);
  };

  const handlePollSubmit = () => {
    if (selectedOption === null || !activePoll) return;
    // Send vote back to admin
    daily?.sendAppMessage(
      {
        type: "poll-vote",
        question: activePoll.question,
        selectedIndex: selectedOption,
        selectedLabel: activePoll.options[selectedOption]?.label,
      },
      "*"
    );
    setPollSubmitted(true);
  };

  const handleDismissDownload = (index: number) => {
    setDownloads((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDismissAnnouncement = (index: number) => {
    setAnnouncements((prev) => prev.filter((_, i) => i !== index));
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <>
      {/* Promotion Prompt */}
      {promotionPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true" aria-label="Promotion prompt">
          <div ref={promotionRef} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 max-w-sm w-full mx-4">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
              You&apos;ve been promoted!
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
              The host has invited you to speak. Your camera and microphone will
              be turned on.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleAcceptPromotion}
                className="flex-1 px-4 py-2 bg-yellow-500 text-black font-medium hover:bg-yellow-400"
              >
                Join as Speaker
              </button>
              <button
                onClick={handleDeclinePromotion}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Poll Modal */}
      {activePoll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true" aria-label="Poll">
          <div ref={pollRef} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full mx-4">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
              {activePoll.question}
            </h3>
            {!pollSubmitted ? (
              <>
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
                      aria-pressed={selectedOption === i}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handlePollSubmit}
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
              </>
            ) : (
              <div className="text-center py-4">
                <svg className="w-10 h-10 text-green-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Vote submitted: {activePoll.options[selectedOption!]?.label}
                </p>
                <button
                  onClick={() => setActivePoll(null)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Session ending soon warning */}
      {endingSoon && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-amber-600 text-white px-4 py-2 text-sm font-medium shadow-lg">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {endingSoon}
          <button onClick={() => setEndingSoon(null)} className="ml-1 hover:opacity-70" aria-label="Dismiss">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Announcement Toasts — top center, not overlapping viewer count */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 space-y-2 max-w-sm w-full px-4 pointer-events-none">
        {announcements.map((ann, i) => (
          <div
            key={i}
            className="bg-blue-600 text-white p-4 shadow-lg pointer-events-auto flex items-start gap-2"
          >
            <div className="flex-1">
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
            <button
              onClick={() => handleDismissAnnouncement(i)}
              className="text-white/70 hover:text-white flex-shrink-0"
              aria-label="Dismiss announcement"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Download Cards — bottom left, not overlapping controls */}
      {downloads.length > 0 && (
        <div className="fixed bottom-24 left-4 z-40 space-y-2 max-w-xs">
          {downloads.map((dl, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 shadow-lg flex items-center gap-3"
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
              <button
                onClick={() => handleDismissDownload(i)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white flex-shrink-0"
                aria-label="Dismiss download"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

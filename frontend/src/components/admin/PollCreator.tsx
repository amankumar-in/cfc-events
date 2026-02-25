"use client";

import { useState, useCallback } from "react";
import { useAppMessage } from "@daily-co/daily-react";

interface PollCreatorProps {
  onSend: (poll: { question: string; options: string[] }) => void;
}

interface PollVote {
  selectedIndex: number;
  selectedLabel: string;
}

interface ActivePoll {
  question: string;
  options: string[];
  votes: Map<string, PollVote>;
}

export default function PollCreator({ onSend }: PollCreatorProps) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [activePoll, setActivePoll] = useState<ActivePoll | null>(null);

  // Listen for poll votes from participants
  useAppMessage({
    onAppMessage: useCallback(
      (ev: { data: Record<string, unknown>; fromId: string }) => {
        if (ev.data.type !== "poll-vote") return;
        const selectedIndex = ev.data.selectedIndex as number;
        const selectedLabel = ev.data.selectedLabel as string;

        setActivePoll((prev) => {
          if (!prev) return prev;
          const nextVotes = new Map(prev.votes);
          nextVotes.set(ev.fromId, { selectedIndex, selectedLabel });
          return { ...prev, votes: nextVotes };
        });
      },
      []
    ),
  });

  const addOption = () => setOptions((prev) => [...prev, ""]);

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, value: string) => {
    setOptions((prev) => prev.map((opt, i) => (i === index ? value : opt)));
  };

  const handleSend = () => {
    if (!question.trim() || options.some((o) => !o.trim())) return;
    const trimmedOptions = options.map((o) => o.trim());
    const trimmedQuestion = question.trim();

    onSend({ question: trimmedQuestion, options: trimmedOptions });

    // Track as active poll
    setActivePoll({
      question: trimmedQuestion,
      options: trimmedOptions,
      votes: new Map(),
    });

    setQuestion("");
    setOptions(["", ""]);
  };

  const handleClosePoll = () => {
    setActivePoll(null);
  };

  const isValid = question.trim() && options.every((o) => o.trim());

  // Calculate vote results
  const voteResults = activePoll
    ? activePoll.options.map((label, i) => {
        const count = Array.from(activePoll.votes.values()).filter(
          (v) => v.selectedIndex === i
        ).length;
        return { label, count };
      })
    : [];
  const totalVotes = activePoll ? activePoll.votes.size : 0;

  return (
    <div className="space-y-4">
      <h4 className="font-bold text-gray-900 dark:text-white text-sm">
        Create Poll
      </h4>

      {/* Active poll results */}
      {activePoll && (
        <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 p-3 space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="font-medium text-gray-900 dark:text-white text-sm">
              {activePoll.question}
            </h5>
            <button
              onClick={handleClosePoll}
              className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Close
            </button>
          </div>
          <div className="space-y-2">
            {voteResults.map((result, i) => {
              const pct =
                totalVotes > 0
                  ? Math.round((result.count / totalVotes) * 100)
                  : 0;
              return (
                <div key={i}>
                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <span className="text-gray-700 dark:text-gray-300">
                      {result.label}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {result.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-600 overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Create new poll form */}
      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Poll question"
        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      />

      <div className="space-y-2">
        {options.map((opt, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={opt}
              onChange={(e) => updateOption(i, e.target.value)}
              placeholder={`Option ${i + 1}`}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            {options.length > 2 && (
              <button
                onClick={() => removeOption(i)}
                className="px-2 text-red-600 hover:text-red-500 text-sm"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={addOption}
        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
      >
        + Add option
      </button>

      <button
        onClick={handleSend}
        disabled={!isValid}
        className="w-full px-4 py-2 bg-yellow-500 text-black text-sm font-medium hover:bg-yellow-400 disabled:opacity-50"
      >
        {activePoll ? "Send New Poll" : "Send Poll"}
      </button>
    </div>
  );
}

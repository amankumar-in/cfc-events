"use client";

import { useState } from "react";

interface PollCreatorProps {
  onSend: (poll: { question: string; options: string[] }) => void;
}

export default function PollCreator({ onSend }: PollCreatorProps) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);

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
    onSend({ question: question.trim(), options: options.map((o) => o.trim()) });
    setQuestion("");
    setOptions(["", ""]);
  };

  const isValid = question.trim() && options.every((o) => o.trim());

  return (
    <div className="space-y-4">
      <h4 className="font-bold text-gray-900 dark:text-white text-sm">Create Poll</h4>

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
        Send Poll
      </button>
    </div>
  );
}

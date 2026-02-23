"use client";

import { useState } from "react";

interface DownloadLinkSenderProps {
  onSend: (data: { label: string; url: string }) => void;
}

export default function DownloadLinkSender({ onSend }: DownloadLinkSenderProps) {
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");

  const handleSend = () => {
    if (!label.trim() || !url.trim()) return;
    onSend({ label: label.trim(), url: url.trim() });
    setLabel("");
    setUrl("");
  };

  const isValid = label.trim() && url.trim();

  return (
    <div className="space-y-4">
      <h4 className="font-bold text-gray-900 dark:text-white text-sm">
        Share Download Link
      </h4>

      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="File name / label"
        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      />

      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Download URL"
        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      />

      <button
        onClick={handleSend}
        disabled={!isValid}
        className="w-full px-4 py-2 bg-green-600 text-white text-sm font-medium hover:bg-green-500 disabled:opacity-50"
      >
        Send Download Link
      </button>
    </div>
  );
}

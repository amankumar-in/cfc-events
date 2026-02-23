"use client";

import { useState } from "react";

interface AnnouncementSenderProps {
  onSend: (data: { message: string; link?: string }) => void;
}

export default function AnnouncementSender({ onSend }: AnnouncementSenderProps) {
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;
    onSend({ message: message.trim(), link: link.trim() || undefined });
    setMessage("");
    setLink("");
  };

  return (
    <div className="space-y-4">
      <h4 className="font-bold text-gray-900 dark:text-white text-sm">
        Send Announcement
      </h4>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Announcement message"
        rows={3}
        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      />

      <input
        value={link}
        onChange={(e) => setLink(e.target.value)}
        placeholder="Optional link URL"
        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      />

      <button
        onClick={handleSend}
        disabled={!message.trim()}
        className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
      >
        Send Announcement
      </button>
    </div>
  );
}

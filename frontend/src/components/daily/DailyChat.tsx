"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useDaily, useAppMessage } from "@daily-co/daily-react";

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
}

export default function DailyChat() {
  const daily = useDaily();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useAppMessage({
    onAppMessage: useCallback(
      (ev: { data: { type?: string; text?: string; sender?: string }; fromId: string }) => {
        if (ev.data.type === "chat") {
          setMessages((prev) => [
            ...prev,
            {
              id: `${ev.fromId}-${Date.now()}`,
              sender: ev.data.sender || "Unknown",
              text: ev.data.text || "",
              timestamp: Date.now(),
            },
          ]);
        }
      },
      []
    ),
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !daily) return;
    const localName =
      daily.participants()?.local?.user_name || "You";
    daily.sendAppMessage(
      { type: "chat", text: input.trim(), sender: localName },
      "*"
    );
    setMessages((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        sender: localName,
        text: input.trim(),
        timestamp: Date.now(),
      },
    ]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm">Chat</h3>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-gray-400 text-sm text-center">No messages yet</p>
        )}
        {messages.map((msg) => (
          <div key={msg.id}>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
              {msg.sender}
            </span>
            <p className="text-sm text-gray-800 dark:text-gray-200">{msg.text}</p>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-yellow-500 text-black text-sm font-medium hover:bg-yellow-400"
        >
          Send
        </button>
      </div>
    </div>
  );
}

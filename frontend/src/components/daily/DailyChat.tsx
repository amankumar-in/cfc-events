"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useDaily, useAppMessage } from "@daily-co/daily-react";
import { saveChatMessage, getChatMessages, deleteChatMessage } from "@/lib/api/daily";
import { getToken } from "@/lib/auth/token";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChatMessage {
  id: string;
  sender: string;
  senderId: string | null;
  text: string;
  timestamp: number;
  deleted?: boolean;
  reactions?: Record<string, string[]>; // emoji → sender names
  replyTo?: { id: string; sender: string; text: string };
  isDm?: boolean;
  dmTarget?: string; // sender name of DM recipient
}

interface DailyChatProps {
  className?: string;
  sessionId: string;
  isAdmin?: boolean;
  onUnreadChange?: (count: number) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(ts: number): string {
  const d = new Date(ts);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

function isSameGroup(prev: ChatMessage | null, curr: ChatMessage): boolean {
  if (!prev) return false;
  return (
    prev.sender === curr.sender &&
    curr.timestamp - prev.timestamp < 2 * 60 * 1000
  );
}

const URL_REGEX = /https?:\/\/[^\s<]+/g;
const MENTION_REGEX = /@(\w+)/g;

function renderMessageText(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  const combined = new RegExp(`(${URL_REGEX.source})|(${MENTION_REGEX.source})`, "g");
  let match: RegExpExecArray | null;

  while ((match = combined.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[1]) {
      // URL match
      parts.push(
        <a
          key={match.index}
          href={match[1]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 underline break-all"
        >
          {match[1].length > 50 ? match[1].slice(0, 47) + "..." : match[1]}
        </a>
      );
    } else if (match[2]) {
      // @mention match
      parts.push(
        <span key={match.index} className="text-yellow-400 font-medium">
          {match[2]}
        </span>
      );
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

const REACTION_EMOJIS = ["👍", "❤️", "😂", "🎉"];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DailyChat({ className, sessionId, isAdmin, onUnreadChange }: DailyChatProps) {
  const daily = useDaily();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [chatDisabled, setChatDisabled] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ id: string; sender: string; text: string } | null>(null);
  const [dmTarget, setDmTarget] = useState<{ sessionId: string; name: string } | null>(null);

  // Scroll management
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const loadedRef = useRef(false);

  // -------------------------------------------------------------------------
  // Load chat history on mount
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    getChatMessages(sessionId)
      .then((data: unknown) => {
        const history = data as { messageId: string; senderName: string; senderId?: string; message: string; timestamp: string }[];
        if (Array.isArray(history) && history.length > 0) {
          const loaded: ChatMessage[] = history.map((m) => ({
            id: m.messageId,
            sender: m.senderName,
            senderId: m.senderId || null,
            text: m.message,
            timestamp: new Date(m.timestamp).getTime(),
          }));
          setMessages(loaded);
          // Scroll to bottom after loading history
          requestAnimationFrame(() => {
            scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
          });
        }
      })
      .catch((err: unknown) => {
        console.warn("Failed to load chat history:", err);
      });
  }, [sessionId]);

  // -------------------------------------------------------------------------
  // Track scroll position
  // -------------------------------------------------------------------------

  useEffect(() => {
    const sentinel = bottomSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const atBottom = entry.isIntersecting;
        setIsAtBottom(atBottom);
        if (atBottom) {
          setUnreadCount(0);
          onUnreadChange?.(0);
        }
      },
      { root: scrollRef.current, threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [onUnreadChange]);

  // -------------------------------------------------------------------------
  // Auto-scroll when at bottom
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (isAtBottom && scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isAtBottom]);

  // -------------------------------------------------------------------------
  // Receive messages
  // -------------------------------------------------------------------------

  useAppMessage({
    onAppMessage: useCallback(
      (ev: { data: Record<string, unknown>; fromId: string }) => {
        if (ev.data.type === "chat") {
          const replyData = ev.data.replyTo as { id: string; sender: string; text: string } | undefined;
          const msg: ChatMessage = {
            id: (ev.data.messageId as string) || `${ev.fromId}-${Date.now()}-${Math.random()}`,
            sender: (ev.data.sender as string) || "Unknown",
            senderId: (ev.data.senderId as string) || null,
            text: (ev.data.text as string) || "",
            timestamp: Date.now(),
            replyTo: replyData || undefined,
            isDm: (ev.data.isDm as boolean) || false,
            dmTarget: (ev.data.dmTarget as string) || undefined,
          };
          setMessages((prev) => [...prev, msg]);
          setIsAtBottom((atBottom) => {
            if (!atBottom) {
              setUnreadCount((c) => {
                const next = c + 1;
                onUnreadChange?.(next);
                return next;
              });
            }
            return atBottom;
          });
        }

        // Handle chat-disabled/enabled from admin
        if (ev.data.type === "chat-disabled") {
          setChatDisabled(true);
        }
        if (ev.data.type === "chat-enabled") {
          setChatDisabled(false);
        }

        // Handle per-user chat mute/unmute from admin
        if (ev.data.type === "chat-mute") {
          setChatDisabled(true);
        }
        if (ev.data.type === "chat-unmute") {
          setChatDisabled(false);
        }

        // Handle chat-delete from admin
        if (ev.data.type === "chat-delete") {
          const deletedId = ev.data.messageId as string;
          setMessages((prev) =>
            prev.map((m) => (m.id === deletedId ? { ...m, deleted: true } : m))
          );
        }

        // Handle chat reactions
        if (ev.data.type === "chat-reaction") {
          const targetId = ev.data.messageId as string;
          const emoji = ev.data.emoji as string;
          const sender = ev.data.sender as string;
          setMessages((prev) =>
            prev.map((m) => {
              if (m.id !== targetId) return m;
              const reactions = { ...(m.reactions || {}) };
              const users = reactions[emoji] ? [...reactions[emoji]] : [];
              if (!users.includes(sender)) {
                users.push(sender);
              }
              reactions[emoji] = users;
              return { ...m, reactions };
            })
          );
        }
      },
      [onUnreadChange]
    ),
  });

  // -------------------------------------------------------------------------
  // Send message
  // -------------------------------------------------------------------------

  const sendMessage = () => {
    if (!input.trim() || !daily || chatDisabled) return;
    const localName = daily.participants()?.local?.user_name || "You";
    const localUserId = daily.participants()?.local?.user_id || null;
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const isDm = !!dmTarget;
    const payload: Record<string, unknown> = {
      type: "chat",
      text: input.trim(),
      sender: localName,
      senderId: localUserId,
      messageId,
      isDm,
      dmTarget: dmTarget?.name,
    };
    if (replyingTo) {
      payload.replyTo = { id: replyingTo.id, sender: replyingTo.sender, text: replyingTo.text.slice(0, 100) };
    }

    // DM: send only to specific participant. Also send to self via broadcast (app message to "*" includes sender echo)
    if (isDm && dmTarget) {
      daily.sendAppMessage(payload, dmTarget.sessionId);
    } else {
      daily.sendAppMessage(payload, "*");
    }

    const newMsg: ChatMessage = {
      id: messageId,
      sender: localName,
      senderId: localUserId,
      text: input.trim(),
      timestamp: Date.now(),
      replyTo: replyingTo ? { id: replyingTo.id, sender: replyingTo.sender, text: replyingTo.text.slice(0, 100) } : undefined,
      isDm,
      dmTarget: dmTarget?.name,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    setReplyingTo(null);
    setDmTarget(null);

    // Persist to backend (fire-and-forget)
    saveChatMessage({
      sessionId,
      senderName: localName,
      message: input.trim(),
      timestamp: new Date().toISOString(),
      senderId: localUserId,
      messageId,
    }).catch((err: unknown) => console.warn("Failed to persist chat message:", err));

    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  };

  // -------------------------------------------------------------------------
  // Admin: delete message
  // -------------------------------------------------------------------------

  const handleDeleteMessage = useCallback(
    (messageId: string) => {
      // Optimistic update
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, deleted: true } : m))
      );

      // Broadcast deletion to all participants
      daily?.sendAppMessage(
        { type: "chat-delete", messageId },
        "*"
      );

      // Delete from backend
      const jwt = getToken();
      if (jwt) {
        deleteChatMessage(messageId, jwt).catch((err: unknown) =>
          console.warn("Failed to delete chat message:", err)
        );
      }
    },
    [daily]
  );

  // -------------------------------------------------------------------------
  // Send reaction on a message
  // -------------------------------------------------------------------------

  const handleReaction = useCallback(
    (messageId: string, emoji: string) => {
      if (!daily) return;
      const localName = daily.participants()?.local?.user_name || "You";

      // Optimistic local update
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== messageId) return m;
          const reactions = { ...(m.reactions || {}) };
          const users = reactions[emoji] ? [...reactions[emoji]] : [];
          if (!users.includes(localName)) {
            users.push(localName);
          }
          reactions[emoji] = users;
          return { ...m, reactions };
        })
      );

      // Broadcast to others
      daily.sendAppMessage(
        { type: "chat-reaction", messageId, emoji, sender: localName },
        "*"
      );
    },
    [daily]
  );

  // -------------------------------------------------------------------------
  // Scroll to bottom
  // -------------------------------------------------------------------------

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
    setUnreadCount(0);
    onUnreadChange?.(0);
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div
      className={`flex flex-col h-full bg-white dark:bg-gray-800 ${className ?? ""}`}
    >
      {/* Message list */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-1"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
      >
        {messages.length === 0 && (
          <p className="text-gray-400 text-sm text-center mt-8">
            No messages yet
          </p>
        )}

        {messages.map((msg, i) => {
          if (msg.deleted) {
            return (
              <div key={msg.id} className="py-1">
                <p className="text-xs text-gray-400 italic">Message deleted</p>
              </div>
            );
          }

          const prev = i > 0 ? messages[i - 1] : null;
          const grouped = isSameGroup(prev, msg);

          return (
            <div key={msg.id} className={`group ${grouped ? "pl-0" : "pt-3"}`}>
              {!grouped && (
                <div className="flex items-baseline justify-between gap-2 mb-0.5">
                  <button
                    className="text-xs font-bold text-yellow-500 truncate hover:text-yellow-300"
                    onClick={() => {
                      if (msg.senderId) {
                        setDmTarget({ sessionId: msg.senderId, name: msg.sender });
                      }
                    }}
                    title={`Send DM to ${msg.sender}`}
                  >
                    {msg.sender}
                    {msg.isDm && (
                      <span className="text-purple-400 font-normal ml-1">(DM)</span>
                    )}
                  </button>
                  <span className="text-[10px] text-gray-400 flex-shrink-0">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              )}
              {/* Reply context */}
              {msg.replyTo && (
                <div className="flex items-center gap-1 mb-0.5 pl-2 border-l-2 border-gray-300 dark:border-gray-600">
                  <span className="text-[10px] text-gray-400 truncate">
                    <span className="font-medium text-yellow-500/70">{msg.replyTo.sender}</span>
                    {": "}
                    {msg.replyTo.text}
                  </span>
                </div>
              )}
              <div className="flex items-start gap-1">
                <p className="text-sm text-gray-800 dark:text-gray-200 break-words flex-1">
                  {renderMessageText(msg.text)}
                </p>
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 flex-shrink-0 transition-opacity">
                  {/* Reply button */}
                  <button
                    onClick={() => setReplyingTo({ id: msg.id, sender: msg.sender, text: msg.text })}
                    className="text-gray-400 hover:text-blue-400 p-0.5"
                    title="Reply"
                    aria-label="Reply to message"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                  </button>
                  {/* Quick reaction button */}
                  <div className="relative group/react">
                    <button
                      className="text-gray-400 hover:text-yellow-500 p-0.5"
                      title="React"
                      aria-label="Add reaction"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <div className="absolute bottom-full right-0 mb-1 hidden group-hover/react:flex gap-0.5 bg-gray-800 border border-gray-700 p-1 shadow-lg z-10">
                      {REACTION_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleReaction(msg.id, emoji)}
                          className="text-sm hover:bg-gray-700 px-1 py-0.5 leading-none"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="text-gray-400 hover:text-red-500 p-0.5"
                      title="Delete message"
                      aria-label="Delete message"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              {/* Reactions display */}
              {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {Object.entries(msg.reactions).map(([emoji, users]) => (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(msg.id, emoji)}
                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
                      title={users.join(", ")}
                    >
                      <span>{emoji}</span>
                      <span className="text-gray-500 dark:text-gray-400">{users.length}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <div ref={bottomSentinelRef} className="h-px" />
      </div>

      {/* New messages badge */}
      {unreadCount > 0 && (
        <div className="relative">
          <button
            onClick={scrollToBottom}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-xs font-medium px-3 py-1.5 shadow-lg hover:bg-yellow-400 z-10 flex items-center gap-1"
            aria-label={`${unreadCount} new messages, click to scroll down`}
          >
            {unreadCount} new message{unreadCount !== 1 ? "s" : ""}
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Chat disabled notice */}
      {chatDisabled && (
        <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs text-center">
          Chat has been disabled by the host
        </div>
      )}

      {/* Export + Input */}
      {isAdmin && messages.length > 0 && (
        <div className="px-3 pt-2 flex justify-end">
          <button
            onClick={() => {
              const text = messages
                .filter((m) => !m.deleted)
                .map((m) => `[${formatTime(m.timestamp)}] ${m.sender}: ${m.text}`)
                .join("\n");
              const blob = new Blob([text], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `chat-${sessionId}.txt`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="Export chat"
          >
            Export chat
          </button>
        </div>
      )}

      {/* DM indicator */}
      {dmTarget && (
        <div className="px-3 pt-2 pb-1 flex items-center justify-between gap-2 bg-purple-50 dark:bg-purple-900/20 border-t border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
            <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>DM to <span className="font-medium">{dmTarget.name}</span></span>
          </div>
          <button
            onClick={() => setDmTarget(null)}
            className="text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 flex-shrink-0"
            aria-label="Cancel DM"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Reply indicator */}
      {replyingTo && (
        <div className="px-3 pt-2 pb-1 flex items-center justify-between gap-2 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 truncate min-w-0">
            <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            <span className="font-medium text-yellow-500">{replyingTo.sender}</span>
            <span className="truncate">{replyingTo.text}</span>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
            aria-label="Cancel reply"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className={`p-3 ${replyingTo ? "" : "border-t border-gray-200 dark:border-gray-700"} flex gap-2`}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder={chatDisabled ? "Chat is disabled" : "Type a message..."}
          disabled={chatDisabled}
          aria-label="Chat message input"
          className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || chatDisabled}
          aria-label="Send message"
          className="px-4 py-2 bg-yellow-500 text-black text-sm font-medium hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  );
}

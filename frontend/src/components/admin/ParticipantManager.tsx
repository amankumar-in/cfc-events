"use client";

import {
  useParticipantIds,
  useDaily,
  useParticipantProperty,
  useAppMessage,
} from "@daily-co/daily-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, MoreVertical } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ParticipantRole = "Host" | "Co-host" | "Speaker" | "Promoted" | "Viewer";

interface HandRaise {
  participantId: string;
  userName: string;
}

interface ActionFeedback {
  id: string;
  message: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getRole(
  isLocal: boolean,
  isOwner: boolean,
  canSend: boolean | Set<string> | undefined,
  isCoHost: boolean
): ParticipantRole {
  if (isOwner && isLocal) return "Host";
  if (isCoHost) return "Co-host";
  if (isOwner) return "Speaker";
  const hasCanSend =
    canSend === true ||
    (canSend instanceof Set && canSend.size > 0);
  if (hasCanSend) return "Promoted";
  return "Viewer";
}

function roleBadgeClasses(role: ParticipantRole): string {
  switch (role) {
    case "Host":
      return "bg-yellow-500 text-black";
    case "Co-host":
      return "bg-purple-500 text-white";
    case "Speaker":
      return "bg-yellow-500/20 text-yellow-500 border border-yellow-500/40";
    case "Promoted":
      return "bg-yellow-500/20 text-yellow-500 border border-yellow-500/40";
    case "Viewer":
      return "bg-gray-600 text-gray-300";
  }
}

// ---------------------------------------------------------------------------
// StatusDot
// ---------------------------------------------------------------------------

function StatusDot({ audio, video }: { audio: boolean; video: boolean }) {
  const color = audio || video ? "bg-green-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-0.5 flex-shrink-0">
      <span className={`w-2 h-2 ${color}`} />
      {video && (
        <svg
          className="w-3 h-3 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// EjectConfirmation
// ---------------------------------------------------------------------------

function EjectConfirmation({
  name,
  onConfirm,
  onCancel,
}: {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-gray-800 border border-gray-700 p-6 max-w-sm w-full mx-4">
        <h3 className="font-bold text-lg text-white mb-2">Remove Participant</h3>
        <p className="text-gray-300 text-sm mb-6">
          Remove <span className="font-semibold text-white">{name}</span> from
          the session?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white font-medium hover:bg-red-500"
          >
            Remove
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ParticipantRow
// ---------------------------------------------------------------------------

function ParticipantRow({
  sessionId,
  handRaised,
  chatMuted,
  isCoHost,
  onMute,
  onPromote,
  onDemote,
  onEject,
  onLowerHand,
  onMuteChat,
  onMakeCoHost,
  onRemoveCoHost,
  onFeedback,
}: {
  sessionId: string;
  handRaised: boolean;
  chatMuted: boolean;
  isCoHost: boolean;
  onMute: (id: string) => void;
  onPromote: (id: string) => void;
  onDemote: (id: string) => void;
  onEject: (id: string, name: string) => void;
  onLowerHand: (id: string) => void;
  onMuteChat: (id: string, muted: boolean) => void;
  onMakeCoHost: (id: string) => void;
  onRemoveCoHost: (id: string) => void;
  onFeedback: (message: string) => void;
}) {
  const [userName, audioState, videoState, isLocal, isOwner, permissions] =
    useParticipantProperty(sessionId, [
      "user_name",
      "tracks.audio.state",
      "tracks.video.state",
      "local",
      "owner",
      "permissions",
    ]);

  const hasAudio = audioState === "playable";
  const hasVideo = videoState === "playable";
  const canSend = permissions?.canSend;
  const role = getRole(isLocal, isOwner, canSend, isCoHost);
  const displayName = userName || (isLocal ? "Host" : "Guest");

  const handleMute = () => {
    onMute(sessionId);
    onFeedback(`Muted ${displayName}`);
  };

  const handlePromote = () => {
    onPromote(sessionId);
    onFeedback(`Made ${displayName} a speaker`);
  };

  const handleDemote = () => {
    onDemote(sessionId);
    onFeedback(`Made ${displayName} a viewer`);
  };

  const handleToggleChatMute = () => {
    const next = !chatMuted;
    onMuteChat(sessionId, next);
    onFeedback(next ? `Muted ${displayName}'s chat` : `Unmuted ${displayName}'s chat`);
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside or scroll
  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    const handleClick = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) {
        close();
      }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("scroll", close, true);
    };
  }, [menuOpen]);

  const toggleMenu = () => {
    if (menuOpen) {
      setMenuOpen(false);
      return;
    }
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 4, left: rect.right - 160 });
    }
    setMenuOpen(true);
  };

  const menuAction = (fn: () => void) => {
    fn();
    setMenuOpen(false);
  };

  return (
    <div className="flex items-center justify-between p-2 bg-gray-700 text-sm">
      <div className="flex items-center gap-2 min-w-0">
        <StatusDot audio={hasAudio} video={hasVideo} />
        <span className="text-white truncate">
          {displayName}
          {isLocal && (
            <span className="text-gray-400 ml-1">(You)</span>
          )}
        </span>
        <span
          className={`text-[10px] font-bold uppercase px-1.5 py-0.5 leading-none ${roleBadgeClasses(role)}`}
        >
          {role === "Promoted" ? "Speaker" : role}
        </span>
        {handRaised && (
          <button
            onClick={() => onLowerHand(sessionId)}
            className="text-yellow-400 hover:text-yellow-300 flex-shrink-0 cursor-pointer"
            title="Lower hand"
          >
            <span className="text-sm">&#9995;</span>
          </button>
        )}
      </div>

      {!isLocal && (
        <div className="flex-shrink-0">
          <button
            ref={btnRef}
            onClick={toggleMenu}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-600 cursor-pointer"
            title="Actions"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && menuPos && (
            <div
              ref={menuRef}
              className="fixed z-50 w-40 bg-gray-800 border border-gray-600 shadow-lg py-1"
              style={{ top: menuPos.top, left: menuPos.left }}
            >
              {hasAudio && (
                <button
                  onClick={() => menuAction(handleMute)}
                  className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700 cursor-pointer"
                >
                  Mute
                </button>
              )}
              {role === "Promoted" && (
                <button
                  onClick={() => menuAction(handleDemote)}
                  className="w-full text-left px-3 py-1.5 text-xs text-orange-400 hover:bg-gray-700 cursor-pointer"
                >
                  Make Viewer
                </button>
              )}
              {role === "Viewer" && (
                <button
                  onClick={() => menuAction(handlePromote)}
                  className="w-full text-left px-3 py-1.5 text-xs text-green-400 hover:bg-gray-700 cursor-pointer"
                >
                  Make Speaker
                </button>
              )}
              {!isOwner && role !== "Host" && (
                isCoHost ? (
                  <button
                    onClick={() => menuAction(() => { onRemoveCoHost(sessionId); onFeedback(`Removed co-host role from ${displayName}`); })}
                    className="w-full text-left px-3 py-1.5 text-xs text-purple-400 hover:bg-gray-700 cursor-pointer"
                  >
                    Remove Co-host
                  </button>
                ) : (
                  <button
                    onClick={() => menuAction(() => { onMakeCoHost(sessionId); onFeedback(`Made ${displayName} a co-host`); })}
                    className="w-full text-left px-3 py-1.5 text-xs text-purple-400 hover:bg-gray-700 cursor-pointer"
                  >
                    Make Co-host
                  </button>
                )
              )}
              <button
                onClick={() => menuAction(handleToggleChatMute)}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-700 cursor-pointer ${
                  chatMuted ? "text-yellow-400" : "text-gray-300"
                }`}
              >
                {chatMuted ? "Unmute Chat" : "Mute Chat"}
              </button>
              {!isOwner && (
                <>
                  <div className="border-t border-gray-700 my-1" />
                  <button
                    onClick={() => menuAction(() => onEject(sessionId, displayName))}
                    className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-gray-700 cursor-pointer"
                  >
                    Eject
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FeedbackToast
// ---------------------------------------------------------------------------

function FeedbackToast({ items }: { items: ActionFeedback[] }) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-1">
      {items.map((item) => (
        <div
          key={item.id}
          className="px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-medium animate-pulse"
        >
          {item.message}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ParticipantManager (default export)
// ---------------------------------------------------------------------------

interface ParticipantManagerProps {
  raisedHands?: Map<string, HandRaise>;
  onUpdateRaisedHands?: React.Dispatch<React.SetStateAction<Map<string, HandRaise>>>;
}

export default function ParticipantManager({ raisedHands: externalRaisedHands, onUpdateRaisedHands }: ParticipantManagerProps) {
  const daily = useDaily();
  const participantIds = useParticipantIds();
  const [searchQuery, setSearchQuery] = useState("");

  // Use lifted state from parent if provided, otherwise fall back to local state
  const [localRaisedHands, setLocalRaisedHands] = useState<Map<string, HandRaise>>(new Map());
  const raisedHands = externalRaisedHands ?? localRaisedHands;
  const setRaisedHands = onUpdateRaisedHands ?? setLocalRaisedHands;

  const [chatMutedUsers, setChatMutedUsers] = useState<Set<string>>(new Set());
  const [coHosts, setCoHosts] = useState<Set<string>>(new Set());
  const [ejectTarget, setEjectTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [feedbackItems, setFeedbackItems] = useState<ActionFeedback[]>([]);

  // Listen for re-promote requests (hand raises are tracked by parent)
  useAppMessage({
    onAppMessage: useCallback(
      (ev: {
        data: {
          type?: string;
          raised?: boolean;
          userName?: string;
        };
        fromId: string;
      }) => {
        if (ev.data.type === "re-promote-request") {
          const participantId = ev.fromId;
          // Auto-promote previously promoted viewer on reconnect
          try {
            daily?.updateParticipant(participantId, {
              updatePermissions: {
                canSend: new Set(["video", "audio", "screenVideo", "screenAudio"]),
                hasPresence: true,
              },
            } as Parameters<NonNullable<typeof daily>["updateParticipant"]>[1]);
            daily?.sendAppMessage(
              { type: "promote", message: "You have been re-promoted to speaker" },
              participantId
            );
          } catch (err) {
            console.error("Failed to re-promote participant:", err);
          }
        }
      },
      [daily]
    ),
  });

  // Auto-dismiss feedback after 2.5s
  useEffect(() => {
    if (feedbackItems.length === 0) return;
    const timer = setTimeout(() => {
      setFeedbackItems((prev) => prev.slice(1));
    }, 2500);
    return () => clearTimeout(timer);
  }, [feedbackItems]);

  const addFeedback = useCallback((message: string) => {
    setFeedbackItems((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, message },
    ]);
  }, []);

  // ── Mute All ──────────────────────────────────────────────────────────

  const handleMuteAll = useCallback(() => {
    try {
      daily?.updateParticipants({
        "*": { setAudio: false } as Parameters<
          NonNullable<typeof daily>["updateParticipants"]
        >[0][string],
      });
      addFeedback("Muted all participants");
    } catch (err) {
      console.error("Failed to mute all:", err);
    }
  }, [daily, addFeedback]);

  // ── Individual Actions ────────────────────────────────────────────────

  const handleMute = useCallback(
    (sessionId: string) => {
      try {
        daily?.updateParticipant(sessionId, { setAudio: false });
      } catch (err) {
        console.error("Failed to mute participant:", err);
      }
    },
    [daily]
  );

  const handlePromote = useCallback(
    (sessionId: string) => {
      try {
        daily?.updateParticipant(sessionId, {
          updatePermissions: {
            canSend: new Set([
              "video",
              "audio",
              "screenVideo",
              "screenAudio",
            ]),
            hasPresence: true,
          },
        } as Parameters<NonNullable<typeof daily>["updateParticipant"]>[1]);

        daily?.sendAppMessage(
          { type: "promote", message: "You have been promoted to speaker" },
          sessionId
        );
      } catch (err) {
        console.error("Failed to promote participant:", err);
      }
    },
    [daily]
  );

  const handleDemote = useCallback(
    (sessionId: string) => {
      try {
        daily?.updateParticipant(sessionId, {
          updatePermissions: {
            canSend: false,
          },
        } as Parameters<NonNullable<typeof daily>["updateParticipant"]>[1]);

        daily?.sendAppMessage(
          { type: "demote", message: "You have been moved to audience" },
          sessionId
        );
      } catch (err) {
        console.error("Failed to demote participant:", err);
      }
    },
    [daily]
  );

  // ── Eject (with confirmation) ─────────────────────────────────────────

  const requestEject = useCallback(
    (sessionId: string, name: string) => {
      setEjectTarget({ id: sessionId, name });
    },
    []
  );

  const confirmEject = useCallback(() => {
    if (!ejectTarget) return;
    try {
      daily?.updateParticipant(ejectTarget.id, { eject: true });
      addFeedback(`Removed ${ejectTarget.name} from the session`);
    } catch (err) {
      console.error("Failed to eject participant:", err);
    }
    setEjectTarget(null);
  }, [daily, ejectTarget, addFeedback]);

  const cancelEject = useCallback(() => {
    setEjectTarget(null);
  }, []);

  // ── Mute/Unmute Chat (per-user) ──────────────────────────────────────

  const handleMuteChat = useCallback(
    (sessionId: string, muted: boolean) => {
      daily?.sendAppMessage(
        { type: muted ? "chat-mute" : "chat-unmute" },
        sessionId
      );
      setChatMutedUsers((prev) => {
        const next = new Set(prev);
        if (muted) {
          next.add(sessionId);
        } else {
          next.delete(sessionId);
        }
        return next;
      });
    },
    [daily]
  );

  // ── Co-host management ──────────────────────────────────────────────────

  const handleMakeCoHost = useCallback(
    (sessionId: string) => {
      try {
        // Grant full permissions
        daily?.updateParticipant(sessionId, {
          updatePermissions: {
            canSend: new Set(["video", "audio", "screenVideo", "screenAudio"]),
            hasPresence: true,
            canAdmin: new Set(["participants"]),
          },
        } as Parameters<NonNullable<typeof daily>["updateParticipant"]>[1]);

        daily?.sendAppMessage(
          { type: "co-host-assigned", message: "You have been made a co-host" },
          sessionId
        );

        setCoHosts((prev) => {
          const next = new Set(prev);
          next.add(sessionId);
          return next;
        });
      } catch (err) {
        console.error("Failed to assign co-host:", err);
      }
    },
    [daily]
  );

  const handleRemoveCoHost = useCallback(
    (sessionId: string) => {
      try {
        // Revoke elevated permissions back to viewer
        daily?.updateParticipant(sessionId, {
          updatePermissions: {
            canSend: false,
          },
        } as Parameters<NonNullable<typeof daily>["updateParticipant"]>[1]);

        daily?.sendAppMessage(
          { type: "co-host-removed", message: "Your co-host role has been removed" },
          sessionId
        );

        setCoHosts((prev) => {
          const next = new Set(prev);
          next.delete(sessionId);
          return next;
        });
      } catch (err) {
        console.error("Failed to remove co-host:", err);
      }
    },
    [daily]
  );

  // ── Lower Hand (admin action) ─────────────────────────────────────────

  const handleLowerHand = useCallback(
    (participantId: string) => {
      // Send a message to the participant telling them hand is lowered
      daily?.sendAppMessage(
        { type: "hand-raise", raised: false, userName: "Host" },
        participantId
      );
      // Remove from state (updates parent if lifted)
      setRaisedHands((prev) => {
        const next = new Map(prev);
        next.delete(participantId);
        return next;
      });
      addFeedback("Lowered hand");
    },
    [daily, addFeedback, setRaisedHands]
  );

  // ── Filter participants by search query ──────────────────────────────

  const filteredIds = useMemo(() => {
    if (!searchQuery.trim()) return participantIds;
    const q = searchQuery.toLowerCase();
    const participants = daily?.participants();
    if (!participants) return participantIds;
    return participantIds.filter((id) => {
      const p = id === "local" ? participants.local : participants[id];
      const name = (p?.user_name || "").toLowerCase();
      const odataUserId = (p?.user_id || "").toLowerCase();
      return name.includes(q) || odataUserId.includes(q);
    });
  }, [participantIds, searchQuery, daily]);

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-white text-sm">
          Participants ({participantIds.length})
        </h4>
        {participantIds.length > 1 && (
          <button
            onClick={handleMuteAll}
            className="px-3 py-1 text-xs font-medium border border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
          >
            Mute All
          </button>
        )}
      </div>

      {/* Search */}
      {participantIds.length > 3 && (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name..."
            className="w-full pl-8 pr-3 py-1.5 bg-gray-800 border border-gray-700 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-yellow-500"
          />
        </div>
      )}

      {/* Raised hands banner */}
      {raisedHands.size > 0 && (
        <div className="px-3 py-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs">
          <span className="font-bold">{raisedHands.size}</span> raised hand
          {raisedHands.size !== 1 ? "s" : ""}
        </div>
      )}

      {/* Action feedback toasts */}
      <FeedbackToast items={feedbackItems} />

      {/* Participant list */}
      <div className="space-y-1">
        {filteredIds.map((id) => (
          <ParticipantRow
            key={id}
            sessionId={id}
            handRaised={raisedHands.has(id)}
            chatMuted={chatMutedUsers.has(id)}
            isCoHost={coHosts.has(id)}
            onMute={handleMute}
            onPromote={handlePromote}
            onDemote={handleDemote}
            onEject={requestEject}
            onLowerHand={handleLowerHand}
            onMuteChat={handleMuteChat}
            onMakeCoHost={handleMakeCoHost}
            onRemoveCoHost={handleRemoveCoHost}
            onFeedback={addFeedback}
          />
        ))}

        {participantIds.length === 0 && (
          <p className="text-gray-400 text-sm">No participants yet</p>
        )}
        {participantIds.length > 0 && filteredIds.length === 0 && (
          <p className="text-gray-500 text-xs py-2">No matches for &ldquo;{searchQuery}&rdquo;</p>
        )}
      </div>

      {/* Eject confirmation modal */}
      {ejectTarget && (
        <EjectConfirmation
          name={ejectTarget.name}
          onConfirm={confirmEject}
          onCancel={cancelEject}
        />
      )}
    </div>
  );
}

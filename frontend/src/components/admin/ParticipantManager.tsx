"use client";

import {
  useParticipantIds,
  useDaily,
  useParticipantProperty,
  useAppMessage,
} from "@daily-co/daily-react";
import { useCallback, useEffect, useState } from "react";

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
      return "bg-green-500/20 text-green-400 border border-green-500/40";
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
  onTransferHost,
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
  onTransferHost: (id: string) => void;
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
  const displayName = userName || (isLocal ? "Admin" : "Guest");

  const handleMute = () => {
    onMute(sessionId);
    onFeedback(`Muted ${displayName}`);
  };

  const handlePromote = () => {
    onPromote(sessionId);
    onFeedback(`Promoted ${displayName} to speaker`);
  };

  const handleDemote = () => {
    onDemote(sessionId);
    onFeedback(`Demoted ${displayName} to viewer`);
  };

  const handleToggleChatMute = () => {
    const next = !chatMuted;
    onMuteChat(sessionId, next);
    onFeedback(next ? `Muted ${displayName}'s chat` : `Unmuted ${displayName}'s chat`);
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
          {role}
        </span>
        {handRaised && (
          <button
            onClick={() => onLowerHand(sessionId)}
            className="text-yellow-400 hover:text-yellow-300 flex-shrink-0"
            title="Lower hand"
          >
            <span className="text-sm">&#9995;</span>
          </button>
        )}
      </div>

      {!isLocal && (
        <div className="flex gap-1 flex-shrink-0">
          {hasAudio && (
            <button
              onClick={handleMute}
              className="px-2 py-1 text-xs border border-gray-600 hover:bg-gray-600 text-gray-300"
              title="Mute"
            >
              Mute
            </button>
          )}
          {role === "Promoted" ? (
            <button
              onClick={handleDemote}
              className="px-2 py-1 text-xs border border-orange-400 text-orange-400 hover:bg-orange-900/20"
              title="Remove from stage"
            >
              Demote
            </button>
          ) : role === "Viewer" ? (
            <button
              onClick={handlePromote}
              className="px-2 py-1 text-xs border border-green-400 text-green-400 hover:bg-green-900/20"
              title="Bring to stage"
            >
              Promote
            </button>
          ) : null}
          {/* Co-host toggle */}
          {!isOwner && role !== "Host" && (
            isCoHost ? (
              <button
                onClick={() => { onRemoveCoHost(sessionId); onFeedback(`Removed co-host role from ${displayName}`); }}
                className="px-2 py-1 text-xs border border-purple-400 text-purple-400 hover:bg-purple-900/20"
                title="Remove co-host"
              >
                Remove Co-host
              </button>
            ) : (
              <button
                onClick={() => { onMakeCoHost(sessionId); onFeedback(`Made ${displayName} a co-host`); }}
                className="px-2 py-1 text-xs border border-purple-400 text-purple-400 hover:bg-purple-900/20"
                title="Make co-host"
              >
                Co-host
              </button>
            )
          )}
          <button
            onClick={handleToggleChatMute}
            className={`px-2 py-1 text-xs border ${
              chatMuted
                ? "border-yellow-400 text-yellow-400 hover:bg-yellow-900/20"
                : "border-gray-600 hover:bg-gray-600 text-gray-300"
            }`}
            title={chatMuted ? "Unmute chat" : "Mute chat"}
          >
            {chatMuted ? "Unmute Chat" : "Mute Chat"}
          </button>
          {!isOwner && (
            <>
              <button
                onClick={() => { onTransferHost(sessionId); onFeedback(`Transferred host to ${displayName}`); }}
                className="px-2 py-1 text-xs border border-blue-400 text-blue-400 hover:bg-blue-900/20"
                title="Transfer host role"
              >
                Transfer
              </button>
              <button
                onClick={() => onEject(sessionId, displayName)}
                className="px-2 py-1 text-xs border border-red-400 text-red-400 hover:bg-red-900/20"
                title="Remove from call"
              >
                Eject
              </button>
            </>
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

export default function ParticipantManager() {
  const daily = useDaily();
  const participantIds = useParticipantIds();
  const [raisedHands, setRaisedHands] = useState<Map<string, HandRaise>>(
    new Map()
  );
  const [chatMutedUsers, setChatMutedUsers] = useState<Set<string>>(new Set());
  const [coHosts, setCoHosts] = useState<Set<string>>(new Set());
  const [ejectTarget, setEjectTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [feedbackItems, setFeedbackItems] = useState<ActionFeedback[]>([]);

  // Listen for hand-raise / hand-lower app messages
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
        const participantId = ev.fromId;
        const userName = ev.data.userName || "Guest";

        if (ev.data.type === "hand-raise") {
          setRaisedHands((prev) => {
            const next = new Map(prev);
            if (ev.data.raised) {
              next.set(participantId, { participantId, userName });
            } else {
              next.delete(participantId);
            }
            return next;
          });
        } else if (ev.data.type === "hand-lower") {
          setRaisedHands((prev) => {
            const next = new Map(prev);
            next.delete(participantId);
            return next;
          });
        } else if (ev.data.type === "re-promote-request") {
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

  // Clean up raised hands when participants leave
  useEffect(() => {
    const idsSet = new Set(participantIds);
    setRaisedHands((prev) => {
      let changed = false;
      const next = new Map(prev);
      for (const key of next.keys()) {
        if (!idsSet.has(key)) {
          next.delete(key);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [participantIds]);

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

  // ── Transfer Host Role ──────────────────────────────────────────────────

  const handleTransferHost = useCallback(
    (sessionId: string) => {
      try {
        // Grant full owner-like permissions
        daily?.updateParticipant(sessionId, {
          updatePermissions: {
            canSend: new Set(["video", "audio", "screenVideo", "screenAudio"]),
            hasPresence: true,
            canAdmin: new Set(["participants"]),
          },
        } as Parameters<NonNullable<typeof daily>["updateParticipant"]>[1]);

        daily?.sendAppMessage(
          { type: "host-transfer", message: "You are now the session host" },
          sessionId
        );

        setCoHosts((prev) => {
          const next = new Set(prev);
          next.add(sessionId);
          return next;
        });

        addFeedback("Host role transferred");
      } catch (err) {
        console.error("Failed to transfer host:", err);
      }
    },
    [daily, addFeedback]
  );

  // ── Lower Hand (admin action) ─────────────────────────────────────────

  const handleLowerHand = useCallback(
    (participantId: string) => {
      // Send a message to the participant telling them hand is lowered
      daily?.sendAppMessage(
        { type: "hand-raise", raised: false, userName: "Admin" },
        participantId
      );
      // Remove locally
      setRaisedHands((prev) => {
        const next = new Map(prev);
        next.delete(participantId);
        return next;
      });
      addFeedback("Lowered hand");
    },
    [daily, addFeedback]
  );

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
      <div className="max-h-96 overflow-y-auto space-y-1">
        {participantIds.map((id) => (
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
            onTransferHost={handleTransferHost}
            onFeedback={addFeedback}
          />
        ))}

        {participantIds.length === 0 && (
          <p className="text-gray-400 text-sm">No participants yet</p>
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

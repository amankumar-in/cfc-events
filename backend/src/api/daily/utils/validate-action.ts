const ALLOWED_ACTION_TYPES = new Set([
  "poll",
  "announcement",
  "download",
  "chat-mute",
  "chat-unmute",
  "chat-delete",
  "chat-disabled",
  "recording-started",
  "recording-stopped",
  "session-status",
  "hand-raise",
  "promote",
  "demote",
  "reaction",
]);

const REQUIRED_FIELDS: Record<string, string[]> = {
  poll: ["question", "options"],
  announcement: ["message"],
  download: ["url"],
  "chat-delete": ["messageId"],
  "chat-mute": ["targetId"],
  "chat-unmute": ["targetId"],
};

export function validateActionPayload(action: Record<string, any>): {
  valid: boolean;
  error?: string;
} {
  if (!action || typeof action !== "object") {
    return { valid: false, error: "Action must be an object." };
  }

  const type = action.type;
  if (!type || typeof type !== "string") {
    return { valid: false, error: "Action must have a 'type' string field." };
  }

  if (!ALLOWED_ACTION_TYPES.has(type)) {
    return { valid: false, error: `Unknown action type: ${type}` };
  }

  const required = REQUIRED_FIELDS[type];
  if (required) {
    for (const field of required) {
      if (action[field] === undefined || action[field] === null) {
        return { valid: false, error: `Action type '${type}' requires field '${field}'.` };
      }
    }
  }

  return { valid: true };
}

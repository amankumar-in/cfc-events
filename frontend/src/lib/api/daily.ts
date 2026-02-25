import { fetchAPI } from "./api-config";

export async function getMeetingToken(
  sessionId: string,
  userName?: string,
  token?: string
) {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return fetchAPI("/daily/meeting-token", {
    method: "POST",
    headers,
    body: JSON.stringify({ sessionId, userName }),
  });
}

export async function createRoom(sessionId: string, token: string) {
  return fetchAPI("/daily/create-room", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ sessionId }),
  });
}

export async function sendAction(
  roomName: string,
  action: Record<string, unknown>,
  token: string
) {
  return fetchAPI("/daily/send-action", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ roomName, action }),
  });
}

export async function goLive(sessionId: string, token: string): Promise<void> {
  return fetchAPI("/daily/go-live", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ sessionId }),
  });
}

export async function endSession(
  sessionId: string,
  token: string
): Promise<void> {
  return fetchAPI("/daily/end-session", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ sessionId }),
  });
}

// -- Chat persistence --

export async function saveChatMessage(data: {
  sessionId: string;
  senderName: string;
  message: string;
  timestamp: string;
  senderId: string | null;
  messageId: string;
}) {
  return fetchAPI("/daily/chat-message", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getChatMessages(sessionId: string) {
  return fetchAPI(`/daily/chat-messages/${sessionId}`, { method: "GET" });
}

export async function deleteChatMessage(messageId: string, token: string) {
  return fetchAPI(`/daily/chat-message/${messageId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// -- Actions persistence (late joiners) --

export async function saveActionToServer(
  sessionId: string,
  type: string,
  payload: Record<string, unknown>,
  token: string
) {
  return fetchAPI("/daily/actions", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ sessionId, type, payload }),
  });
}

export async function getActiveActions(sessionId: string) {
  return fetchAPI(`/daily/actions/${sessionId}`, { method: "GET" });
}

export async function removeActionFromServer(actionId: string, token: string) {
  return fetchAPI(`/daily/actions/${actionId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// -- Attendance tracking --

export async function recordJoin(sessionId: string, userId?: string, userName?: string) {
  return fetchAPI("/daily/attendance/join", {
    method: "POST",
    body: JSON.stringify({ sessionId, userId, userName }),
  });
}

export async function recordLeave(attendanceId: string) {
  return fetchAPI("/daily/attendance/leave", {
    method: "POST",
    body: JSON.stringify({ attendanceId }),
  });
}

// -- Room management --

export async function updateRoom(roomName: string, properties: Record<string, unknown>, token: string) {
  return fetchAPI("/daily/update-room", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ roomName, properties }),
  });
}

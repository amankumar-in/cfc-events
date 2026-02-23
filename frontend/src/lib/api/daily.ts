import { fetchAPI } from "./api-config";

export async function getMeetingToken(
  sessionId: number,
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

export async function createRoom(sessionId: number, token: string) {
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
  action: string,
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

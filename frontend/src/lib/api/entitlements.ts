import { fetchAPI } from "./api-config";

export async function checkAccess(
  eventId: number,
  sessionId?: number,
  token?: string
) {
  const params = new URLSearchParams({ eventId: String(eventId) });
  if (sessionId) {
    params.set("sessionId", String(sessionId));
  }
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return fetchAPI(`/entitlements/check?${params.toString()}`, { headers });
}

export async function grantAccess(
  data: { eventId: number; sessionId?: number; userId: number },
  token: string
) {
  return fetchAPI("/entitlements/grant", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

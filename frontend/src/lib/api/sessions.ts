import { fetchAPI } from "./api-config";

const sessionDeepPopulate = [
  "populate[speakers][populate][0]=ProfileImage",
  "populate[venue][populate]=*",
  "populate[Image]=true",
].join("&");

export async function fetchSessions(params?: Record<string, string>) {
  const query = new URLSearchParams(params);
  const qs = query.toString() ? `&${query.toString()}` : "";
  return fetchAPI(`/sessions?${sessionDeepPopulate}${qs}`);
}

export async function fetchSessionBySlug(slug: string) {
  const res = await fetchAPI(
    `/sessions?filters[Slug][$eq]=${encodeURIComponent(slug)}&${sessionDeepPopulate}`
  );
  return res?.data?.[0] ?? null;
}

export async function fetchEventSessions(eventSlug: string) {
  return fetchAPI(
    `/sessions?filters[event][Slug][$eq]=${encodeURIComponent(eventSlug)}&${sessionDeepPopulate}&sort=StartDate:asc`
  );
}

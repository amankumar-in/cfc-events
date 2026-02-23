import { fetchAPI } from "./api-config";

const eventDeepPopulate = [
  "populate[sponsors][populate][0]=Logo",
  "populate[venue][populate]=*",
  "populate[faqs][populate][0]=Category",
  "populate[organizers][populate]=*",
  "populate[organizations][populate]=*",
  "populate[ticketCategories][populate]=*",
  "populate[Image]=true",
  "populate[Banner]=true",
].join("&");

export async function fetchEvents(params?: Record<string, string>) {
  const query = new URLSearchParams(params);
  const qs = query.toString() ? `&${query.toString()}` : "";
  return fetchAPI(`/events?${eventDeepPopulate}${qs}`);
}

export async function fetchEventBySlug(slug: string) {
  const res = await fetchAPI(
    `/events?filters[Slug][$eq]=${encodeURIComponent(slug)}&${eventDeepPopulate}`
  );
  return res?.data?.[0] ?? null;
}

export async function fetchFeaturedEvents() {
  return fetchAPI(
    `/events?filters[isFeatured][$eq]=true&${eventDeepPopulate}`
  );
}

export async function fetchEventFaqs(eventSlug: string) {
  return fetchAPI(
    `/faqs?filters[event][Slug][$eq]=${encodeURIComponent(eventSlug)}&populate[Category]=*&sort=createdAt:asc`
  );
}

export async function submitContactMessage(data: {
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  subject: string;
  message: string;
  inquiryType?: string;
  event?: number;
}) {
  return fetchAPI("/contact-messages", {
    method: "POST",
    body: JSON.stringify({ data }),
  });
}

import { fetchAPI } from "./api-config";

const collegeDeepPopulate = [
  "populate[Logo]=true",
  "populate[BannerImage]=true",
  "populate[Faculty][populate][0]=Image",
  "populate[programs][populate][0]=Image",
  "populate[programs][populate][1]=college",
  "populate[events][populate]=*",
].join("&");

export async function fetchColleges(params?: Record<string, string>) {
  const query = new URLSearchParams(params);
  const qs = query.toString() ? `&${query.toString()}` : "";
  return fetchAPI(`/colleges?${collegeDeepPopulate}${qs}`);
}

export async function fetchFeaturedColleges() {
  return fetchAPI(
    `/colleges?filters[Featured][$eq]=true&${collegeDeepPopulate}&sort=SortOrder:asc`
  );
}

export async function fetchCollegeBySlug(slug: string) {
  const res = await fetchAPI(
    `/colleges?filters[Slug][$eq]=${encodeURIComponent(slug)}&${collegeDeepPopulate}`
  );
  return res?.data?.[0] ?? null;
}

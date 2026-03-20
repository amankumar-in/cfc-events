import { fetchAPI } from "./api-config";

const programDeepPopulate = [
  "populate[Image]=true",
  "populate[BannerImage]=true",
  "populate[OverviewImage]=true",
  "populate[CurriculumImage]=true",
  "populate[AdmissionImage]=true",
  "populate[CareerImage]=true",
  "populate[Highlights]=true",
  "populate[Courses]=true",
  "populate[TestimonialItems][populate][0]=Photo",
  "populate[Stats]=true",
  "populate[CareerPaths]=true",
  "populate[college][populate][0]=Logo",
  "populate[events][populate]=*",
].join("&");

export async function fetchPrograms(params?: Record<string, string>) {
  const query = new URLSearchParams(params);
  const qs = query.toString() ? `&${query.toString()}` : "";
  return fetchAPI(
    `/programs?${programDeepPopulate}&sort=SortOrder:asc${qs}`
  );
}

export async function fetchFeaturedPrograms() {
  return fetchAPI(
    `/programs?filters[Featured][$eq]=true&${programDeepPopulate}&sort=SortOrder:asc`
  );
}

export async function fetchProgramBySlug(slug: string) {
  const res = await fetchAPI(
    `/programs?filters[Slug][$eq]=${encodeURIComponent(slug)}&${programDeepPopulate}`
  );
  return res?.data?.[0] ?? null;
}

export async function fetchProgramsByCollege(collegeId: number) {
  return fetchAPI(
    `/programs?filters[college][id][$eq]=${collegeId}&${programDeepPopulate}&sort=SortOrder:asc`
  );
}

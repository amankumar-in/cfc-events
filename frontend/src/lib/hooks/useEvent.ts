import { useQuery } from "@tanstack/react-query";
import { fetchEventBySlug } from "@/lib/api/events";

export function useEvent(slug: string) {
  return useQuery({
    queryKey: ["event", slug],
    queryFn: () => fetchEventBySlug(slug),
    enabled: !!slug,
  });
}

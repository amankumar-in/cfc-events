import { useQuery } from "@tanstack/react-query";
import { fetchSessionBySlug } from "@/lib/api/sessions";

export function useSession(slug: string) {
  return useQuery({
    queryKey: ["session", slug],
    queryFn: () => fetchSessionBySlug(slug),
    enabled: !!slug,
  });
}

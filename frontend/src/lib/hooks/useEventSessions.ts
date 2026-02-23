import { useQuery } from "@tanstack/react-query";
import { fetchEventSessions } from "@/lib/api/sessions";

export function useEventSessions(eventSlug: string) {
  return useQuery({
    queryKey: ["eventSessions", eventSlug],
    queryFn: () => fetchEventSessions(eventSlug),
    enabled: !!eventSlug,
  });
}

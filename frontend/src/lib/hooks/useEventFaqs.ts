import { useQuery } from "@tanstack/react-query";
import { fetchEventFaqs } from "@/lib/api/events";

export function useEventFaqs(eventSlug: string) {
  return useQuery({
    queryKey: ["eventFaqs", eventSlug],
    queryFn: () => fetchEventFaqs(eventSlug),
    enabled: !!eventSlug,
  });
}

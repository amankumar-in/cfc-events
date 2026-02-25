import { useQuery } from "@tanstack/react-query";
import { checkAccess } from "@/lib/api/entitlements";

export function useEntitlement(
  eventId: number | undefined,
  sessionId?: string,
  token?: string
) {
  return useQuery({
    queryKey: ["entitlement", eventId, sessionId],
    queryFn: () => checkAccess(eventId!, sessionId, token),
    enabled: !!eventId && !!token,
  });
}

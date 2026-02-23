import { useQuery } from "@tanstack/react-query";
import { checkAccess } from "@/lib/api/entitlements";

export function useEntitlement(
  eventId: number | undefined,
  sessionId?: number,
  token?: string
) {
  return useQuery({
    queryKey: ["entitlement", eventId, sessionId],
    queryFn: () => checkAccess(eventId!, sessionId, token),
    enabled: !!eventId && !!token,
  });
}

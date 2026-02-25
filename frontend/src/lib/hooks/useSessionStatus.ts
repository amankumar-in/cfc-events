import { useState, useEffect } from "react";

export type SessionStatus = "upcoming" | "live" | "past";

export type LiveStatus = "idle" | "live" | "ended";

export function useSessionStatus(
  startDate: string,
  endDate: string,
  liveStatus?: LiveStatus
): SessionStatus {
  const [status, setStatus] = useState<SessionStatus>(() =>
    computeStatus(startDate, endDate, liveStatus)
  );

  useEffect(() => {
    // If liveStatus is explicitly set, it takes priority -- no need to poll
    if (liveStatus === "live") {
      setStatus("live");
      return;
    }
    if (liveStatus === "ended") {
      setStatus("past");
      return;
    }

    // liveStatus is "idle" or not provided -- fall back to time-based logic
    setStatus(computeStatus(startDate, endDate));

    const interval = setInterval(() => {
      setStatus(computeStatus(startDate, endDate));
    }, 30_000); // re-check every 30s

    return () => clearInterval(interval);
  }, [startDate, endDate, liveStatus]);

  return status;
}

// Grace period after EndDate before marking as "past" (30 minutes)
const GRACE_MS = 30 * 60 * 1000;

function computeStatus(
  startDate: string,
  endDate: string,
  liveStatus?: LiveStatus
): SessionStatus {
  // liveStatus takes priority when explicitly set
  if (liveStatus === "live") return "live";
  if (liveStatus === "ended") return "past";

  const now = Date.now();
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  if (now < start) return "upcoming";
  if (now <= end + GRACE_MS) return "live";
  return "past";
}

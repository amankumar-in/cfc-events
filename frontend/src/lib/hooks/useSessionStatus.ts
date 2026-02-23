import { useState, useEffect } from "react";

export type SessionStatus = "upcoming" | "live" | "past";

export function useSessionStatus(startDate: string, endDate: string): SessionStatus {
  const [status, setStatus] = useState<SessionStatus>(() =>
    computeStatus(startDate, endDate)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(computeStatus(startDate, endDate));
    }, 30_000); // re-check every 30s

    return () => clearInterval(interval);
  }, [startDate, endDate]);

  return status;
}

function computeStatus(startDate: string, endDate: string): SessionStatus {
  const now = Date.now();
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "live";
  return "past";
}

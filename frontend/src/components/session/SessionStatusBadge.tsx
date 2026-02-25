"use client";

import { useSessionStatus, SessionStatus, LiveStatus } from "@/lib/hooks/useSessionStatus";

interface SessionStatusBadgeProps {
  startDate: string;
  endDate: string;
  liveStatus?: LiveStatus;
}

const statusConfig: Record<SessionStatus, { label: string; classes: string }> = {
  upcoming: {
    label: "Upcoming",
    classes: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  live: {
    label: "Live",
    classes: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 animate-pulse",
  },
  past: {
    label: "Past",
    classes: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  },
};

export function SessionStatusBadge({ startDate, endDate, liveStatus }: SessionStatusBadgeProps) {
  const status = useSessionStatus(startDate, endDate, liveStatus);
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium ${config.classes}`}
    >
      {status === "live" && (
        <span className="w-2 h-2 bg-red-500 rounded-full mr-1.5" />
      )}
      {config.label}
    </span>
  );
}

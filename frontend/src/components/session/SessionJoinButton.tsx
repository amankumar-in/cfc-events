"use client";

import { useSessionStatus } from "@/lib/hooks/useSessionStatus";
import { Button } from "@/components/ui/Button";

interface SessionJoinButtonProps {
  session: {
    Slug: string;
    StartDate: string;
    EndDate: string;
    Format?: string;
    RecordingURL?: string;
    event?: { Slug: string };
  };
  eventSlug: string;
  hasAccess?: boolean;
}

export function SessionJoinButton({
  session,
  eventSlug,
  hasAccess,
}: SessionJoinButtonProps) {
  const status = useSessionStatus(session.StartDate, session.EndDate);
  const isVirtual = session.Format === "virtual" || session.Format === "hybrid";

  if (status === "upcoming") {
    return (
      <Button
        variant="dark"
        buttonType="outline"
        className="dark:border-white dark:text-white"
        href={`/events/${eventSlug}/sessions/${session.Slug}`}
      >
        <svg
          className="mr-2 h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        Add to Calendar
      </Button>
    );
  }

  if (status === "live" && isVirtual && hasAccess) {
    return (
      <Button
        variant="primary"
        href={`/events/${eventSlug}/sessions/${session.Slug}/live`}
      >
        <svg
          className="mr-2 h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        Join Session
      </Button>
    );
  }

  if (status === "past" && session.RecordingURL) {
    return (
      <Button
        variant="primary"
        href={`/events/${eventSlug}/sessions/${session.Slug}/recording`}
      >
        <svg
          className="mr-2 h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Watch Recording
      </Button>
    );
  }

  return (
    <Button
      variant="dark"
      buttonType="outline"
      className="dark:border-white dark:text-white"
      href={`/events/${eventSlug}/sessions/${session.Slug}`}
    >
      View Details
    </Button>
  );
}

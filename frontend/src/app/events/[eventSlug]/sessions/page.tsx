"use client";

import { useRef } from "react";
import Link from "next/link";
import { useEventContext } from "@/components/event/EventContext";
import { useEventSessions } from "@/lib/hooks/useEventSessions";
import { SessionCard } from "@/components/session/SessionCard";
import { FeaturedSessionCard } from "@/components/session/FeaturedSessionCard";
import { PageBanner } from "@/components/event/PageBanner";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";

interface SessionData {
  id: number;
  Title: string;
  Slug: string;
  StartDate: string;
  EndDate: string;
  ShortDescription?: string;
  format?: string;
  SessionType?: string;
  FeaturedSession?: boolean;
  speakers?: { id: number; Name: string }[];
  venue?: { Name: string };
  Image?: { url: string } | null;
  event?: { Slug: string };
}

export default function SessionsPage() {
  const event = useEventContext();
  const { data, isLoading } = useEventSessions(event.Slug);
  const timetableRef = useRef<HTMLDivElement>(null);

  const sessions = (data?.data ?? []) as SessionData[];
  const featuredSessions = sessions.filter((s) => s.FeaturedSession);

  // Group sessions by date
  const grouped = sessions.reduce(
    (acc: Record<string, SessionData[]>, session) => {
      const dateKey = new Date(session.StartDate).toLocaleDateString(
        "en-US",
        {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      );
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(session);
      return acc;
    },
    {} as Record<string, SessionData[]>
  );

  // Sort sessions chronologically for the timetable
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(a.StartDate).getTime() - new Date(b.StartDate).getTime()
  );

  // Group sorted sessions by date for timetable
  const timetableGrouped = sortedSessions.reduce(
    (acc: Record<string, SessionData[]>, session) => {
      const dateKey = new Date(session.StartDate).toLocaleDateString(
        "en-US",
        {
          weekday: "long",
          month: "long",
          day: "numeric",
        }
      );
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(session);
      return acc;
    },
    {} as Record<string, SessionData[]>
  );

  const scrollToTimetable = () => {
    timetableRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="bg-white dark:bg-gray-900">
      <PageBanner
        title="Sessions"
        subtitle={`Schedule for ${event.Title}`}
        action={
          sessions.length > 0 ? (
            <button
              onClick={scrollToTimetable}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white border border-white/30 hover:bg-white/20 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Full Schedule
            </button>
          ) : undefined
        }
      />

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-12 h-12 border-t-2 border-yellow-500 border-solid rounded-full animate-spin" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-16 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
              <p className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                No Sessions Yet
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Sessions will be announced soon.
              </p>
            </div>
          ) : (
            <div className="space-y-16">
              {/* Featured Sessions — large horizontal cards */}
              {featuredSessions.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
                    Featured Sessions
                  </h2>
                  <div className="grid gap-6 md:grid-cols-2">
                    {featuredSessions.map((session) => (
                      <FeaturedSessionCard
                        key={session.id}
                        session={session}
                        eventSlug={event.Slug}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* All Sessions grouped by date */}
              {Object.entries(grouped).map(([date, dateSessions]) => (
                <div key={date}>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
                    {date}
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {dateSessions.map((session) => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        eventSlug={event.Slug}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Full Schedule Timetable */}
      {!isLoading && sessions.length > 0 && (
        <section
          ref={timetableRef}
          className="py-16 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <span className="inline-block mb-3 h-1 w-16 bg-yellow-500" />
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Full Schedule
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                All sessions in chronological order
              </p>
            </div>

            <div className="space-y-10">
              {Object.entries(timetableGrouped).map(([date, dateSessions]) => (
                <div key={date}>
                  <div className="sticky top-14 z-10 bg-gray-50 dark:bg-gray-800 py-2 mb-4">
                    <h3 className="text-lg font-bold px-4 py-2 bg-gray-900 text-white dark:bg-white dark:text-gray-900 inline-block">
                      {date}
                    </h3>
                  </div>

                  <div className="space-y-0">
                    {dateSessions.map((session, idx) => {
                      const startTime = new Date(session.StartDate).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      });
                      const endTime = new Date(session.EndDate).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      });
                      const isLast = idx === dateSessions.length - 1;

                      return (
                        <Link
                          key={session.id}
                          href={`/events/${event.Slug}/sessions/${session.Slug}`}
                          className="group block"
                        >
                          <div className={`flex gap-4 sm:gap-6 py-4 px-4 hover:bg-white dark:hover:bg-gray-700 transition-colors ${
                            !isLast ? "border-b border-gray-200 dark:border-gray-700" : ""
                          }`}>
                            {/* Time column */}
                            <div className="flex-shrink-0 w-20 sm:w-28 pt-0.5">
                              <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {startTime}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {endTime}
                              </p>
                            </div>

                            {/* Yellow timeline dot */}
                            <div className="flex-shrink-0 relative hidden sm:flex flex-col items-center">
                              <div className="w-3 h-3 rounded-full bg-yellow-500 mt-1.5" />
                              {!isLast && (
                                <div className="w-px flex-1 bg-gray-300 dark:bg-gray-600" />
                              )}
                            </div>

                            {/* Session details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-yellow-500 transition-colors truncate">
                                  {session.Title}
                                </h4>
                                <div className="flex gap-1.5 flex-shrink-0">
                                  {session.SessionType && (
                                    <Chip variant="secondary" size="sm">
                                      {session.SessionType}
                                    </Chip>
                                  )}
                                  {session.format && (
                                    <Chip variant="outline" size="sm">
                                      {session.format}
                                    </Chip>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                                {session.speakers && session.speakers.length > 0 && (
                                  <span className="flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    {session.speakers.map((s) => s.Name).join(", ")}
                                  </span>
                                )}
                                {session.venue?.Name && (
                                  <span className="flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {session.venue.Name}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

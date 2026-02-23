"use client";

import Link from "next/link";
import { useEventContext, VenueData } from "@/components/event/EventContext";
import { useEventSessions } from "@/lib/hooks/useEventSessions";
import { SessionWithSpeakers } from "@/lib/utils/speakers";
import { PageBanner } from "@/components/event/PageBanner";
import { VenueDetail, VenueDetailData } from "@/components/venue/VenueDetail";

export default function VenuePage() {
  const event = useEventContext();
  const mainVenue = event.venue as VenueData | null;

  const { data: sessionsData } = useEventSessions(event.Slug);
  const sessions = (sessionsData?.data ?? []) as SessionWithSpeakers[];

  // Group sessions by venue (including main venue)
  const venueSessionsMap = new Map<
    number,
    { venue: VenueData; sessions: SessionWithSpeakers[] }
  >();

  for (const session of sessions) {
    const sv = session.venue as VenueData | undefined;
    if (sv?.id) {
      if (!venueSessionsMap.has(sv.id)) {
        venueSessionsMap.set(sv.id, { venue: sv, sessions: [] });
      }
      venueSessionsMap.get(sv.id)!.sessions.push(session);
    }
  }

  // Main venue first, then others
  const allVenueGroups = Array.from(venueSessionsMap.values());
  const mainGroup = mainVenue
    ? allVenueGroups.find((g) => g.venue.id === mainVenue.id)
    : null;
  const otherGroups = allVenueGroups.filter(
    (g) => !mainVenue || g.venue.id !== mainVenue.id
  );

  return (
    <main className="bg-white dark:bg-gray-900">
      <PageBanner title="Venue" subtitle={event.Location} />

      {/* Main venue */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {mainVenue ? (
            <VenueDetail venue={mainVenue as VenueDetailData} />
          ) : (
            <div className="text-center py-16 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
              <div className="w-16 h-16 bg-blue-600 mx-auto mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {event.Location}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Detailed venue information will be announced soon.
              </p>
            </div>
          )}

          {/* Sessions at main venue */}
          {mainGroup && mainGroup.sessions.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Sessions at {mainVenue!.Name}
              </h3>
              <SessionList sessions={mainGroup.sessions} eventSlug={event.Slug} />
            </div>
          )}
        </div>
      </section>

      {/* Other venues with their sessions */}
      {otherGroups.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="inline-block mb-3 h-1 w-16 bg-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              Other Session Venues
            </h2>

            <div className="space-y-12">
              {otherGroups.map(({ venue, sessions: venueSessions }) => (
                <div key={venue.id}>
                  <VenueDetail venue={venue as VenueDetailData} compact />
                  {venueSessions.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                        Sessions at this venue
                      </h3>
                      <SessionList sessions={venueSessions} eventSlug={event.Slug} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function SessionList({
  sessions,
  eventSlug,
}: {
  sessions: SessionWithSpeakers[];
  eventSlug: string;
}) {
  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {sessions.map((session) => {
        const startTime = new Date(session.StartDate).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const dateStr = new Date(session.StartDate).toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });

        return (
          <Link
            key={session.id}
            href={`/events/${eventSlug}/sessions/${session.Slug}`}
            className="group flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex-shrink-0 w-20 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">{dateStr}</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{startTime}</p>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white group-hover:text-yellow-500 transition-colors truncate">
                {session.Title}
              </p>
              {session.speakers && session.speakers.length > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {session.speakers.map((s) => s.Name).join(", ")}
                </p>
              )}
            </div>
            {session.SessionType && (
              <span className="flex-shrink-0 text-xs font-medium px-2 py-0.5 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300">
                {session.SessionType as string}
              </span>
            )}
            <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        );
      })}
    </div>
  );
}

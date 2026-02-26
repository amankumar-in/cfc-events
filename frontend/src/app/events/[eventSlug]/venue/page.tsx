"use client";

import Link from "next/link";
import { useEventContext, VenueData } from "@/components/event/EventContext";
import { useEventSessions } from "@/lib/hooks/useEventSessions";
import { SessionWithSpeakers } from "@/lib/utils/speakers";
import { getStrapiURL } from "@/lib/api/api-config";
import { PageBanner } from "@/components/event/PageBanner";
import { VenueDetailData } from "@/components/venue/VenueDetail";

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
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left: Map card — sticky on desktop */}
              <div className="lg:w-[30%] flex-shrink-0">
                <div className="lg:sticky lg:top-20">
                  <MapCard venue={mainVenue as VenueDetailData} />
                </div>
              </div>

              {/* Right: Details + Sessions */}
              <div className="lg:w-[70%] min-w-0">
                <VenueInfo venue={mainVenue as VenueDetailData} />

                {mainGroup && mainGroup.sessions.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                      Sessions at {mainVenue.Name}
                    </h3>
                    <SessionList sessions={mainGroup.sessions} eventSlug={event.Slug} />
                  </div>
                )}
              </div>
            </div>
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
                <div key={venue.id} className="flex flex-col lg:flex-row gap-8">
                  {/* Left: Map card */}
                  <div className="lg:w-[30%] flex-shrink-0">
                    <MapCard venue={venue as VenueDetailData} />
                  </div>

                  {/* Right: Sessions */}
                  <div className="lg:w-[70%] min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                      Sessions at {venue.Name}
                    </h3>
                    {venueSessions.length > 0 ? (
                      <SessionList sessions={venueSessions} eventSlug={event.Slug} />
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        No sessions scheduled at this venue yet.
                      </p>
                    )}
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

function parseMapUrl(raw: string): string {
  if (raw.includes('src="')) {
    return raw.match(/src="([^"]+)"/)?.[1] ?? raw;
  }
  return raw;
}

function MapCard({ venue }: { venue: VenueDetailData }) {
  const hasMap = !!venue.MapEmbedURL;

  return (
    <div className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 overflow-hidden">
      <div className="aspect-square bg-gray-100 dark:bg-gray-700">
        {hasMap ? (
          <iframe
            src={parseMapUrl(venue.MapEmbedURL!)}
            className="w-full h-full"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`${venue.Name} Map`}
          />
        ) : venue.MainImage ? (
          <img
            src={getStrapiURL(venue.MainImage.url)}
            alt={venue.Name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        )}
      </div>
      {/* Address below map */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 dark:text-white mb-1">{venue.Name}</h3>
        {(venue.Address || venue.City) && (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {venue.Address}
            {venue.Address && venue.City ? ", " : ""}
            {venue.City}
            {venue.Country ? `, ${venue.Country}` : ""}
          </p>
        )}
      </div>
    </div>
  );
}

function VenueInfo({ venue }: { venue: VenueDetailData }) {
  const hasDescription =
    venue.Description && Array.isArray(venue.Description) && venue.Description.length > 0;
  const hasContact = venue.Phone || venue.Email || venue.Website;

  return (
    <div>
      <span className="inline-block mb-3 h-1 w-16 bg-yellow-500" />
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{venue.Name}</h2>

      {/* Contact details */}
      {hasContact && (
        <div className="space-y-2 mb-6">
          {venue.Phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <svg className="h-4 w-4 text-yellow-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{venue.Phone}</span>
            </div>
          )}
          {venue.Email && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <svg className="h-4 w-4 text-yellow-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <a href={`mailto:${venue.Email}`} className="hover:text-yellow-500 transition-colors">{venue.Email}</a>
            </div>
          )}
          {venue.Website && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <svg className="h-4 w-4 text-yellow-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <a href={venue.Website} target="_blank" rel="noopener noreferrer" className="hover:text-yellow-500 transition-colors">
                {venue.Website.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}
        </div>
      )}

      {/* Description */}
      {hasDescription && (
        <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
          {(venue.Description as { type: string; children?: { text?: string }[] }[]).map((block, i) => {
            const text = block.children?.map((c) => c.text ?? "").join("") ?? "";
            if (block.type === "heading") {
              return <h3 key={i} className="text-lg font-bold mt-4 mb-2 text-gray-900 dark:text-white">{text}</h3>;
            }
            return <p key={i} className="mb-2">{text}</p>;
          })}
        </div>
      )}
    </div>
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

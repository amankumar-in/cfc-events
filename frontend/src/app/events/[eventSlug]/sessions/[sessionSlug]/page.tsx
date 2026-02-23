"use client";

import { use } from "react";
import { useEventContext } from "@/components/event/EventContext";
import { useSession } from "@/lib/hooks/useSession";
import { useSessionStatus } from "@/lib/hooks/useSessionStatus";
import { SessionStatusBadge } from "@/components/session/SessionStatusBadge";
import { AccessGate } from "@/components/auth/AccessGate";
import DailyRoom from "@/components/daily/DailyRoom";
import DailyCall from "@/components/daily/DailyCall";
import DailyLivestream from "@/components/daily/DailyLivestream";
import RecordingPlayer from "@/components/daily/RecordingPlayer";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { getStrapiURL } from "@/lib/api/api-config";
import Link from "next/link";
import { VenueDetail, VenueDetailData } from "@/components/venue/VenueDetail";

export default function SessionDetailPage({
  params,
}: {
  params: Promise<{ eventSlug: string; sessionSlug: string }>;
}) {
  const { sessionSlug } = use(params);
  const event = useEventContext();
  const { data: session, isLoading } = useSession(sessionSlug);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-12 h-12 border-t-2 border-yellow-500 border-solid rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-24">
        <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Session Not Found
        </p>
        <Button variant="primary" href={`/events/${event.Slug}/sessions`}>
          Back to Sessions
        </Button>
      </div>
    );
  }

  return <SessionContent session={session} event={event} />;
}

function SessionContent({
  session,
  event,
}: {
  session: Record<string, unknown>;
  event: { id: number; Slug: string };
}) {
  const status = useSessionStatus(
    session.StartDate as string,
    session.EndDate as string
  );

  const format = (session.format as string) ?? "in-person";
  const sessionType = (session.streamType as string) ?? "call";
  const roomUrl = session.dailyRoomUrl as string | undefined;
  const recordingUrl = session.recordingUrl as string | undefined;
  const speakers = (session.speakers as { id: number; Name: string; Slug: string; Title?: string; Organization?: string; ProfileImage?: { url: string } }[]) ?? [];
  const venue = session.venue as { Name?: string; Address?: string; City?: string } | undefined;

  const formattedStart = new Date(session.StartDate as string).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const formattedEnd = new Date(session.EndDate as string).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className="bg-white dark:bg-gray-900">
      {/* Session header */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
            <SessionStatusBadge
              startDate={session.StartDate as string}
              endDate={session.EndDate as string}
            />
            <div className="flex gap-2">
              {session.SessionType && (
                <Chip variant="primary" size="sm">
                  {session.SessionType as string}
                </Chip>
              )}
              {format && (
                <Chip variant="outline" size="sm">
                  {format}
                </Chip>
              )}
              {sessionType && (
                <Chip variant="secondary" size="sm">
                  {sessionType}
                </Chip>
              )}
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {session.Title as string}
          </h1>

          <div className="flex flex-wrap gap-6 text-gray-600 dark:text-gray-300">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{formattedStart} - {formattedEnd}</span>
            </div>
            {venue?.Name && (
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{venue.Name}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Status notice */}
      {status === "upcoming" && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border-b border-blue-200 dark:border-blue-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
            <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            This session has not started yet. Check back at the scheduled time.
          </div>
        </div>
      )}

      {status === "past" && !recordingUrl && (
        <div className="bg-amber-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-sm text-white font-medium">
            <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            This session has concluded. No recording is available.
          </div>
        </div>
      )}

      {status === "live" && format === "in-person" && (
        <div className="bg-green-50 dark:bg-green-900/30 border-b border-green-200 dark:border-green-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
            <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Happening now{venue?.Name ? ` at ${venue.Name}` : ""} — head to the venue to join.
          </div>
        </div>
      )}

      {/* Live stream / Recording */}
      {status === "live" && (format === "virtual" || format === "hybrid") && roomUrl && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AccessGate eventId={event.id} eventSlug={event.Slug} sessionId={session.id as number}>
              <div className="border border-gray-200 dark:border-gray-700 overflow-hidden" style={{ height: "70vh" }}>
                <DailyRoom sessionId={session.id as number} roomUrl={roomUrl}>
                  {sessionType === "livestream" ? (
                    <DailyLivestream />
                  ) : (
                    <DailyCall />
                  )}
                </DailyRoom>
              </div>
            </AccessGate>
          </div>
        </section>
      )}

      {status === "past" && recordingUrl && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Session Recording
            </h2>
            <RecordingPlayer
              recordingUrl={recordingUrl}
              title={session.Title as string}
            />
          </div>
        </section>
      )}

      {/* Session details — always visible */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {session.ShortDescription && (
            <div className="prose dark:prose-invert max-w-3xl mb-10">
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {session.ShortDescription as string}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-6 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{formattedStart} - {formattedEnd}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="capitalize">{format}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Venue */}
      {venue?.Name && (
        <section className="py-12 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Venue</h2>
            <div className="max-w-2xl">
              <VenueDetail venue={venue as VenueDetailData} compact />
            </div>
          </div>
        </section>
      )}

      {/* Speakers */}
      {speakers.length > 0 && (
        <section className="py-12 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Speakers
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {speakers.map((speaker) => (
                <Link
                  key={speaker.id}
                  href={`/events/${event.Slug}/speakers/${speaker.Slug}`}
                  className="group block"
                >
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:border-yellow-500 transition-colors h-full">
                    <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative">
                      {speaker.ProfileImage ? (
                        <img
                          src={getStrapiURL(speaker.ProfileImage.url)}
                          alt={speaker.Name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-400 text-3xl font-bold">
                            {speaker.Name.charAt(0)}
                          </span>
                        </div>
                      )}
                      {speaker.Organization && (
                        <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white py-1 px-3">
                          <div className="text-xs uppercase tracking-wider truncate">
                            {speaker.Organization}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold mb-1 group-hover:text-yellow-500 transition-colors text-gray-900 dark:text-white">
                        {speaker.Name}
                      </h3>
                      {speaker.Title && (
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          {speaker.Title}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

"use client";

import { useEventContext } from "@/components/event/EventContext";
import { useEventSessions } from "@/lib/hooks/useEventSessions";
import {
  extractSpeakersFromSessions,
  SessionSpeaker,
  SessionWithSpeakers,
} from "@/lib/utils/speakers";
import { getStrapiURL } from "@/lib/api/api-config";
import Link from "next/link";
import { PageBanner } from "@/components/event/PageBanner";

export default function SpeakersPage() {
  const event = useEventContext();
  const { data: sessionsData, isLoading } = useEventSessions(event.Slug);
  const sessions = (sessionsData?.data ?? []) as SessionWithSpeakers[];
  const speakers = extractSpeakersFromSessions(sessions);

  const featuredSpeakers = speakers.filter((s) => s.Featured);
  const otherSpeakers = speakers.filter((s) => !s.Featured);

  return (
    <main className="bg-white dark:bg-gray-900">
      <PageBanner title="Speakers" subtitle={`Meet the speakers at ${event.Title}`} />

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-12 h-12 border-t-2 border-yellow-500 border-solid rounded-full animate-spin" />
            </div>
          ) : speakers.length === 0 ? (
            <div className="text-center py-16 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
              <p className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                Speakers Coming Soon
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Speaker announcements will be made soon.
              </p>
            </div>
          ) : (
            <div className="space-y-16">
              {/* Featured Speakers — large horizontal cards */}
              {featuredSpeakers.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
                    Featured Speakers
                  </h2>
                  <div className="grid gap-6 md:grid-cols-2">
                    {featuredSpeakers.map((speaker) => (
                      <FeaturedSpeakerCard
                        key={speaker.id}
                        speaker={speaker}
                        eventSlug={event.Slug}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Other Speakers — regular grid */}
              {otherSpeakers.length > 0 && (
                <div>
                  {featuredSpeakers.length > 0 && (
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
                      All Speakers
                    </h2>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {otherSpeakers.map((speaker) => (
                      <SpeakerCard
                        key={speaker.id}
                        speaker={speaker}
                        eventSlug={event.Slug}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

/* ─── Featured Speaker Card — horizontal layout with gradient ─── */

function FeaturedSpeakerCard({
  speaker,
  eventSlug,
}: {
  speaker: SessionSpeaker;
  eventSlug: string;
}) {
  return (
    <Link
      href={`/events/${eventSlug}/speakers/${speaker.Slug}`}
      className="group block"
    >
      <div className="flex flex-col sm:flex-row h-full border border-gray-200 dark:border-gray-600 overflow-hidden hover:border-yellow-500 transition-colors">
        {/* Photo */}
        <div className="sm:w-2/5 flex-shrink-0 bg-gray-100 dark:bg-gray-700">
          {speaker.ProfileImage ? (
            <img
              src={getStrapiURL(speaker.ProfileImage.url)}
              alt={speaker.Name}
              className="w-full h-full object-cover min-h-[240px] sm:min-h-full"
            />
          ) : (
            <div className="w-full h-full min-h-[240px] flex items-center justify-center">
              <span className="text-gray-400 text-6xl font-bold">
                {speaker.Name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Content with gradient */}
        <div className="sm:w-3/5 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-800 dark:via-gray-750 dark:to-gray-900 p-6 flex flex-col justify-between text-white">
          <div>
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-yellow-500 text-black mb-3">
              <svg
                className="w-3 h-3 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Featured Speaker
            </span>

            <h3 className="text-xl font-bold mb-1 group-hover:text-yellow-500 transition-colors">
              {speaker.Name}
            </h3>

            {speaker.Title && (
              <p className="text-gray-300 text-sm mb-1">{speaker.Title}</p>
            )}

            {speaker.Organization && (
              <p className="text-yellow-500 text-sm font-medium mb-4">
                {speaker.Organization}
              </p>
            )}

            {(speaker.ShortBio || speaker.Bio) && (
              <p className="text-sm text-gray-300 line-clamp-3">
                {speaker.ShortBio || speaker.Bio}
              </p>
            )}
          </div>

          {/* Social links */}
          {(speaker.LinkedIn || speaker.Twitter || speaker.Website) && (
            <div className="flex gap-3 mt-4">
              {speaker.LinkedIn && (
                <span className="text-gray-400 hover:text-white">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </span>
              )}
              {speaker.Twitter && (
                <span className="text-gray-400 hover:text-white">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </span>
              )}
              {speaker.Website && (
                <span className="text-gray-400 hover:text-white">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ─── Regular Speaker Card ─── */

function SpeakerCard({
  speaker,
  eventSlug,
}: {
  speaker: SessionSpeaker;
  eventSlug: string;
}) {
  return (
    <Link
      href={`/events/${eventSlug}/speakers/${speaker.Slug}`}
      className="group block"
    >
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 h-full hover:border-yellow-500 transition-colors">
        <div className="aspect-square w-full bg-gray-100 dark:bg-gray-700 relative">
          {speaker.ProfileImage ? (
            <img
              src={getStrapiURL(speaker.ProfileImage.url)}
              alt={speaker.Name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400 text-4xl font-bold">
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
  );
}

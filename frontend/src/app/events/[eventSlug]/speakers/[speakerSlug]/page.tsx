"use client";

import { use } from "react";
import { useEventContext } from "@/components/event/EventContext";
import { useEventSessions } from "@/lib/hooks/useEventSessions";
import {
  extractSpeakersFromSessions,
  getSessionsForSpeaker,
  SessionWithSpeakers,
} from "@/lib/utils/speakers";
import { getStrapiURL } from "@/lib/api/api-config";
import { Button } from "@/components/ui/Button";
import { SessionCard } from "@/components/session/SessionCard";

export default function SpeakerDetailPage({
  params,
}: {
  params: Promise<{ eventSlug: string; speakerSlug: string }>;
}) {
  const { speakerSlug } = use(params);
  const event = useEventContext();
  const { data: sessionsData, isLoading } = useEventSessions(event.Slug);
  const sessions = (sessionsData?.data ?? []) as SessionWithSpeakers[];
  const speakers = extractSpeakersFromSessions(sessions);
  const speaker = speakers.find((s) => s.Slug === speakerSlug);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-12 h-12 border-t-2 border-yellow-500 border-solid rounded-full animate-spin" />
      </div>
    );
  }

  if (!speaker) {
    return (
      <div className="text-center py-24">
        <p className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Speaker Not Found
        </p>
        <Button variant="primary" href={`/events/${event.Slug}/speakers`}>
          Back to Speakers
        </Button>
      </div>
    );
  }

  const speakerSessions = getSessionsForSpeaker(sessions, speaker.id);

  const socialLinks = (
    <>
      {speaker.LinkedIn && (
        <a href={speaker.LinkedIn} target="_blank" rel="noopener noreferrer"
          className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
          aria-label="LinkedIn">
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
          </svg>
        </a>
      )}
      {speaker.Twitter && (
        <a href={speaker.Twitter} target="_blank" rel="noopener noreferrer"
          className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
          aria-label="Twitter">
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
          </svg>
        </a>
      )}
      {speaker.Website && (
        <a href={speaker.Website} target="_blank" rel="noopener noreferrer"
          className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
          aria-label="Website">
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
        </a>
      )}
    </>
  );

  const hasSocial = speaker.LinkedIn || speaker.Twitter || speaker.Website;

  return (
    <main className="bg-white dark:bg-gray-900">
      {/* Mobile: profile header */}
      <section className="md:hidden py-8">
        <div className="px-4">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 flex-shrink-0">
              {speaker.ProfileImage ? (
                <img
                  src={getStrapiURL(speaker.ProfileImage.url)}
                  alt={speaker.Name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400 text-2xl font-bold">
                    {speaker.Name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 flex-wrap">
                {speaker.Name}
                {speaker.Featured && (
                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-yellow-500 text-black">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Featured
                  </span>
                )}
              </h1>
              {speaker.Title && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">{speaker.Title}</p>
              )}
              {speaker.Organization && (
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-0.5">{speaker.Organization}</p>
              )}
              {hasSocial && (
                <div className="mt-2 flex gap-2">{socialLinks}</div>
              )}
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mt-6">
            {speaker.Bio || speaker.ShortBio || "Bio coming soon."}
          </p>
        </div>
      </section>

      {/* Desktop: sidebar layout */}
      <section className="hidden md:block py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-12">
            <div className="sticky top-20 self-start">
              <div className="aspect-square bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                {speaker.ProfileImage ? (
                  <img
                    src={getStrapiURL(speaker.ProfileImage.url)}
                    alt={speaker.Name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400 text-6xl font-bold">
                      {speaker.Name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              {hasSocial && (
                <div className="mt-4 flex gap-3">{socialLinks}</div>
              )}
            </div>

            <div className="col-span-2">
              <span className="inline-block mb-3 h-1 w-16 bg-yellow-500" />
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3 flex-wrap">
                {speaker.Name}
                {speaker.Featured && (
                  <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-yellow-500 text-black">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Featured
                  </span>
                )}
              </h1>
              {speaker.Title && (
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
                  {speaker.Title}
                </p>
              )}
              {speaker.Organization && (
                <p className="text-lg text-blue-600 dark:text-blue-400 mb-6">
                  {speaker.Organization}
                </p>
              )}

              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  {speaker.Bio || speaker.ShortBio || "Bio coming soon."}
                </p>
              </div>

              {/* Sessions — inside right column on desktop */}
              {speakerSessions.length > 0 && (
                <div className="mt-10 pt-10 border-t border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Sessions
                  </h2>
                  <div className="grid gap-4">
                    {speakerSessions.map((session) => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        eventSlug={event.Slug}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8">
                <Button
                  variant="primary"
                  buttonType="outline"
                  href={`/events/${event.Slug}/speakers`}
                >
                  Back to All Speakers
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sessions — mobile only (below the profile section) */}
      {speakerSessions.length > 0 && (
        <section className="md:hidden py-10 border-t border-gray-200 dark:border-gray-700">
          <div className="px-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Sessions
            </h2>
            <div className="grid gap-4">
              {speakerSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  eventSlug={event.Slug}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="md:hidden px-4 py-8">
        <Button
          variant="primary"
          buttonType="outline"
          href={`/events/${event.Slug}/speakers`}
        >
          Back to All Speakers
        </Button>
      </div>
    </main>
  );
}

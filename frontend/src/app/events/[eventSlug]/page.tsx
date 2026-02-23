"use client";

import { useEventContext } from "@/components/event/EventContext";
import { EventHero } from "@/components/event/EventHero";
import { Button } from "@/components/ui/Button";
import { getStrapiURL } from "@/lib/api/api-config";
import { useEventSessions } from "@/lib/hooks/useEventSessions";
import { FeaturedSessionCard } from "@/components/session/FeaturedSessionCard";
import Marquee from "react-fast-marquee";
import Link from "next/link";
import {
  extractSpeakersFromSessions,
  SessionWithSpeakers,
} from "@/lib/utils/speakers";

interface BlockChild {
  type: string;
  text?: string;
  bold?: boolean;
  italic?: boolean;
  children?: BlockChild[];
}

interface Block {
  type: string;
  level?: number;
  children?: BlockChild[];
}

function renderBlockText(children: BlockChild[]): React.ReactNode[] {
  return children.map((child, i) => {
    let node: React.ReactNode = child.text ?? "";
    if (child.bold) node = <strong key={i}>{node}</strong>;
    if (child.italic) node = <em key={i}>{node}</em>;
    return node;
  });
}

function renderBlocks(blocks: Block[]) {
  return blocks.map((block, i) => {
    const content = block.children ? renderBlockText(block.children) : null;
    if (block.type === "heading") {
      return (
        <h3 key={i} className="text-xl font-bold mt-6 mb-3 text-gray-900 dark:text-white">
          {content}
        </h3>
      );
    }
    if (block.type === "list") {
      return (
        <ul key={i} className="list-disc list-inside mb-4 space-y-1">
          {block.children?.map((item, j) => (
            <li key={j}>{item.children ? renderBlockText(item.children) : item.text}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={i} className="mb-4 leading-relaxed">
        {content}
      </p>
    );
  });
}

export default function EventLandingPage() {
  const event = useEventContext();
  const { data: sessionsData } = useEventSessions(event.Slug);
  const sessions = (sessionsData?.data ?? []) as SessionWithSpeakers[];
  const speakers = extractSpeakersFromSessions(sessions);
  const sponsors = event.sponsors ?? [];

  // Featured speakers first (already sorted by extractSpeakersFromSessions),
  // take up to 4
  const previewSpeakers = speakers.slice(0, 4);

  // Featured sessions: featured first, fill to 4 with non-featured
  const featuredSessions = sessions.filter((s) => s.FeaturedSession);
  const nonFeaturedSessions = sessions.filter((s) => !s.FeaturedSession);
  const highlightSessions = [
    ...featuredSessions,
    ...nonFeaturedSessions,
  ].slice(0, 4);

  // Check if Description (blocks) has meaningful content
  const descriptionBlocks = event.Description as Block[] | undefined;
  const hasDescription =
    Array.isArray(descriptionBlocks) && descriptionBlocks.length > 0;

  return (
    <main className="bg-white dark:bg-gray-900">
      <EventHero event={event} />

      {/* About — only show if Description blocks exist (not the same as hero ShortDescription) */}
      {hasDescription && (
        <section className="py-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <span className="inline-block mb-3 h-1 w-16 bg-yellow-500" />
              <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                About This Event
              </h2>
              <div className="text-lg text-gray-600 dark:text-gray-300">
                {renderBlocks(descriptionBlocks!)}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Session Highlights */}
      {highlightSessions.length > 0 && (
        <section className="py-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <span className="inline-block mb-3 h-1 w-16 bg-yellow-500" />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Session Highlights
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Don&apos;t miss these key sessions
                </p>
              </div>
              <Button
                variant="primary"
                buttonType="outline"
                href={`/events/${event.Slug}/sessions`}
              >
                View All Sessions
              </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {highlightSessions.map((session) => (
                <FeaturedSessionCard
                  key={session.id}
                  session={session}
                  eventSlug={event.Slug}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Speakers */}
      {previewSpeakers.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <span className="inline-block mb-3 h-1 w-16 bg-yellow-500" />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Featured Speakers
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Leading voices at {event.Title}
                </p>
              </div>
              <Button
                variant="primary"
                buttonType="outline"
                href={`/events/${event.Slug}/speakers`}
              >
                View All Speakers
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {previewSpeakers.map((speaker) => (
                <Link
                  key={speaker.id}
                  href={`/events/${event.Slug}/speakers/${speaker.Slug}`}
                  className="group block"
                >
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:border-yellow-500 transition-colors">
                    <div className="aspect-square w-full bg-gray-100 dark:bg-gray-700 relative">
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
                      {speaker.Featured && (
                        <span className="absolute top-2 left-2 inline-flex items-center px-2 py-0.5 text-xs font-medium bg-yellow-500 text-black">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-yellow-500 transition-colors">
                        {speaker.Name}
                      </h3>
                      {speaker.Title && (
                        <p className="text-sm text-gray-600 dark:text-gray-300">
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

      {/* Sponsors — logo marquee */}
      {sponsors.length > 0 && (
        <section className="py-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
            <div className="flex justify-between items-end">
              <div>
                <span className="inline-block mb-3 h-1 w-16 bg-blue-600" />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Our Sponsors
                </h2>
              </div>
              <Button
                variant="primary"
                buttonType="outline"
                href={`/events/${event.Slug}/sponsors`}
              >
                View All
              </Button>
            </div>
          </div>
          <Marquee speed={40} pauseOnHover gradient={false} autoFill>
            {sponsors.map((sponsor) => (
              <div key={sponsor.id} className="mx-10">
                {sponsor.Logo ? (
                  <img
                    src={getStrapiURL(sponsor.Logo.url)}
                    alt={sponsor.Name}
                    className="h-12 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
                  />
                ) : (
                  <span className="text-lg font-bold text-gray-400 whitespace-nowrap">
                    {sponsor.Name}
                  </span>
                )}
              </div>
            ))}
          </Marquee>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Join This Event</h2>
          <p className="text-xl text-white/80 mb-8">
            Get your tickets and access all sessions.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              href={`/events/${event.Slug}/tickets`}
            >
              Get Tickets
            </Button>
            <Button
              variant="light"
              buttonType="outline"
              size="lg"
              href={`/events/${event.Slug}/sessions`}
            >
              View Sessions
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

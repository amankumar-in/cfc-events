"use client";

import { useEventContext } from "@/components/event/EventContext";
import { useEventSessions } from "@/lib/hooks/useEventSessions";
import Link from "next/link";
import { Chip } from "@/components/ui/Chip";
import { PageBanner } from "@/components/event/PageBanner";

export default function ArchivePage() {
  const event = useEventContext();
  const { data, isLoading } = useEventSessions(event.Slug);

  const allSessions = data?.data ?? [];
  const pastSessions = allSessions.filter(
    (s: { EndDate: string }) => new Date(s.EndDate) < new Date()
  );
  const recordedSessions = pastSessions.filter(
    (s: { RecordingUrl?: string }) => s.RecordingUrl
  );

  return (
    <main className="bg-white dark:bg-gray-900">
      <PageBanner title="Archive" subtitle={`Past sessions and recordings from ${event.Title}`} />

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-12 h-12 border-t-2 border-yellow-500 border-solid rounded-full animate-spin" />
            </div>
          ) : recordedSessions.length === 0 ? (
            <div className="text-center py-16 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
              <p className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                No Recordings Available
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                {pastSessions.length > 0
                  ? "Past sessions don't have recordings available yet."
                  : "No past sessions to show."}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recordedSessions.map(
                (session: {
                  id: number;
                  Title: string;
                  Slug: string;
                  StartDate: string;
                  EndDate: string;
                  RecordingUrl?: string;
                  speakers?: { id: number; Name: string }[];
                }) => (
                  <Link
                    key={session.id}
                    href={`/events/${event.Slug}/sessions/${session.Slug}`}
                    className="group block"
                  >
                    <div className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-yellow-500 transition-colors">
                      <div className="aspect-video bg-gray-900 relative flex items-center justify-center">
                        <svg className="w-12 h-12 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="absolute top-3 left-3">
                          <Chip variant="primary" size="sm">
                            Recording
                          </Chip>
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-yellow-500 transition-colors">
                          {session.Title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {new Date(session.StartDate).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        {session.speakers && session.speakers.length > 0 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {session.speakers.map((s) => s.Name).join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

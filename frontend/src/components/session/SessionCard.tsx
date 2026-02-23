import Link from "next/link";
import { Chip } from "@/components/ui/Chip";
import { SessionStatusBadge } from "./SessionStatusBadge";
import { getStrapiURL } from "@/lib/api/api-config";

interface SessionCardProps {
  session: {
    id: number;
    Title: string;
    Slug: string;
    StartDate: string;
    EndDate: string;
    format?: string;
    SessionType?: string;
    FeaturedSession?: boolean;
    speakers?: { id: number; Name: string }[];
    venue?: { Name: string };
    Image?: { url: string } | null;
    event?: { Slug: string };
  };
  eventSlug: string;
}

export function SessionCard({ session, eventSlug }: SessionCardProps) {
  const startTime = new Date(session.StartDate).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = new Date(session.EndDate).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Link
      href={`/events/${eventSlug}/sessions/${session.Slug}`}
      className="group block"
    >
      <div className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-yellow-500 transition-colors h-full overflow-hidden">
        {session.Image?.url && (
          <div className="aspect-video w-full bg-gray-100 dark:bg-gray-700">
            <img
              src={getStrapiURL(session.Image.url)}
              alt={session.Title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <SessionStatusBadge
                startDate={session.StartDate}
                endDate={session.EndDate}
              />
              {session.FeaturedSession && (
                <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-yellow-500 text-black">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Featured
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {session.format && (
                <Chip variant="outline" size="sm">
                  {session.format}
                </Chip>
              )}
              {session.SessionType && (
                <Chip variant="secondary" size="sm">
                  {session.SessionType}
                </Chip>
              )}
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-yellow-500 transition-colors">
            {session.Title}
          </h3>

          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-3">
            <svg
              className="h-4 w-4 mr-2 text-yellow-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              {startTime} - {endTime}
            </span>
          </div>

          {session.venue?.Name && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-3">
              <svg
                className="h-4 w-4 mr-2 text-yellow-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>{session.venue.Name}</span>
            </div>
          )}

          {session.speakers && session.speakers.length > 0 && (
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <svg
                className="h-4 w-4 mr-2 text-yellow-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>{session.speakers.map((s) => s.Name).join(", ")}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

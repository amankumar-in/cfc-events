import Link from "next/link";
import { Chip } from "@/components/ui/Chip";
import { SessionStatusBadge } from "./SessionStatusBadge";
import { getStrapiURL } from "@/lib/api/api-config";

interface FeaturedSessionCardProps {
  session: {
    id: number;
    Title: string;
    Slug: string;
    StartDate: string;
    EndDate: string;
    ShortDescription?: string;
    format?: string;
    SessionType?: string;
    speakers?: { id: number; Name: string }[];
    venue?: { Name: string };
    Image?: { url: string } | null;
  };
  eventSlug: string;
}

export function FeaturedSessionCard({
  session,
  eventSlug,
}: FeaturedSessionCardProps) {
  const startTime = new Date(session.StartDate).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = new Date(session.EndDate).toLocaleTimeString([], {
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
      href={`/events/${eventSlug}/sessions/${session.Slug}`}
      className="group block"
    >
      <div className="flex flex-col sm:flex-row h-full border border-gray-200 dark:border-gray-600 overflow-hidden hover:border-yellow-500 transition-colors">
        {/* Image */}
        <div className="sm:w-2/5 flex-shrink-0 bg-gray-100 dark:bg-gray-700">
          {session.Image?.url ? (
            <img
              src={getStrapiURL(session.Image.url)}
              alt={session.Title}
              className="w-full h-full object-cover min-h-[200px] sm:min-h-full"
            />
          ) : (
            <div className="w-full h-full min-h-[200px] flex items-center justify-center">
              <svg
                className="w-16 h-16 text-gray-300 dark:text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="sm:w-3/5 bg-white dark:bg-gray-800 border-t-4 sm:border-t-0 sm:border-l-4 border-blue-600 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <SessionStatusBadge
                startDate={session.StartDate}
                endDate={session.EndDate}
              />
              <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-blue-600 text-white">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Featured
              </span>
              {session.SessionType && (
                <Chip variant="secondary" size="sm">
                  {session.SessionType}
                </Chip>
              )}
            </div>

            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-yellow-500 transition-colors">
              {session.Title}
            </h3>

            {session.ShortDescription && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                {session.ShortDescription}
              </p>
            )}
          </div>

          <div className="space-y-2 mt-auto">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <svg
                className="h-4 w-4 mr-2 text-blue-600 dark:text-yellow-500 flex-shrink-0"
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
                {dateStr} &middot; {startTime} - {endTime}
              </span>
            </div>

            {session.venue?.Name && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <svg
                  className="h-4 w-4 mr-2 text-blue-600 dark:text-yellow-500 flex-shrink-0"
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
                  className="h-4 w-4 mr-2 text-blue-600 dark:text-yellow-500 flex-shrink-0"
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

            {session.format && (
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Chip variant="outline" size="sm">
                  {session.format}
                </Chip>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

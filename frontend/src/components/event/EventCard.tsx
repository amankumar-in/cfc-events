import Link from "next/link";
import { Chip } from "@/components/ui/Chip";
import { getStrapiURL } from "@/lib/api/api-config";

interface EventCardProps {
  event: {
    id: number;
    Title: string;
    Slug: string;
    ShortDescription: string;
    StartDate: string;
    EndDate: string;
    Location: string;
    Category: string;
    isFeatured: boolean;
    Image?: {
      url: string;
      alternativeText?: string | null;
    };
  };
}

export function EventCard({ event }: EventCardProps) {
  const formattedDate = new Date(event.StartDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Link href={`/events/${event.Slug}`} className="group">
      <div className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 h-full flex flex-col">
        <div className="aspect-[4/3] w-full bg-gray-100 dark:bg-gray-700 relative">
          {event.Image ? (
            <img
              src={getStrapiURL(event.Image.url)}
              alt={event.Image.alternativeText || event.Title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400 text-xl">No Image</span>
            </div>
          )}

          <div className="absolute top-0 left-0 p-4">
            <Chip variant="primary" size="sm">
              {event.Category?.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
            </Chip>
          </div>

          {event.isFeatured && (
            <div className="absolute top-0 right-0 p-4">
              <Chip variant="black" size="sm">
                Featured
              </Chip>
            </div>
          )}
        </div>

        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-xl font-bold mb-3 group-hover:text-yellow-500 transition-colors text-gray-900 dark:text-white">
            {event.Title}
          </h3>

          <div className="mb-4 space-y-2">
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <svg
                className="h-5 w-5 mr-3 text-yellow-500 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm">{formattedDate}</span>
            </div>

            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <svg
                className="h-5 w-5 mr-3 text-yellow-500 flex-shrink-0"
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
              <span className="text-sm">{event.Location}</span>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">
            {event.ShortDescription.length > 150
              ? `${event.ShortDescription.substring(0, 150)}...`
              : event.ShortDescription}
          </p>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <span className="inline-flex items-center text-sm font-medium text-black dark:text-white group-hover:text-yellow-500 transition-colors">
              View Details
              <svg
                className="ml-2 h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

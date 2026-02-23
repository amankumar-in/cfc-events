import Link from "next/link";
import { Chip } from "@/components/ui/Chip";
import { getStrapiURL } from "@/lib/api/api-config";

interface FeaturedEventCardProps {
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

export function FeaturedEventCard({ event }: FeaturedEventCardProps) {
  const formattedStart = new Date(event.StartDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const formattedEnd = new Date(event.EndDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const dateRange =
    formattedStart === formattedEnd
      ? formattedStart
      : `${formattedStart} - ${formattedEnd}`;

  return (
    <Link href={`/events/${event.Slug}`} className="group block">
      <div className="flex flex-col sm:flex-row border border-gray-200 dark:border-gray-600 overflow-hidden hover:border-yellow-500 transition-colors">
        {/* Image */}
        <div className="sm:w-2/5 flex-shrink-0 aspect-video sm:aspect-auto bg-gray-100 dark:bg-gray-700 relative">
          {event.Image ? (
            <img
              src={getStrapiURL(event.Image.url)}
              alt={event.Image.alternativeText || event.Title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full min-h-[200px] flex items-center justify-center">
              <span className="text-gray-400 text-2xl font-bold">
                {event.Title.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute top-3 left-3 flex gap-2">
            <Chip variant="primary" size="sm">
              {event.Category?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </Chip>
          </div>
        </div>

        {/* Content */}
        <div className="sm:w-3/5 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 sm:p-8 flex flex-col justify-between text-white">
          <div>
            <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-yellow-500 text-black mb-4">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Featured
            </span>

            <h2 className="text-2xl sm:text-3xl font-bold mb-3 group-hover:text-yellow-500 transition-colors">
              {event.Title}
            </h2>

            <p className="text-gray-300 mb-6 line-clamp-3">
              {event.ShortDescription}
            </p>
          </div>

          <div className="space-y-2 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-yellow-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{dateRange}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-yellow-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{event.Location}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

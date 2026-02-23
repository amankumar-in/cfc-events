import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { getStrapiURL } from "@/lib/api/api-config";

interface EventHeroProps {
  event: {
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
    Banner?: {
      url: string;
      alternativeText?: string | null;
    };
  };
}

export function EventHero({ event }: EventHeroProps) {
  const formattedStart = new Date(event.StartDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedEnd = new Date(event.EndDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <section className="relative bg-gray-900 text-white overflow-hidden">
      {(event.Banner || event.Image) && (
        <div className="absolute inset-0">
          <img
            src={getStrapiURL((event.Banner ?? event.Image)!.url)}
            alt={(event.Banner ?? event.Image)!.alternativeText || event.Title}
            className="w-full h-full object-cover opacity-30"
          />
        </div>
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl">
          <div className="mb-6 flex gap-2">
            <Chip variant="primary" size="md">
              {event.Category?.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
            </Chip>
            {event.isFeatured && (
              <Chip variant="accent" size="md">
                Featured
              </Chip>
            )}
          </div>

          <span className="inline-block mb-4 h-1 w-16 bg-yellow-500" />

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            {event.Title}
          </h1>

          <p className="text-xl text-gray-300 mb-8">{event.ShortDescription}</p>

          <div className="flex flex-wrap gap-6 mb-8 text-gray-300">
            <div className="flex items-center">
              <svg
                className="h-5 w-5 mr-2 text-yellow-500"
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
              <span>
                {formattedStart === formattedEnd
                  ? formattedStart
                  : `${formattedStart} - ${formattedEnd}`}
              </span>
            </div>

            <div className="flex items-center">
              <svg
                className="h-5 w-5 mr-2 text-yellow-500"
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
              <span>{event.Location}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button variant="primary" href={`/events/${event.Slug}/tickets`}>
              Get Tickets
            </Button>
            <Button
              variant="light"
              buttonType="outline"
              href={`/events/${event.Slug}/sessions`}
            >
              View Sessions
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 right-0 w-24 h-24 bg-yellow-500 opacity-80" />
      <div className="absolute top-0 right-0 w-16 h-16 bg-blue-600 opacity-80" />
    </section>
  );
}

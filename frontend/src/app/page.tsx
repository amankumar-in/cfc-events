import { fetchAPI } from "@/lib/api/api-config";
import { EventCard } from "@/components/event/EventCard";
import { Button } from "@/components/ui/Button";

async function getEvents() {
  try {
    const res = await fetchAPI("/events?populate=*&sort=StartDate:asc&pagination[limit]=8");
    return res?.data ?? [];
  } catch {
    return [];
  }
}

async function getFeaturedEvents() {
  try {
    const res = await fetchAPI(
      "/events?filters[isFeatured][$eq]=true&populate=*&sort=StartDate:asc&pagination[limit]=4"
    );
    return res?.data ?? [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [events, featuredEvents] = await Promise.all([
    getEvents(),
    getFeaturedEvents(),
  ]);

  const upcomingEvents = events.filter(
    (e: { EndDate: string }) => new Date(e.EndDate) >= new Date()
  );

  return (
    <main className="bg-white dark:bg-gray-900">
      {/* Hero */}
      <section className="relative bg-gray-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-gray-900 opacity-90" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <span className="inline-block mb-4 h-1 w-16 bg-yellow-500" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Discover Events That Matter
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Browse conferences, sessions, and virtual events. Join live
              streams, connect with speakers, and access recordings.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" size="lg" href="/events">
                Browse Events
              </Button>
              <Button variant="light" buttonType="outline" size="lg" href="/auth/login">
                Sign In
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-yellow-500 opacity-80" />
      </section>

      {/* Featured Events */}
      {featuredEvents.length > 0 && (
        <section className="py-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
              <div>
                <span className="inline-block mb-3 h-1 w-16 bg-yellow-500" />
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  Featured Events
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
                  Don&apos;t miss these highlighted events
                </p>
              </div>
              <Button
                variant="primary"
                buttonType="outline"
                href="/events"
                className="mt-4 md:mt-0"
              >
                View All Events
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredEvents.map((event: { id: number; Title: string; Slug: string; ShortDescription: string; StartDate: string; EndDate: string; Location: string; Category: string; isFeatured: boolean; Image?: { url: string; alternativeText?: string | null } }) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <span className="inline-block mb-3 h-1 w-16 bg-blue-600" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Upcoming Events
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
                Events happening soon
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {upcomingEvents.slice(0, 8).map((event: { id: number; Title: string; Slug: string; ShortDescription: string; StartDate: string; EndDate: string; Location: string; Category: string; isFeatured: boolean; Image?: { url: string; alternativeText?: string | null } }) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Join?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Sign in to register for events, join live sessions, and access
            exclusive content.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button variant="primary" size="lg" href="/events">
              Explore Events
            </Button>
            <Button variant="light" buttonType="outline" size="lg" href="/auth/login">
              Sign In
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

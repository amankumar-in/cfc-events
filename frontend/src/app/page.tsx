import { fetchAPI, getStrapiURL } from "@/lib/api/api-config";
import { EventCard } from "@/components/event/EventCard";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import {
  extractSpeakersFromSessions,
  SessionWithSpeakers,
  SessionSpeaker,
} from "@/lib/utils/speakers";
import {
  Calendar,
  Globe,
  GraduationCap,
  Award,
  MonitorPlay,
  Ticket,
  Mic,
  Users,
  Search,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

// ── Data Fetching ────────────────────────────────────────────────────

async function getFeaturedEvent() {
  try {
    const now = new Date().toISOString();
    const populate = [
      "populate[sessions][populate][speakers][populate][0]=ProfileImage",
      "populate[sessions][populate][Image]=true",
      "populate[Image]=true",
      "populate[Banner]=true",
    ].join("&");

    const res = await fetchAPI(
      `/events?filters[isFeatured][$eq]=true&filters[StartDate][$gte]=${now}&sort=StartDate:asc&pagination[limit]=1&${populate}`
    );
    return res?.data?.[0] ?? null;
  } catch {
    return null;
  }
}

async function getUpcomingEvents() {
  try {
    const now = new Date().toISOString();
    const res = await fetchAPI(
      `/events?filters[StartDate][$gte]=${now}&populate=*&sort=StartDate:asc&pagination[limit]=4`
    );
    return res?.data ?? [];
  } catch {
    return [];
  }
}

// ── Page Component ───────────────────────────────────────────────────

export default async function HomePage() {
  const [featuredEvent, upcomingEvents] = await Promise.all([
    getFeaturedEvent(),
    getUpcomingEvents(),
  ]);

  const eventSlug = featuredEvent?.Slug;
  const sessions: SessionWithSpeakers[] = featuredEvent?.sessions ?? [];
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(a.StartDate).getTime() - new Date(b.StartDate).getTime()
  );
  const speakers: SessionSpeaker[] = extractSpeakersFromSessions(sessions);
  const otherEvents = upcomingEvents.filter(
    (e: { Slug: string }) => e.Slug !== eventSlug
  );

  const heroImage =
    featuredEvent?.Banner?.url || featuredEvent?.Image?.url || null;

  const eventTitle =
    featuredEvent?.Title || "Coins For College Education Fair 2026";
  const eventDescription =
    featuredEvent?.ShortDescription ||
    "A free, virtual education fair connecting Indian students with top colleges and scholarship opportunities worldwide.";
  const eventDate = featuredEvent
    ? new Date(featuredEvent.StartDate).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "June 15, 2026";
  const eventLocation = featuredEvent?.Location || "Online (Virtual)";

  return (
    <main className="bg-white dark:bg-gray-900">
      {/* ── 1. Event-Focused Hero ─────────────────────────────────── */}
      <section className="relative bg-gray-900 text-white overflow-hidden">
        {heroImage && (
          <div className="absolute inset-0">
            <img
              src={getStrapiURL(heroImage)}
              alt=""
              className="w-full h-full object-cover opacity-50"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/70 via-blue-900/40 to-gray-900/60" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <span className="inline-block mb-4 px-4 py-1.5 bg-yellow-500 text-gray-900 text-sm font-bold uppercase tracking-wide">
              100% Scholarship Available
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              {eventTitle}
            </h1>

            <div className="flex flex-wrap gap-6 mb-6 text-gray-300">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-yellow-500" />
                <span>{eventDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-yellow-500" />
                <span>{eventLocation}</span>
              </div>
            </div>

            <p className="text-xl text-gray-300 mb-8 max-w-2xl">
              {eventDescription}
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                variant="primary"
                size="lg"
                href={eventSlug ? `/events/${eventSlug}/tickets` : "/events"}
              >
                Register Free
              </Button>
              <Button
                variant="light"
                buttonType="outline"
                size="lg"
                href={eventSlug ? `/events/${eventSlug}/sessions` : "/events"}
              >
                View Schedule
              </Button>
            </div>
          </div>
        </div>

        {/* Geometric accents */}
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-yellow-500 opacity-80" />
        <div className="absolute top-12 right-24 w-12 h-12 bg-blue-500 opacity-60" />
      </section>

      {/* ── 2. Stats Strip ────────────────────────────────────────── */}
      <section className="py-12 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              {
                icon: GraduationCap,
                value: "50+",
                label: "Colleges Worldwide",
              },
              {
                icon: Award,
                value: "100% Scholarship",
                label: "For Eligible Students",
              },
              {
                icon: MonitorPlay,
                value: "8",
                label: "Expert-Led Sessions",
              },
              { icon: Ticket, value: "Free", label: "Registration" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 mb-3">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. What to Expect ─────────────────────────────────────── */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <span className="inline-block mb-3 h-1 w-16 bg-yellow-500" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              What to Expect
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
              A day packed with insights for your study abroad journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Mic,
                title: "Keynote Speeches",
                description:
                  "Hear from admissions deans and education leaders from top universities in the US, UK, and Australia sharing insider knowledge on what makes applications stand out.",
              },
              {
                icon: Users,
                title: "Breakout Sessions",
                description:
                  "Deep-dive sessions on specific topics like visa processes, financial planning, and choosing the right college — led by experienced counselors and educators.",
              },
              {
                icon: Award,
                title: "Scholarship Guidance",
                description:
                  "Learn proven strategies for finding and winning scholarships from experts who manage over $200 million in annual financial aid for international students.",
              },
              {
                icon: Search,
                title: "College Discovery",
                description:
                  "Explore universities across multiple countries, compare programs, and get your questions answered directly by admissions representatives and alumni.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6"
              >
                <card.icon className="h-8 w-8 text-yellow-500 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {card.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Featured Speakers ──────────────────────────────────── */}
      {speakers.length > 0 && (
        <section className="py-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
              <div>
                <span className="inline-block mb-3 h-1 w-16 bg-yellow-500" />
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  Featured Speakers
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
                  Learn from leading educators and admissions experts
                </p>
              </div>
              {eventSlug && (
                <Button
                  variant="primary"
                  buttonType="outline"
                  href={`/events/${eventSlug}/speakers`}
                  className="mt-4 md:mt-0"
                >
                  View All Speakers
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {speakers.slice(0, 4).map((speaker) => (
                <div
                  key={speaker.id}
                  className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                >
                  <div className="aspect-square w-full bg-gray-100 dark:bg-gray-700 relative">
                    {speaker.ProfileImage?.url ? (
                      <img
                        src={getStrapiURL(speaker.ProfileImage.url)}
                        alt={speaker.Name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl font-bold text-gray-300 dark:text-gray-600">
                          {speaker.Name.charAt(0)}
                        </span>
                      </div>
                    )}
                    {speaker.Featured && (
                      <div className="absolute top-0 right-0 p-3">
                        <Chip variant="primary" size="sm">
                          Featured
                        </Chip>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {speaker.Name}
                    </h3>
                    {speaker.Title && (
                      <p className="text-sm text-yellow-600 dark:text-yellow-500 font-medium">
                        {speaker.Title}
                      </p>
                    )}
                    {speaker.Organization && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {speaker.Organization}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 5. Schedule Preview ───────────────────────────────────── */}
      {sortedSessions.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
              <div>
                <span className="inline-block mb-3 h-1 w-16 bg-yellow-500" />
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  Schedule
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
                  A full day of expert-led sessions — all times in IST
                </p>
              </div>
              {eventSlug && (
                <Button
                  variant="primary"
                  buttonType="outline"
                  href={`/events/${eventSlug}/sessions`}
                  className="mt-4 md:mt-0"
                >
                  View Full Schedule
                </Button>
              )}
            </div>

            <div className="space-y-0">
              {sortedSessions.map((session) => {
                const startTime = new Date(session.StartDate).toLocaleTimeString(
                  "en-IN",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                    timeZone: "Asia/Kolkata",
                  }
                );
                const endTime = new Date(session.EndDate).toLocaleTimeString(
                  "en-IN",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                    timeZone: "Asia/Kolkata",
                  }
                );
                const speakerNames =
                  session.speakers?.map((s) => s.Name).join(", ") || "";

                return (
                  <div
                    key={session.id}
                    className={`flex items-center gap-6 p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 -mt-px ${
                      session.FeaturedSession
                        ? "border-l-4 border-l-yellow-500"
                        : ""
                    }`}
                  >
                    <div className="hidden sm:block w-32 flex-shrink-0 text-sm text-gray-500 dark:text-gray-400">
                      <div>{startTime}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        to {endTime}
                      </div>
                    </div>

                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {session.Title}
                        </h3>
                        {session.SessionType && (
                          <Chip
                            variant={
                              session.FeaturedSession ? "primary" : "secondary"
                            }
                            size="sm"
                          >
                            {session.SessionType}
                          </Chip>
                        )}
                      </div>
                      <div className="sm:hidden text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {startTime} – {endTime}
                      </div>
                      {speakerNames && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {speakerNames}
                        </p>
                      )}
                    </div>

                    {eventSlug && (
                      <a
                        href={`/events/${eventSlug}/sessions`}
                        className="flex-shrink-0 text-gray-400 hover:text-yellow-500 transition-colors"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── 6. About Coins For College ────────────────────────────── */}
      <section className="py-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            <div className="lg:col-span-3">
              <span className="inline-block mb-3 h-1 w-16 bg-yellow-500" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                About Coins For College
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg leading-relaxed">
                Coins For College is on a mission to make international
                education accessible to every Indian student with the talent and
                ambition to study abroad. We provide free resources, expert
                guidance, and direct connections to universities and scholarship
                programs worldwide.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                Since our founding, we&apos;ve helped thousands of students
                navigate the complex world of international admissions, securing
                over $50 million in scholarships across 20+ countries. Our
                education fairs, counseling sessions, and online resources are
                designed to level the playing field for students from all
                backgrounds.
              </p>
              <a
                href="https://coinsforcollege.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-yellow-600 dark:text-yellow-500 font-medium hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors"
              >
                Visit coinsforcollege.org
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            <div className="lg:col-span-2">
              <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-700 relative">
                <img
                  src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&q=80"
                  alt="Students celebrating graduation"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Upcoming Events ────────────────────────────────────── */}
      {otherEvents.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
              <div>
                <span className="inline-block mb-3 h-1 w-16 bg-blue-600" />
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  More Events
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
                  Explore other upcoming events
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
              {otherEvents.map(
                (event: {
                  id: number;
                  Title: string;
                  Slug: string;
                  ShortDescription: string;
                  StartDate: string;
                  EndDate: string;
                  Location: string;
                  Category: string;
                  isFeatured: boolean;
                  Image?: { url: string; alternativeText?: string | null };
                }) => (
                  <EventCard key={event.id} event={event} />
                )
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── 8. Final CTA ──────────────────────────────────────────── */}
      <section className="relative py-16 bg-gray-900 text-white overflow-hidden">
        <div className="absolute top-0 left-0 w-16 h-16 bg-yellow-500 opacity-80" />
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-yellow-500 opacity-60" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Your Future Starts Here
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of students who are taking the first step toward
            their dream of studying abroad. Registration is free.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              href={eventSlug ? `/events/${eventSlug}/tickets` : "/events"}
            >
              Register Free
            </Button>
            <Button
              variant="light"
              buttonType="outline"
              size="lg"
              href={eventSlug ? `/events/${eventSlug}` : "/events"}
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

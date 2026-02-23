"use client";

import { useState, useEffect, useMemo } from "react";
import { fetchAPI } from "@/lib/api/api-config";
import { EventCard } from "@/components/event/EventCard";
import { FeaturedEventCard } from "@/components/event/FeaturedEventCard";
import { Button } from "@/components/ui/Button";

interface Event {
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
}

function formatCategory(category: string): string {
  return category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = useMemo(() => {
    if (!events.length) return ["All"];

    const uniqueCategories = Array.from(
      new Set(events.map((e) => e.Category).filter(Boolean))
    );

    return ["All", ...uniqueCategories.sort()];
  }, [events]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetchAPI("/events?populate=*&sort=StartDate:asc");
        if (response?.data) {
          setEvents(response.data);
        }
      } catch {
        setError("Failed to load events. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    if (activeCategory === "All") return events;
    return events.filter((e) => e.Category === activeCategory);
  }, [events, activeCategory]);

  return (
    <main className="bg-white dark:bg-gray-900">
      {/* Hero */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <span className="inline-block mb-3 h-1 w-16 bg-yellow-500" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            All Events
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl">
            Browse conferences, workshops, panels, and networking events
          </p>
        </div>
      </section>

      {/* Filter - only show if there are events from multiple categories */}
      {categories.length > 2 && (
        <section className="py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-0">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 font-medium text-sm border border-gray-200 dark:border-gray-600 ${
                    activeCategory === category
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "bg-white text-black hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-600"
                  }`}
                >
                  {formatCategory(category)}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Events Grid */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-12 h-12 border-t-2 border-yellow-500 border-solid rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-16 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
              <p className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                Error Loading Events
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
              <Button
                variant="primary"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-16 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
              <p className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                No Events Found
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                There are no events in the {formatCategory(activeCategory)} category.
              </p>
              <Button
                variant="primary"
                onClick={() => setActiveCategory("All")}
              >
                View All Events
              </Button>
            </div>
          ) : (
            <>
              {/* Featured events — full width */}
              {filteredEvents.filter((e) => e.isFeatured).length > 0 && (
                <div className="space-y-6 mb-12">
                  {filteredEvents
                    .filter((e) => e.isFeatured)
                    .map((event) => (
                      <FeaturedEventCard key={event.id} event={event} />
                    ))}
                </div>
              )}

              {/* Other events */}
              {filteredEvents.filter((e) => !e.isFeatured).length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredEvents
                    .filter((e) => !e.isFeatured)
                    .map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}

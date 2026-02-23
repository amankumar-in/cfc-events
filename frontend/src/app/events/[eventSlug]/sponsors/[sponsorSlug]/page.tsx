"use client";

import { use } from "react";
import { useEventContext } from "@/components/event/EventContext";
import { getStrapiURL } from "@/lib/api/api-config";
import { Button } from "@/components/ui/Button";

const tierConfig = {
  Platinum: {
    gradient: "from-gray-900 via-gray-800 to-gray-900",
    badge: "bg-yellow-500 text-black",
    label: "Platinum Sponsor",
  },
  Gold: {
    gradient: "from-amber-900 via-amber-800 to-amber-900",
    badge: "bg-amber-500 text-black",
    label: "Gold Sponsor",
  },
  Silver: {
    gradient: "from-gray-700 via-gray-600 to-gray-700",
    badge: "bg-gray-400 text-black",
    label: "Silver Sponsor",
  },
} as const;

export default function SponsorDetailPage({
  params,
}: {
  params: Promise<{ eventSlug: string; sponsorSlug: string }>;
}) {
  const { sponsorSlug } = use(params);
  const event = useEventContext();
  const sponsors =
    (event.sponsors as {
      id: number;
      Name: string;
      Slug: string;
      Tier?: string;
      Description?: string;
      Logo?: { url: string };
      Website?: string;
    }[]) ?? [];

  const sponsor = sponsors.find((s) => s.Slug === sponsorSlug);

  if (!sponsor) {
    return (
      <div className="text-center py-24">
        <p className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Sponsor Not Found
        </p>
        <Button variant="primary" href={`/events/${event.Slug}/sponsors`}>
          Back to Sponsors
        </Button>
      </div>
    );
  }

  const config =
    tierConfig[sponsor.Tier as keyof typeof tierConfig] ?? null;

  return (
    <main className="bg-white dark:bg-gray-900">
      {/* Hero banner with tier gradient */}
      <section
        className={`relative py-16 text-white ${
          config
            ? `bg-gradient-to-r ${config.gradient}`
            : "bg-gray-800"
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Logo */}
          <div className="inline-flex items-center justify-center bg-white p-6 mb-6 min-w-[160px] min-h-[100px]">
            {sponsor.Logo ? (
              <img
                src={getStrapiURL(sponsor.Logo.url)}
                alt={sponsor.Name}
                className="max-h-16 max-w-[200px] object-contain"
              />
            ) : (
              <span className="text-3xl font-bold text-gray-800">
                {sponsor.Name.charAt(0)}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            {sponsor.Name}
          </h1>

          {config && (
            <span
              className={`inline-flex items-center px-3 py-1 text-xs font-bold uppercase tracking-wider ${config.badge}`}
            >
              {config.label}
            </span>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {sponsor.Description && (
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              {sponsor.Description}
            </p>
          )}

          <div className="flex flex-wrap gap-4">
            {sponsor.Website && (
              <a
                href={sponsor.Website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-5 py-2 bg-yellow-500 text-black font-medium hover:bg-yellow-400 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                Visit Website
              </a>
            )}
            <Button
              variant="dark"
              buttonType="outline"
              href={`/events/${event.Slug}/sponsors`}
            >
              Back to All Sponsors
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

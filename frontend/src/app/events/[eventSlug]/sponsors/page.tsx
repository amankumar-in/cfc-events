"use client";

import { useEventContext } from "@/components/event/EventContext";
import { getStrapiURL } from "@/lib/api/api-config";
import Link from "next/link";
import { PageBanner } from "@/components/event/PageBanner";

interface SponsorData {
  id: number;
  Name: string;
  Slug: string;
  Tier?: string;
  Description?: string;
  Logo?: { url: string };
  Website?: string;
}

export default function SponsorsPage() {
  const event = useEventContext();
  const sponsors = (event.sponsors as SponsorData[]) ?? [];

  const platinumSponsors = sponsors.filter((s) => s.Tier === "Platinum");
  const goldSponsors = sponsors.filter((s) => s.Tier === "Gold");
  const silverSponsors = sponsors.filter((s) => s.Tier === "Silver");
  const knownTiers = ["Platinum", "Gold", "Silver"];
  const otherSponsors = sponsors.filter(
    (s) => !knownTiers.includes(s.Tier ?? "")
  );

  return (
    <main className="bg-white dark:bg-gray-900">
      <PageBanner title="Sponsors & Partners" subtitle={`Organizations supporting ${event.Title}`} />

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {sponsors.length === 0 ? (
            <div className="text-center py-16 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
              <p className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                Sponsors Coming Soon
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Sponsor announcements will be made soon.
              </p>
            </div>
          ) : (
            <div className="space-y-20">
              {/* ── Platinum — horizontal cards, same pattern as featured sessions/speakers ── */}
              {platinumSponsors.length > 0 && (
                <div>
                  <TierHeader label="Platinum Sponsors" accent="bg-blue-600" />
                  <div className="grid gap-6 md:grid-cols-2">
                    {platinumSponsors.map((sponsor) => (
                      <Link
                        key={sponsor.id}
                        href={`/events/${event.Slug}/sponsors/${sponsor.Slug}`}
                        className="group block"
                      >
                        <div className="flex flex-col sm:flex-row h-full border border-gray-200 dark:border-gray-600 overflow-hidden hover:border-yellow-500 transition-colors">
                          <div className="sm:w-2/5 flex-shrink-0 bg-gray-50 dark:bg-gray-700 flex items-center justify-center p-10">
                            {sponsor.Logo ? (
                              <img
                                src={getStrapiURL(sponsor.Logo.url)}
                                alt={sponsor.Name}
                                className="w-full h-full object-contain max-h-[120px]"
                              />
                            ) : (
                              <span className="text-4xl font-bold text-gray-300 dark:text-gray-500">
                                {sponsor.Name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="sm:w-3/5 bg-white dark:bg-gray-800 border-t-4 sm:border-t-0 sm:border-l-4 border-blue-600 p-6 flex flex-col justify-between">
                            <div>
                              <span className="inline-flex items-center px-2 py-0.5 text-xs font-bold uppercase tracking-wider bg-blue-600 text-white mb-3">
                                Platinum
                              </span>
                              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-yellow-500 transition-colors">
                                {sponsor.Name}
                              </h3>
                              {sponsor.Description && (
                                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                                  {sponsor.Description}
                                </p>
                              )}
                            </div>
                            {sponsor.Website && (
                              <p className="mt-4 text-xs text-gray-400 dark:text-gray-500 truncate">
                                {sponsor.Website.replace(/^https?:\/\//, "")}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Gold — vertical cards like regular session cards ── */}
              {goldSponsors.length > 0 && (
                <div>
                  <TierHeader label="Gold Sponsors" accent="bg-amber-500" />
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {goldSponsors.map((sponsor) => (
                      <Link
                        key={sponsor.id}
                        href={`/events/${event.Slug}/sponsors/${sponsor.Slug}`}
                        className="group block"
                      >
                        <div className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-amber-500 transition-colors h-full overflow-hidden">
                          <div className="aspect-video w-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center p-8">
                            {sponsor.Logo ? (
                              <img
                                src={getStrapiURL(sponsor.Logo.url)}
                                alt={sponsor.Name}
                                className="max-h-full max-w-full object-contain"
                              />
                            ) : (
                              <span className="text-3xl font-bold text-gray-300 dark:text-gray-500">
                                {sponsor.Name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="p-5 border-t-4 border-t-amber-500">
                            <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-amber-500 transition-colors mb-1">
                              {sponsor.Name}
                            </h3>
                            {sponsor.Description && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                {sponsor.Description}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Silver — same vertical pattern, smaller ── */}
              {silverSponsors.length > 0 && (
                <div>
                  <TierHeader label="Silver Sponsors" accent="bg-gray-400" />
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {silverSponsors.map((sponsor) => (
                      <Link
                        key={sponsor.id}
                        href={`/events/${event.Slug}/sponsors/${sponsor.Slug}`}
                        className="group block"
                      >
                        <div className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 transition-colors h-full overflow-hidden">
                          <div className="aspect-video w-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center p-6">
                            {sponsor.Logo ? (
                              <img
                                src={getStrapiURL(sponsor.Logo.url)}
                                alt={sponsor.Name}
                                className="max-h-full max-w-full object-contain"
                              />
                            ) : (
                              <span className="text-2xl font-bold text-gray-300 dark:text-gray-500">
                                {sponsor.Name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="p-4 border-t-2 border-t-gray-400">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-gray-500 transition-colors">
                              {sponsor.Name}
                            </h3>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Partners — minimal ── */}
              {otherSponsors.length > 0 && (
                <div>
                  <TierHeader label="Partners" accent="bg-blue-600" />
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {otherSponsors.map((sponsor) => (
                      <Link
                        key={sponsor.id}
                        href={`/events/${event.Slug}/sponsors/${sponsor.Slug}`}
                        className="group block"
                      >
                        <div className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-blue-500 transition-colors h-full overflow-hidden">
                          <div className="aspect-video w-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center p-4">
                            {sponsor.Logo ? (
                              <img
                                src={getStrapiURL(sponsor.Logo.url)}
                                alt={sponsor.Name}
                                className="max-h-full max-w-full object-contain opacity-60 group-hover:opacity-100 transition-opacity"
                              />
                            ) : (
                              <span className="text-sm font-medium text-gray-400 group-hover:text-gray-600 transition-colors">
                                {sponsor.Name}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function TierHeader({ label, accent }: { label: string; accent: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className={`h-6 w-1.5 ${accent}`} />
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
        {label}
      </h2>
    </div>
  );
}

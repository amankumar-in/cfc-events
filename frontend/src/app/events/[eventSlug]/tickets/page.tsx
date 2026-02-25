"use client";

import { useEventContext } from "@/components/event/EventContext";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { PageBanner } from "@/components/event/PageBanner";

interface TicketCategoryData {
  id: number;
  documentId: string;
  name: string;
  description: unknown[];
  price: number;
  currency: string;
  grantsFullEventAccess: boolean;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
}

function extractTextFromBlocks(blocks: unknown[]): string {
  if (!blocks || !Array.isArray(blocks)) return "";
  return (blocks as Array<Record<string, unknown>>)
    .map((block) => {
      const children = block?.children as
        | Array<{ text?: string }>
        | undefined;
      if (children) {
        return children.map((child) => child.text || "").join("");
      }
      return "";
    })
    .filter(Boolean)
    .join(" ");
}

function formatPrice(price: number, currency: string): string {
  if (price === 0) return "Free";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export default function TicketsPage() {
  const event = useEventContext();
  const ticketCategories = (event.ticketCategories ?? []) as TicketCategoryData[];

  // Sort by sortOrder, then featured first
  const sortedCategories = [...ticketCategories]
    .filter((tc) => tc.isActive !== false)
    .sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    });

  return (
    <main className="bg-white dark:bg-gray-900">
      <PageBanner
        title="Register"
        subtitle={`Secure your spot for ${event.Title}`}
      />

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {sortedCategories.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 mb-6">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Registration Coming Soon
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Ticket categories for this event have not been announced yet.
                Check back later.
              </p>
            </div>
          ) : (
            <div
              className={`grid grid-cols-1 ${
                sortedCategories.length === 1
                  ? "max-w-lg mx-auto"
                  : sortedCategories.length === 2
                  ? "md:grid-cols-2 max-w-3xl mx-auto"
                  : "md:grid-cols-3 max-w-5xl mx-auto"
              } gap-8`}
            >
              {sortedCategories.map((tc) => {
                const isFree = tc.price === 0;
                const descriptionText = extractTextFromBlocks(tc.description);

                const features: string[] = [];
                if (tc.grantsFullEventAccess) {
                  features.push("Full access to all sessions");
                }
                features.push("Live Q&A participation");
                features.push("Session recordings access");
                if (isFree) {
                  features.push("No payment required");
                }

                return (
                  <div
                    key={tc.id}
                    className={`border ${
                      tc.isFeatured
                        ? "border-yellow-500"
                        : "border-gray-200 dark:border-gray-600"
                    } bg-white dark:bg-gray-800 p-8 flex flex-col relative`}
                  >
                    {tc.isFeatured && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Chip variant="primary" size="sm">
                          Recommended
                        </Chip>
                      </div>
                    )}

                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {tc.name}
                    </h2>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                      {formatPrice(tc.price, tc.currency)}
                    </div>

                    {descriptionText && (
                      <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
                        {descriptionText.length > 200
                          ? `${descriptionText.substring(0, 200)}...`
                          : descriptionText}
                      </p>
                    )}

                    <ul className="space-y-3 mb-8 flex-grow">
                      {features.map((feature) => (
                        <li key={feature} className="flex items-start text-sm">
                          <div className="w-4 h-4 bg-yellow-500 flex-shrink-0 mr-3 mt-0.5" />
                          <span className="text-gray-600 dark:text-gray-300">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      variant={tc.isFeatured ? "primary" : "dark"}
                      buttonType={tc.isFeatured ? "solid" : "outline"}
                      className="w-full"
                      href={`/tickets/buy?categoryId=${tc.documentId}`}
                    >
                      {isFree ? "Register" : "Select"}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

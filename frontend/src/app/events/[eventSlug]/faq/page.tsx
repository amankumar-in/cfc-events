"use client";

import { useState } from "react";
import { useEventContext } from "@/components/event/EventContext";
import { useEventFaqs } from "@/lib/hooks/useEventFaqs";

interface FaqItem {
  id: number;
  Question: string;
  Answer: string;
  Category?: { id: number; Name: string };
}

export default function FAQPage() {
  const event = useEventContext();
  const { data: faqsData, isLoading } = useEventFaqs(event.Slug);
  const faqs = (faqsData?.data ?? []) as FaqItem[];
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  // Group by category
  const grouped = new Map<string, FaqItem[]>();
  for (const faq of faqs) {
    const catName = faq.Category?.Name ?? "General";
    if (!grouped.has(catName)) grouped.set(catName, []);
    grouped.get(catName)!.push(faq);
  }

  return (
    <main className="bg-white dark:bg-gray-900">
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-block mb-3 h-1 w-16 bg-yellow-500" />
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-12">
            Common questions about {event.Title}
          </p>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-12 h-12 border-t-2 border-yellow-500 border-solid rounded-full animate-spin" />
            </div>
          ) : faqs.length === 0 ? (
            <div className="text-center py-16 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
              <p className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                No FAQs Yet
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                FAQs will be added soon. Check back later.
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {Array.from(grouped.entries()).map(([category, categoryFaqs]) => (
                <div key={category}>
                  {grouped.size > 1 && (
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      {category}
                    </h2>
                  )}
                  <div className="space-y-0">
                    {categoryFaqs.map((faq) => {
                      const key = `${category}-${faq.id}`;
                      return (
                        <div
                          key={faq.id}
                          className="border border-gray-200 dark:border-gray-600 -mt-px first:mt-0"
                        >
                          <button
                            onClick={() =>
                              setOpenIndex(openIndex === key ? null : key)
                            }
                            className="w-full text-left px-6 py-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <span className="font-bold text-gray-900 dark:text-white pr-4">
                              {faq.Question}
                            </span>
                            <svg
                              className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                                openIndex === key ? "rotate-180" : ""
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>
                          {openIndex === key && (
                            <div className="px-6 pb-5 text-gray-600 dark:text-gray-300 whitespace-pre-line">
                              {faq.Answer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

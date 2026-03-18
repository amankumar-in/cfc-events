"use client";

import { useState, type ReactNode } from "react";
import {
  DollarSign,
  FileCheck,
  GraduationCap,
  Monitor,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

// ── Section data ────────────────────────────────────────────────────

interface Section {
  id: string;
  icon: typeof DollarSign;
  title: string;
  content: ReactNode;
}

const sections: Section[] = [
  {
    id: "costs",
    icon: DollarSign,
    title: "The full cost",
    content: (
      <>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
          A budget built in rupees today will shift against the dollar, pound, or
          Australian dollar over a multi-year program.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {[
            "Tuition fees",
            "Accommodation and meals",
            "Health insurance",
            "Visa and enrollment fees",
            "Travel, initial and recurring",
            "Books and course materials",
          ].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <span className="w-2 h-0.5 bg-yellow-500 flex-shrink-0" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {item}
              </span>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          Admissions representatives at this fair can provide cost breakdowns
          specific to their institution, city, and program — not estimates from a
          website.
        </p>
      </>
    ),
  },
  {
    id: "proof",
    icon: FileCheck,
    title: "Proof of funds and education loans",
    content: (
      <>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
          Most countries require liquid funds held in a bank account for a
          minimum period before the visa application date. An education loan
          sanction letter from a recognised Indian bank is accepted in most
          countries as a substitute or supplement.
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          Financial aid officers at this fair can confirm what their institution
          and destination country specifically requires, and whether a loan
          sanction letter applies in each case.
        </p>
      </>
    ),
  },
  {
    id: "scholarships",
    icon: GraduationCap,
    title: "Scholarships",
    content: (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="p-5 border border-gray-200 dark:border-gray-600">
            <strong className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
              Merit-based
            </strong>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-1">
              Academic record, test scores, extracurricular history
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Thresholds vary by institution and country
            </p>
          </div>
          <div className="p-5 border border-gray-200 dark:border-gray-600">
            <strong className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
              Need-based
            </strong>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-1">
              Documented family financial position
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Amounts not always publicly listed
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          Scholarship coordinators at this fair can confirm eligibility criteria
          and available aid for their specific programs. Families can have this
          conversation directly, before committing to an application.
        </p>
      </>
    ),
  },
  {
    id: "online",
    icon: Monitor,
    title: "Online programs",
    content: (
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
        Tuition is typically 30 to 60 percent lower than on-campus. Visa-related
        financial requirements do not apply. Representatives from online programs
        at this fair can walk through the actual cost structure and payment
        requirements.
      </p>
    ),
  },
];

// ── Component ───────────────────────────────────────────────────────

export function FinancialPreparedness({ eventSlug }: { eventSlug?: string }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className="py-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
          <div>
            <span className="inline-block mb-3 h-1 w-16 bg-yellow-500" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Financial Preparedness
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
              This event helps you understand the real costs of studying abroad
              so every college conversation starts from a position of clarity
            </p>
          </div>
          <Button
            variant="primary"
            buttonType="outline"
            href={eventSlug ? `/events/${eventSlug}/sessions` : "/events"}
            className="mt-4 md:mt-0 whitespace-nowrap"
          >
            Scholarship Opportunities
          </Button>
        </div>

        {/* Intro */}
        <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-8 max-w-3xl">
          Financial aid officers, admissions teams, and scholarship coordinators
          from participating institutions are at this fair to have it directly.
        </p>

        {/* Accordion */}
        <div className="space-y-0">
          {sections.map((section) => {
            const isOpen = openId === section.id;
            const Icon = section.icon;

            return (
              <div
                key={section.id}
                className="border border-gray-200 dark:border-gray-700 -mt-px first:mt-0"
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : section.id)}
                  className="w-full text-left px-5 py-5 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <span
                    className={`inline-flex items-center justify-center w-10 h-10 flex-shrink-0 transition-colors ${
                      isOpen
                        ? "bg-yellow-500"
                        : "bg-gray-100 dark:bg-gray-700"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 transition-colors ${
                        isOpen ? "text-gray-900" : "text-gray-500"
                      }`}
                    />
                  </span>

                  <span className="flex-1 text-lg font-bold text-gray-900 dark:text-white">
                    {section.title}
                  </span>

                  <svg
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                      isOpen ? "rotate-180" : ""
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

                {isOpen && (
                  <div className="px-5 pb-6 sm:ml-14">
                    {section.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Parent callout */}
        <div className="flex gap-4 p-5 mt-8 border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-500/10">
          <AlertCircle className="h-6 w-6 text-yellow-500 flex-shrink-0" />
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Parents and guardians are the decision makers on loans, funds, and
            financial risk. This fair is designed for that conversation too.
          </p>
        </div>
      </div>
    </section>
  );
}

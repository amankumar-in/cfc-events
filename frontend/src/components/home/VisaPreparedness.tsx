"use client";

import {
  Clock,
  FileText,
  Globe,
  Languages,
} from "lucide-react";

// ── Data ────────────────────────────────────────────────────────────

const timelineSteps = [
  { stage: "Passport (new or renewal)", time: "4 to 8 weeks" },
  { stage: "English proficiency test", time: "6 to 12 weeks" },
  { stage: "Financial documentation", time: "4 to 8 weeks" },
  { stage: "University application and decision", time: "4 to 16 weeks" },
  { stage: "Visa application after offer", time: "3 to 8 weeks" },
];

const documents = [
  "Valid passport (minimum 6 months validity; some countries require 12)",
  "Final offer letter from the university",
  "Proof of financial ability or education loan sanction letter",
  "English proficiency score",
  "Academic transcripts, attested where required",
];

// ── Component ───────────────────────────────────────────────────────

export function VisaPreparedness() {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <span className="inline-block mb-3 h-1 w-16 bg-yellow-500" />
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Immigration Preparedness
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
            Counsellors and global outreach teams at this fair work through visa
            timelines and documentation requirements for every destination
            country represented
          </p>
        </div>

        {/* Two-column: Timeline + Documents */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Vertical timeline */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Clock className="h-5 w-5 text-yellow-500" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                The timeline
              </h3>
            </div>

            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-3 top-3 bottom-3 w-px bg-gray-200 dark:bg-gray-700" />

              <div className="space-y-0">
                {timelineSteps.map((step, i) => (
                  <div key={step.stage} className="relative flex gap-6 pb-8 last:pb-0">
                    {/* Dot */}
                    <div className="relative z-10 flex-shrink-0">
                      <div
                        className={`w-6 h-6 flex items-center justify-center text-xs font-bold ${
                          i === 0
                            ? "bg-yellow-500 text-gray-900"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {i + 1}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 dark:text-white text-sm">
                        {step.stage}
                      </p>
                      <p className="text-sm text-yellow-600 dark:text-yellow-500 font-medium mt-0.5">
                        {step.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-900 dark:bg-gray-800 text-white">
              <p className="text-sm leading-relaxed">
                Starting three months before the intended intake is already late.
                Counsellors at this fair help students identify where they are in
                this timeline and what moves first.
              </p>
            </div>
          </div>

          {/* Right: Documents + Country + Language */}
          <div className="space-y-8">
            {/* Documents checklist */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <FileText className="h-5 w-5 text-yellow-500" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Documents every application requires
                </h3>
              </div>

              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc}
                    className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="w-5 h-5 flex-shrink-0 mt-0.5 border-2 border-yellow-500 flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-yellow-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {doc}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Country-specific */}
            <div className="p-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center gap-3 mb-3">
                <Globe className="h-5 w-5 text-yellow-500" />
                <h3 className="font-bold text-gray-900 dark:text-white">
                  Country-specific requirements
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Visa requirements are set by the destination country, not the
                university. Financial thresholds, document formats, and
                processing times differ across the US, UK, Australia, Canada, and
                Europe. Global outreach teams from each institution at this fair
                can speak to what their specific country requires.
              </p>
            </div>

            {/* Language */}
            <div className="p-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center gap-3 mb-3">
                <Languages className="h-5 w-5 text-yellow-500" />
                <h3 className="font-bold text-gray-900 dark:text-white">
                  Language requirements beyond instruction
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                A program taught in English does not automatically waive the host
                country&apos;s language requirement. Germany, France, and several
                other countries have language requirements tied to visa status.
                Students planning for non-English-speaking countries can get this
                clarified directly at the fair.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

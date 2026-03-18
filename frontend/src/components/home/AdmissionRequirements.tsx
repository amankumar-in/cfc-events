"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

// ── Tab data ────────────────────────────────────────────────────────

const tabs = [
  {
    id: "grades",
    label: "Grade Conversion",
    content: (
      <>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
          Indian mark sheets require credential evaluation for most
          international applications. WES is the standard in North America. UK
          ENIC applies in the United Kingdom.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-900 dark:border-white">
                <th className="text-left py-3 pr-6 font-bold text-gray-900 dark:text-white">
                  Indian percentage (approx.)
                </th>
                <th className="text-left py-3 font-bold text-gray-900 dark:text-white">
                  US GPA equivalent
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ["90 and above", "4.0"],
                ["80 to 89", "3.5 to 3.9"],
                ["70 to 79", "3.0 to 3.4"],
                ["60 to 69", "2.5 to 2.9"],
                ["Below 60", "Below 2.5"],
              ].map(([percentage, gpa]) => (
                <tr
                  key={percentage}
                  className="border-b border-gray-200 dark:border-gray-700"
                >
                  <td className="py-3 pr-6 text-gray-700 dark:text-gray-300">
                    {percentage}
                  </td>
                  <td className="py-3 font-medium text-gray-900 dark:text-white">
                    {gpa}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mt-6">
          Minimum requirements vary by program. Admissions officers at this fair
          can tell you where your profile stands for specific programs.
        </p>
      </>
    ),
  },
  {
    id: "tests",
    label: "English Proficiency",
    content: (
      <>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-900 dark:border-white">
                <th className="text-left py-3 pr-6 font-bold text-gray-900 dark:text-white">
                  Test
                </th>
                <th className="text-left py-3 font-bold text-gray-900 dark:text-white">
                  Where accepted
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ["IELTS Academic", "UK, Australia, Canada, Europe"],
                ["TOEFL iBT", "USA, Canada, globally"],
                ["PTE Academic", "Australia, UK, New Zealand"],
                ["Duolingo English Test", "Select universities globally"],
              ].map(([test, where]) => (
                <tr
                  key={test}
                  className="border-b border-gray-200 dark:border-gray-700"
                >
                  <td className="py-3 pr-6 font-medium text-gray-900 dark:text-white">
                    {test}
                  </td>
                  <td className="py-3 text-gray-600 dark:text-gray-400">
                    {where}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          Score requirements differ by program level. Confirm the minimum for
          each specific program directly with the admissions team at this fair.
        </p>
      </>
    ),
  },
  {
    id: "documents",
    label: "Standard Documents",
    content: (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {[
            "Academic transcripts (all years, attested where required)",
            "Recommendation letters (2 to 3, from teachers or academic supervisors)",
            "Statement of purpose",
            "Standardised test scores where applicable (SAT, ACT, GRE, GMAT)",
            "Financial documentation",
          ].map((doc, i) => (
            <div
              key={doc}
              className="flex items-start gap-3"
            >
              <span className="flex-shrink-0 w-6 h-6 bg-yellow-500 text-gray-900 flex items-center justify-center text-xs font-bold">
                {i + 1}
              </span>
              <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {doc}
              </span>
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          Admissions representatives can confirm exactly what their institution
          requires and in what format.
        </p>
      </>
    ),
  },
  {
    id: "holistic",
    label: "Holistic Admissions",
    content: (
      <div className="max-w-2xl">
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
          International universities read applications. Academic record,
          statement of purpose, and recommendation letters are all evaluated
          together.
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
          A drop in grades, a gap year, or a program change will be noticed.
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          Professors and admissions officers at this fair can explain what a
          competitive application looks like for their specific program.
        </p>
      </div>
    ),
  },
];

// ── Component ───────────────────────────────────────────────────────

export function AdmissionRequirements({
  eventSlug,
}: {
  eventSlug?: string;
}) {
  const [activeTab, setActiveTab] = useState("grades");
  const active = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  return (
    <section className="py-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
          <div>
            <span className="inline-block mb-3 h-1 w-16 bg-yellow-500" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Academic Eligibility: What colleges actually require
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
              Admissions teams at this fair go beyond what is published on a
              university website. Bring your academic record and your questions.
            </p>
          </div>
          <Button
            variant="primary"
            buttonType="outline"
            href={eventSlug ? `/events/${eventSlug}/sessions` : "/events"}
            className="mt-4 md:mt-0 whitespace-nowrap"
          >
            View Sessions
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex gap-0 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-yellow-500 text-gray-900 dark:text-white"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="min-h-64">{active.content}</div>
      </div>
    </section>
  );
}

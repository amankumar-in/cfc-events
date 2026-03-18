"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";

// ── Data ────────────────────────────────────────────────────────────

const questions = [
  {
    id: "ugc",
    question: "Is the degree UGC-recognised?",
    answer:
      "Degrees from institutions not on the UGC\u2019s recognised foreign universities list are generally accepted for higher education admission or government employment in India. Representatives can confirm recognition status.",
  },
  {
    id: "alumni",
    question: "How have alumni fared in the Indian job market?",
    answer:
      "UGC recognition is the baseline. What happens after graduation matters. Alumni outcomes in India are a fair question for any representative at this event.",
  },
  {
    id: "payment",
    question: "What does the payment process look like?",
    answer:
      "Tuition is billed in foreign currency. Not all Indian bank accounts support international transactions by default. Representatives can walk through exactly what is needed and how long it takes to set up.",
  },
];

// ── Component ───────────────────────────────────────────────────────

export function OnlinePrograms() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className="py-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <span className="inline-block mb-3 h-1 w-16 bg-yellow-500" />
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Online Programmes: From 10+ Universities
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
            Institutions at this fair offering online degrees are present to
            answer questions that a program page cannot
          </p>
        </div>

        {/* Split layout: Image + Cost on left, Q&A on right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left — image + cost highlight */}
          <div>
            <div className="aspect-[16/9] bg-gray-100 dark:bg-gray-700 relative mb-6 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80"
                alt="Student studying online at home"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900/80 to-transparent p-6">
                <p className="text-white font-bold text-lg">
                  30 to 60% lower tuition
                </p>
                <p className="text-gray-300 text-sm">
                  compared to on-campus programs
                </p>
              </div>
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                Cost
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Online tuition is typically 50 to 80 percent lower than
                on-campus tuition for the same program. Living costs, travel, and
                visa fees do not apply.
              </p>
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 border-t-0">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                Schedule compatibility
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Live sessions and some assessments may be scheduled in the
                institution&apos;s home time zone. Ask the representative for the
                live session schedule before making a decision.
              </p>
            </div>
          </div>

          {/* Right — Questions worth asking */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Three questions worth asking representatives directly
            </h3>

            <div className="space-y-0">
              {questions.map((q) => {
                const isOpen = openId === q.id;
                return (
                  <div
                    key={q.id}
                    className="border border-gray-200 dark:border-gray-700 -mt-px first:mt-0"
                  >
                    <button
                      onClick={() =>
                        setOpenId(isOpen ? null : q.id)
                      }
                      className="w-full text-left p-5 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <ChevronRight
                        className={`h-5 w-5 text-yellow-500 flex-shrink-0 transition-transform ${
                          isOpen ? "rotate-90" : ""
                        }`}
                      />
                      <span className="font-bold text-gray-900 dark:text-white">
                        {q.question}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pl-14">
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          {q.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Supporting image */}
            <div className="mt-6 aspect-[16/9] bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80"
                alt="Students collaborating online"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-600 opacity-80" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

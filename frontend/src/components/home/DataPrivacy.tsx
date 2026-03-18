import {
  ClipboardList,
  ShieldCheck,
  Share2,
  Link,
  Trash2,
} from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    title: "What is collected at registration",
    description:
      "Name, email, phone, academic background, and program interests.",
  },
  {
    icon: ShieldCheck,
    title: "What registration means",
    description:
      "Registering for this event is not consent to share your information with participating institutions. These are two separate actions.",
  },
  {
    icon: Share2,
    title: "How sharing works",
    description:
      "Information is shared with a specific institution only when you explicitly request it and confirm consent at the fair. Each institution is a separate action.",
  },
  {
    icon: Link,
    title: "Institution privacy policies",
    description:
      "Institutions handle shared data under their own privacy policies. A direct link to each institution\u2019s privacy policy is available before any sharing occurs.",
  },
  {
    icon: Trash2,
    title: "Deletion and correction",
    description:
      "Contact info@cfcevents.com at any time. Processed within 30 days.",
  },
];

export function DataPrivacy() {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header — centered */}
        <div className="text-center mb-12">
          <span className="inline-block mb-3 h-1 w-16 bg-yellow-500" />
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Your information belongs to you
          </h2>
        </div>

        {/* Numbered steps — horizontal on desktop, vertical on mobile */}
        <div className="relative">
          {/* Connection line — desktop only */}
          <div className="hidden lg:block absolute top-10 left-0 right-0 h-px bg-gray-200 dark:bg-gray-700" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-4">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="relative text-center">
                  {/* Number + icon */}
                  <div className="relative z-10 inline-flex flex-col items-center">
                    <div className="w-20 h-20 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center mb-4">
                      <Icon className="h-8 w-8 text-yellow-500" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-7 h-7 bg-gray-900 dark:bg-yellow-500 text-white dark:text-gray-900 flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

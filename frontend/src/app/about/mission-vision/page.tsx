"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";

export default function MissionVisionPage() {
  return (
    <main className="bg-white dark:bg-gray-900">
      <HeroSection />
      <MissionSection />
      <VisionSection />
      <ValuesSection />
      <CorePrinciplesSection />
      <CTASection />
    </main>
  );
}

// -------------------------------------------------------------------
// Hero Section
// -------------------------------------------------------------------
function HeroSection() {
  return (
    <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="md:w-2/3">
            <div className="flex items-center mb-6">
              <Link
                href="/about"
                className="flex items-center text-black dark:text-white hover:text-yellow-500 dark:hover:text-yellow-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Back to About
              </Link>
            </div>
            <span className="inline-block mb-3 h-1 w-16 bg-yellow-500"></span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              Our Mission & Vision
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Removing the mental, financial, and academic barriers to higher
              education for all students.
            </p>
          </div>
          <div className="md:w-1/3 bg-black text-white dark:bg-white dark:text-black p-8 border border-gray-200 dark:border-gray-600">
            <div className="relative">
              <div className="absolute top-0 right-0 w-12 h-12 bg-blue-600"></div>
              <h2 className="text-2xl font-bold mb-4">What We Stand For</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="w-2 h-2 inline-block bg-yellow-500 mt-2 mr-3 flex-shrink-0"></span>
                  <span>
                    Equal access to higher education for every student
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 inline-block bg-yellow-500 mt-2 mr-3 flex-shrink-0"></span>
                  <span>
                    Zero-cost services funded by university partnerships
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 inline-block bg-yellow-500 mt-2 mr-3 flex-shrink-0"></span>
                  <span>
                    Technology-driven student support from K-12 to college
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 inline-block bg-yellow-500 mt-2 mr-3 flex-shrink-0"></span>
                  <span>Global reach across 5+ destination countries</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------------
// Mission Section
// -------------------------------------------------------------------
function MissionSection() {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7">
            <span className="inline-block mb-3 h-1 w-16 bg-blue-600"></span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              Our Mission
            </h2>
            <div className="space-y-6 text-gray-600 dark:text-gray-300">
              <p className="text-lg">
                Coins For College provides an equal opportunity for everyone to
                access higher education, regardless of circumstance. We remove
                the mental, financial, and academic barriers to college for all
                students.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 dark:border-gray-600 p-4 bg-white dark:bg-gray-800">
                  <h3 className="font-bold text-black dark:text-white mb-2">
                    Connecting Students
                  </h3>
                  <p>
                    Connecting students with 3 guaranteed offers from
                    international universities across the USA, UK, Canada,
                    Germany, and Australia.
                  </p>
                </div>
                <div className="border border-gray-200 dark:border-gray-600 p-4 bg-white dark:bg-gray-800">
                  <h3 className="font-bold text-black dark:text-white mb-2">
                    Removing Barriers
                  </h3>
                  <p>
                    Every service is 100% free — no platform fees, no tutoring
                    costs, no commissions. We are paid by university partners for
                    successful placements.
                  </p>
                </div>
                <div className="border border-gray-200 dark:border-gray-600 p-4 bg-white dark:bg-gray-800">
                  <h3 className="font-bold text-black dark:text-white mb-2">
                    Empowering Families
                  </h3>
                  <p>
                    Parents accumulate Tuition Coins ($TUIT) by supporting their
                    children&apos;s education. Students earn Scholarship Points
                    from K-12 for academic and extracurricular achievements.
                  </p>
                </div>
                <div className="border border-gray-200 dark:border-gray-600 p-4 bg-white dark:bg-gray-800">
                  <h3 className="font-bold text-black dark:text-white mb-2">
                    Technology-Driven
                  </h3>
                  <p>
                    AI-powered tutoring available 24/7, CEFR-aligned language
                    training in 20+ languages, and smart application management
                    with AI feedback on Statements of Purpose.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="md:col-span-5">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 p-8">
              <div className="bg-black text-white dark:bg-white dark:text-black p-8 relative">
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-600"></div>
                <h3 className="text-2xl font-bold mb-6">Our Commitment</h3>
                <p className="mb-6">
                  We are committed to making higher education accessible for
                  every student by:
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="w-4 h-4 inline-block bg-yellow-500 mt-1 mr-3 flex-shrink-0"></span>
                    <span>
                      Supporting students from K-12 through university admission
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-4 h-4 inline-block bg-yellow-500 mt-1 mr-3 flex-shrink-0"></span>
                    <span>
                      Building digital token economies that fund scholarships
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-4 h-4 inline-block bg-yellow-500 mt-1 mr-3 flex-shrink-0"></span>
                    <span>Aligning university and student incentives</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-4 h-4 inline-block bg-yellow-500 mt-1 mr-3 flex-shrink-0"></span>
                    <span>Making higher education accessible globally</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------------
// Vision Section
// -------------------------------------------------------------------
function VisionSection() {
  return (
    <section className="py-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-8">
            <div className="bg-black text-white dark:bg-white dark:text-black h-full p-8 relative">
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-600"></div>
              <h3 className="text-3xl font-bold mb-6">Our Vision</h3>
              <p className="text-xl mb-6">
                Accessible Higher Education for All
              </p>
              <div className="w-32 h-1 bg-yellow-500 mb-8"></div>
              <p>
                A world where every student can access higher education —
                regardless of financial circumstance — powered by technology that
                makes the process transparent, supported, and free.
              </p>
            </div>
          </div>
          <div>
            <span className="inline-block mb-3 h-1 w-16 bg-yellow-500"></span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              What We&apos;re Building Toward
            </h2>
            <div className="space-y-6 text-gray-600 dark:text-gray-300">
              <p className="text-lg">
                We envision a future where access to higher education is not
                determined by financial circumstance:
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-yellow-500 text-black h-8 w-8 flex items-center justify-center mr-4 flex-shrink-0">
                    <span>1</span>
                  </div>
                  <p>
                    <span className="font-bold text-black dark:text-white">
                      Every student
                    </span>{" "}
                    has access to international university offers with full
                    support
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="bg-yellow-500 text-black h-8 w-8 flex items-center justify-center mr-4 flex-shrink-0">
                    <span>2</span>
                  </div>
                  <p>
                    <span className="font-bold text-black dark:text-white">
                      Financial barriers
                    </span>{" "}
                    are eliminated through scholarships up to $120,000 and
                    zero-cost services
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="bg-yellow-500 text-black h-8 w-8 flex items-center justify-center mr-4 flex-shrink-0">
                    <span>3</span>
                  </div>
                  <p>
                    <span className="font-bold text-black dark:text-white">
                      Families are empowered
                    </span>{" "}
                    through digital token systems that reward educational
                    engagement
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="bg-yellow-500 text-black h-8 w-8 flex items-center justify-center mr-4 flex-shrink-0">
                    <span>4</span>
                  </div>
                  <p>
                    <span className="font-bold text-black dark:text-white">
                      Universities and students
                    </span>{" "}
                    are connected through a model where incentives are aligned
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="bg-yellow-500 text-black h-8 w-8 flex items-center justify-center mr-4 flex-shrink-0">
                    <span>5</span>
                  </div>
                  <p>
                    <span className="font-bold text-black dark:text-white">
                      Technology
                    </span>{" "}
                    removes friction from every step — tutoring, applications,
                    visas, and language prep
                  </p>
                </div>
              </div>
              <p>
                CFC Events brings this vision to life through education fairs,
                university recruitment events, and conferences that connect
                students directly with opportunities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------------
// Values Section
// -------------------------------------------------------------------
function ValuesSection() {
  const values = [
    {
      title: "Educational Equity",
      description:
        "Equal opportunity for everyone to access higher education, regardless of circumstance. No student should be left behind because of finances.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
    },
    {
      title: "Transparency",
      description:
        "No hidden fees. No commissions. We are paid by our university partners for successful placements, ensuring our incentives are aligned with student success.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      ),
    },
    {
      title: "Student-First",
      description:
        "Every tool, every feature, every event is designed around what families need most. We build based on what students and parents ask for.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      title: "Accessibility",
      description:
        "100% free for all students and families. AI tutoring, visa help, application management, language training, and scholarship matching — all included.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
          />
        </svg>
      ),
    },
    {
      title: "Innovation",
      description:
        "From blockchain-based Scholarship Points and Tuition Coins to AI-powered tutoring and SOP builders — we use technology to solve real problems.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    },
    {
      title: "Global Reach",
      description:
        "Students applying to universities across USA (45%), UK (30%), Canada (12%), Germany (8%), and Australia (5%) — with support for 20+ languages.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block mb-3 h-1 w-16 bg-blue-600 mx-auto"></span>
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Our Core Values
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            The principles behind everything we build at Coins For College and
            Rewards For Education.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((value) => (
            <div
              key={value.title}
              className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
            >
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="bg-black dark:bg-white h-16 w-16 flex items-center justify-center mr-4">
                    <div className="text-white dark:text-black">
                      {value.icon}
                    </div>
                  </div>
                  <Chip variant="primary" size="lg">
                    {value.title}
                  </Chip>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  {value.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------------
// Guiding Principles Section
// -------------------------------------------------------------------
function CorePrinciplesSection() {
  return (
    <section className="py-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="md:w-1/3">
            <span className="inline-block mb-3 h-1 w-16 bg-yellow-500"></span>
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
              Guiding Principles
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              How we operate day-to-day across CFC Events and Rewards For
              Education.
            </p>
            <div className="bg-black text-white dark:bg-white dark:text-black p-6 border border-gray-200 dark:border-gray-600">
              <h3 className="text-xl font-bold mb-4">Real Outcomes</h3>
              <p>
                These principles ensure that CFC Events and Rewards For
                Education deliver real outcomes — not just information, but
                actual university offers, real scholarships, and tangible
                support.
              </p>
            </div>
          </div>
          <div className="md:w-2/3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-6">
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white flex items-center">
                  <span className="bg-yellow-500 text-black h-8 w-8 inline-flex items-center justify-center mr-3">
                    01
                  </span>
                  Results-Oriented
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  3 guaranteed offers from international universities. We measure
                  success by student placements, not just engagement.
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-6">
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white flex items-center">
                  <span className="bg-yellow-500 text-black h-8 w-8 inline-flex items-center justify-center mr-3">
                    02
                  </span>
                  Aligned Incentives
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We are paid by university partners for successful placements.
                  This means our success is directly tied to student success.
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-6">
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white flex items-center">
                  <span className="bg-yellow-500 text-black h-8 w-8 inline-flex items-center justify-center mr-3">
                    03
                  </span>
                  Data-Driven
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Real-time insights into student preferences, popular
                  destinations, and family needs. We build tools based on what
                  the community asks for.
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-6">
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white flex items-center">
                  <span className="bg-yellow-500 text-black h-8 w-8 inline-flex items-center justify-center mr-3">
                    04
                  </span>
                  End-to-End Support
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  From AI tutoring and language prep to visa documentation and
                  application management — every step of the journey is covered.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------------
// CTA Section
// -------------------------------------------------------------------
function CTASection() {
  return (
    <section className="bg-black text-white dark:bg-white dark:text-black py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Start Your Journey
            </h2>
            <p className="text-lg mb-8">
              Everything you need to succeed, in one platform. Visa, finance,
              academics, language, and application support — all 100% free.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" size="lg" href="/events">
                Browse Events
              </Button>
              <Button
                variant="light"
                buttonType="outline"
                size="lg"
                href="https://rewardsforeducation.com"
                target="_blank"
                rel="noopener noreferrer"
                className="border-white text-white dark:border-black dark:text-black"
              >
                Join Rewards For Education
              </Button>
            </div>
          </div>
          <div className="bg-white text-black dark:bg-black dark:text-white p-8 border border-gray-200 dark:border-gray-600">
            <div className="relative p-6">
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-600"></div>
              <h3 className="text-2xl font-bold mb-6">The CFC Ecosystem</h3>
              <p className="mb-6">
                Coins For College, Rewards For Education, and CFC Events work
                together to provide end-to-end support — from K-12 Scholarship
                Points to university admission and beyond.
              </p>
              <div className="flex items-center">
                <Link
                  href="/about"
                  className="flex items-center text-black dark:text-white hover:text-yellow-500 dark:hover:text-yellow-500 font-medium"
                >
                  <span>Learn More About Us</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-2 h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

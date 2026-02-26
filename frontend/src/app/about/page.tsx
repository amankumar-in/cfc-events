"use client";

import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";

export default function AboutPage() {
  return (
    <main className="bg-white dark:bg-gray-900">
      <HeroSection />
      <MissionSection />
      <PlatformSection />
      <ServicesSection />
      <KeyFiguresSection />
      <EcosystemSection />
      <HowItWorksSection />
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <span className="inline-block mb-3 h-1 w-16 bg-yellow-500"></span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              About CFC Events
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Empowering families for higher education success through events
              that connect students with international universities,
              scholarships, and opportunities worldwide.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" href="/about/mission-vision">
                Our Mission
              </Button>
              <Button
                variant="dark"
                buttonType="outline"
                href="/about/mission-vision"
                className="dark:border-white dark:text-white"
              >
                Our Vision
              </Button>
            </div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 p-6 border border-gray-200 dark:border-gray-600">
            <div className="p-8 bg-black text-white dark:bg-white dark:text-black relative">
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-600"></div>
              <h2 className="text-2xl font-bold mb-4">The CFC Ecosystem</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="w-4 h-4 inline-block bg-yellow-500 mr-3 mt-1 flex-shrink-0"></span>
                  <span>
                    Coins For College — Digital token economies for academic
                    institutions
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="w-4 h-4 inline-block bg-yellow-500 mr-3 mt-1 flex-shrink-0"></span>
                  <span>
                    Rewards For Education — 100% free student placement platform
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="w-4 h-4 inline-block bg-yellow-500 mr-3 mt-1 flex-shrink-0"></span>
                  <span>
                    CFC Events — Education fairs, conferences, and livestreams
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="w-4 h-4 inline-block bg-yellow-500 mr-3 mt-1 flex-shrink-0"></span>
                  <span>3 Guaranteed University Offers for every student</span>
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
// Mission & Vision Section
// -------------------------------------------------------------------
function MissionSection() {
  return (
    <section
      id="mission"
      className="bg-gray-50 dark:bg-gray-700 py-16 border-b border-gray-200 dark:border-gray-700"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-4">
            <span className="inline-block mb-3 h-1 w-16 bg-yellow-500"></span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              Our Mission & Vision
            </h2>
            <p className="text-lg mb-8 text-gray-600 dark:text-gray-300">
              Coins For College provides an equal opportunity for everyone to
              access higher education, regardless of circumstance. We remove the
              mental, financial, and academic barriers to college for all
              students.
            </p>
            <Button
              variant="primary"
              buttonType="outline"
              href="/about/mission-vision"
            >
              Learn More
            </Button>
          </div>
          <div className="col-span-12 md:col-span-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-600">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  <span className="text-blue-600 text-4xl font-bold block mb-3">
                    01
                  </span>
                  Vision
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  A world where every student can access higher education
                  regardless of their financial circumstances, powered by
                  technology that aligns the incentives of universities,
                  families, and students.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-600">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  <span className="text-blue-600 text-4xl font-bold block mb-3">
                    02
                  </span>
                  Mission
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  To provide an equal opportunity for everyone to access higher
                  education by removing the mental, financial, and academic
                  barriers to college for all students.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-600">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  <span className="text-blue-600 text-4xl font-bold block mb-3">
                    03
                  </span>
                  Values
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Educational equity, transparency, student-first design, and
                  zero-cost access — we are paid by our university partners for
                  successful placements, ensuring our incentives are aligned with
                  student success.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-600">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  <span className="text-blue-600 text-4xl font-bold block mb-3">
                    04
                  </span>
                  Impact
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Scholarships up to $120,000, students applying to universities
                  across 5+ countries (USA, UK, Canada, Germany, Australia), and
                  3 guaranteed offers from international universities for every
                  student.
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
// About the Platform Section
// -------------------------------------------------------------------
function PlatformSection() {
  return (
    <section className="py-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <span className="inline-block mb-3 h-1 w-16 bg-blue-600"></span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              Your Global Future Starts Here
            </h2>
            <div className="text-gray-600 dark:text-gray-300 space-y-4">
              <p>
                CFC Events is the events arm of the Coins For College ecosystem.
                We organize education fairs, university recruitment events,
                scholarship expos, and virtual conferences that connect students
                and families with international universities and educational
                opportunities.
              </p>
              <p>
                Coins For College, founded in 2019, builds digital token
                economies for academic institutions. Students earn Scholarship
                Points from K-12 for academic performance and extracurricular
                involvement. Parents accumulate Tuition Coins ($TUIT) for
                supporting their children&apos;s education, which can be
                redeemed toward college expenses.
              </p>
              <p>
                Rewards For Education (RFE), powered by College Coins, is our
                100% free student platform that provides AI-powered tutoring,
                visa documentation assistance, application management, language
                proficiency training, and finance planning — all at zero cost to
                students and families.
              </p>
              <p>
                Through CFC Events, we bring this ecosystem to life with
                in-person and virtual events where students meet university
                representatives face-to-face, learn about scholarship
                opportunities, and get hands-on help with their applications.
              </p>
            </div>
          </div>
          <div className="md:col-span-1">
            <div className="bg-black text-white dark:bg-white dark:text-black h-full p-6 border border-gray-200 dark:border-gray-600">
              <h3 className="text-xl font-bold mb-6">What We Offer at Events</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="bg-yellow-500 text-black h-8 w-8 flex items-center justify-center mr-3 flex-shrink-0">
                    <span>01</span>
                  </div>
                  <span>University recruitment and admissions guidance</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-yellow-500 text-black h-8 w-8 flex items-center justify-center mr-3 flex-shrink-0">
                    <span>02</span>
                  </div>
                  <span>Scholarship and financial aid workshops</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-yellow-500 text-black h-8 w-8 flex items-center justify-center mr-3 flex-shrink-0">
                    <span>03</span>
                  </div>
                  <span>Visa documentation and application support</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-yellow-500 text-black h-8 w-8 flex items-center justify-center mr-3 flex-shrink-0">
                    <span>04</span>
                  </div>
                  <span>AI tutoring and language proficiency demos</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-yellow-500 text-black h-8 w-8 flex items-center justify-center mr-3 flex-shrink-0">
                    <span>05</span>
                  </div>
                  <span>
                    One-on-one sessions with university representatives
                  </span>
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
// Services Section
// -------------------------------------------------------------------
function ServicesSection() {
  const services = [
    {
      title: "AI-Powered Tutoring",
      description:
        "24/7 AI tutoring for Math, Science, and English with instant remedial lessons to help students prepare for university admissions.",
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
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      title: "Scholarship & Finance Planning",
      description:
        "Connecting students to merit-based scholarships, financial aid, and university grants — with awards up to $120,000 per student.",
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
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      title: "Visa Documentation",
      description:
        "Help compiling and organizing financial proofs, academic transcripts, and identity documents to get visa-ready.",
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      title: "Language Training",
      description:
        "CEFR-aligned curriculum (A1\u2013C2) supporting 20+ languages, with exam-specific prep for IELTS, TOEFL, TestDaF, and DELF.",
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
            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
          />
        </svg>
      ),
    },
    {
      title: "Application Management",
      description:
        "Statement of Purpose builder with AI feedback, recommendation letter coordination, deadline tracking, and document version control.",
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
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      ),
    },
    {
      title: "University Matching",
      description:
        "3 guaranteed offers from international universities. We match students with the right institutions based on their profile, goals, and preferences.",
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
            d="M12 14l9-5-9-5-9 5 9 5z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
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
            What Students Get — 100% Free
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Every service on the Rewards For Education platform is completely
            free. No subscription fees, no tutoring costs, no commissions.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.title}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600"
            >
              <div className="p-6">
                <div className="text-yellow-500 mb-4">{service.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                  {service.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {service.description}
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
// Key Figures Section
// -------------------------------------------------------------------
function KeyFiguresSection() {
  const figures = [
    {
      value: "$120K",
      label: "Maximum Scholarship",
      description: "Award per student through university partnerships",
    },
    {
      value: "3",
      label: "Guaranteed Offers",
      description: "University offers for every student on the platform",
    },
    {
      value: "20+",
      label: "Languages",
      description: "Supported for CEFR-aligned proficiency training",
    },
    {
      value: "5+",
      label: "Countries",
      description: "USA, UK, Canada, Germany, Australia and more",
    },
    {
      value: "100%",
      label: "Free",
      description: "No fees, no commissions — free for all students",
    },
    {
      value: "24/7",
      label: "AI Tutoring",
      description: "Always-available tutoring for Math, Science, and English",
    },
  ];

  return (
    <section className="py-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <span className="inline-block mb-3 h-1 w-16 bg-yellow-500"></span>
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            By the Numbers
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
            Real data from the Rewards For Education platform and CFC Events.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {figures.map((item) => (
            <div
              key={item.label}
              className="border border-gray-200 dark:border-gray-600 p-6 bg-gray-50 dark:bg-gray-700"
            >
              <div className="flex items-center mb-4">
                <div className="text-4xl font-bold text-blue-600">
                  {item.value}
                </div>
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {item.label}
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                {item.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------------
// Ecosystem Section
// -------------------------------------------------------------------
function EcosystemSection() {
  const platforms = [
    {
      name: "Coins For College",
      role: "Parent Company",
      description:
        "Digital token economies for academic institutions. Students earn Scholarship Points, parents accumulate Tuition Coins ($TUIT) redeemable toward college expenses.",
      logoPlaceholder: "CFC",
    },
    {
      name: "Rewards For Education",
      role: "Student Platform",
      description:
        "100% free platform providing AI tutoring, visa help, application management, language training, and scholarship matching — all funded by university partnerships.",
      logoPlaceholder: "RFE",
    },
    {
      name: "CFC Events",
      role: "Events Platform",
      description:
        "Education fairs, university recruitment events, scholarship expos, and virtual conferences connecting students with universities worldwide.",
      logoPlaceholder: "Events",
    },
  ];

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <span className="inline-block mb-3 h-1 w-16 bg-blue-600"></span>
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            The CFC Ecosystem
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
            Three platforms working together to make higher education accessible
            for every student.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {platforms.map((platform) => (
            <div
              key={platform.name}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600"
            >
              <div className="h-32 flex items-center justify-center bg-gray-100 dark:bg-gray-600">
                <span className="text-3xl font-bold text-gray-400 dark:text-gray-400">
                  {platform.logoPlaceholder}
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold mb-1 text-gray-900 dark:text-white">
                  {platform.name}
                </h3>
                <div className="mb-2">
                  <Chip variant="primary" size="sm">
                    {platform.role}
                  </Chip>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {platform.description}
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
// How It Works Section
// -------------------------------------------------------------------
function HowItWorksSection() {
  const steps = [
    {
      title: "Join the Platform",
      description:
        "Sign up on Rewards For Education for free. No subscription fees, no hidden costs. Get your personalized roadmap to a global university.",
    },
    {
      title: "Prepare & Learn",
      description:
        "Access AI tutoring, language training, and academic resources. Earn Scholarship Points for your progress through the Coins For College system.",
    },
    {
      title: "Apply with Confidence",
      description:
        "Use the application manager to build your SOP, coordinate recommendation letters, and track deadlines. Get matched with universities that fit your profile.",
    },
    {
      title: "Attend Events & Connect",
      description:
        "Join CFC Events education fairs to meet university representatives face-to-face, attend scholarship workshops, and get hands-on admissions support.",
    },
  ];

  return (
    <section className="py-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <span className="inline-block mb-3 h-1 w-16 bg-yellow-500"></span>
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
            From sign-up to university admission — every step is supported.
          </p>
        </div>
        <div className="space-y-6">
          {steps.map((step, index) => (
            <div key={step.title} className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-3">
                <div className="flex items-center h-full">
                  <div className="bg-yellow-500 text-black p-3">
                    <span className="font-bold">Step {index + 1}</span>
                  </div>
                  <div className="bg-black text-white dark:bg-white dark:text-black p-3 flex-grow">
                    <span>{step.title}</span>
                  </div>
                </div>
              </div>
              <div className="col-span-12 md:col-span-9 border border-gray-200 dark:border-gray-600 p-6 bg-gray-50 dark:bg-gray-700">
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {step.description}
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
// CTA Section
// -------------------------------------------------------------------
function CTASection() {
  return (
    <section className="bg-black text-white dark:bg-white dark:text-black py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-6">
          Your Global Future Starts Here
        </h2>
        <p className="text-xl max-w-3xl mx-auto mb-10">
          Everything you need to succeed — from AI tutoring and finance planning
          to visa documentation assistance. 100% free for students and families.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
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
    </section>
  );
}

"use client";

import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";

export default function AboutPage() {
  return (
    <main className="bg-white dark:bg-gray-900">
      <HeroSection />
      <MissionSection />
      <AboutExpoSection />
      <ThematicAreasSection />
      <KeyFiguresSection />
      <OrganizersSection />
      <TimelineSection />
      <CTASection />
    </main>
  );
}

// -------------------------------------------------------------------
// Hero Section - redesigned to match homepage style
// -------------------------------------------------------------------
function HeroSection() {
  return (
    <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <span className="inline-block mb-3 h-1 w-16 bg-yellow-500"></span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              About UNITE Expo 2025
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Uganda&apos;s premier platform connecting international investors with
              opportunities in one of Africa&apos;s most dynamic economies.
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
              <h2 className="text-2xl font-bold mb-4">July 7-14, 2025</h2>
              <p className="mb-4">Kampala International Conference Centre</p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="w-4 h-4 inline-block bg-yellow-500 mr-3"></span>
                  <span>300+ Exhibitors</span>
                </li>
                <li className="flex items-center">
                  <span className="w-4 h-4 inline-block bg-yellow-500 mr-3"></span>
                  <span>20000+ Attendees</span>
                </li>
                <li className="flex items-center">
                  <span className="w-4 h-4 inline-block bg-yellow-500 mr-3"></span>
                  <span>50+ Countries</span>
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
              UNITE Expo 2025 aims to establish Uganda as a premier investment
              destination by showcasing the country&apos;s economic potential and
              connecting international investors with local opportunities.
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
                  To position Uganda as East Africa&apos;s leading investment hub,
                  driving sustainable economic growth and creating prosperity
                  for all Ugandans.
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
                  To showcase Uganda&apos;s investment opportunities, connect
                  international investors with local partners, and facilitate
                  meaningful business relationships.
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
                  Integrity, transparency, inclusivity, sustainability, and
                  excellence in all our operations and partnerships.
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
                  To catalyze $500M in new investments, create 10,000+ jobs, and
                  establish 200+ international business partnerships by 2026.
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
// About Expo Section
// -------------------------------------------------------------------
function AboutExpoSection() {
  return (
    <section className="py-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <span className="inline-block mb-3 h-1 w-16 bg-blue-600"></span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              Uganda&apos;s Premier Investment &amp; Trade Exhibition
            </h2>
            <div className="text-gray-600 dark:text-gray-300 space-y-4">
              <p>
                UNITE (Uganda Next - Investment &amp; Trade Expo) 2025 is the
                largest and most comprehensive investment and trade exhibition
                in Uganda, showcasing the country&apos;s vast potential across
                various sectors of the economy.
              </p>
              <p>
                Organized by the Uganda Investment Authority in collaboration
                with the Ministry of Trade, Industry, and Cooperatives, UNITE
                Expo 2025 serves as a platform for local and international
                businesses to connect, collaborate, and explore investment
                opportunities in Uganda.
              </p>
              <p>
                The expo features exhibitions from key sectors including
                agriculture, energy, manufacturing, ICT, tourism, and financial
                services, as well as investment forums, B2B matchmaking
                sessions, presentations on Uganda&apos;s investment incentives, and
                networking opportunities with government and business leaders.
              </p>
              <p>
                UNITE Expo 2025 is part of Uganda&apos;s broader strategy to attract
                $5 billion in foreign direct investment by 2026, diversify the
                economy, and create sustainable jobs for its growing population.
              </p>
            </div>
          </div>
          <div className="md:col-span-1">
            <div className="bg-black text-white dark:bg-white dark:text-black h-full p-6 border border-gray-200 dark:border-gray-600">
              <h3 className="text-xl font-bold mb-6">Key Features</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="bg-yellow-500 text-black h-8 w-8 flex items-center justify-center mr-3 flex-shrink-0">
                    <span>01</span>
                  </div>
                  <span>Sector-specific investment showcases</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-yellow-500 text-black h-8 w-8 flex items-center justify-center mr-3 flex-shrink-0">
                    <span>02</span>
                  </div>
                  <span>
                    High-level investment forums and policy discussions
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="bg-yellow-500 text-black h-8 w-8 flex items-center justify-center mr-3 flex-shrink-0">
                    <span>03</span>
                  </div>
                  <span>Structured B2B and B2G matchmaking sessions</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-yellow-500 text-black h-8 w-8 flex items-center justify-center mr-3 flex-shrink-0">
                    <span>04</span>
                  </div>
                  <span>
                    Site visits to special economic zones and industrial parks
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="bg-yellow-500 text-black h-8 w-8 flex items-center justify-center mr-3 flex-shrink-0">
                    <span>05</span>
                  </div>
                  <span>Investment facilitation and aftercare services</span>
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
// Thematic Areas Section
// -------------------------------------------------------------------
function ThematicAreasSection() {
  const thematicAreas = [
    {
      title: "Agriculture & Agro-processing",
      description:
        "Value addition in coffee, tea, dairy, fruits, and commercial farming opportunities.",
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
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
      ),
    },
    {
      title: "Energy & Minerals",
      description:
        "Renewable energy, oil and gas, mining, and mineral beneficiation projects.",
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
      title: "Manufacturing",
      description:
        "Light manufacturing, textiles, pharmaceuticals, and industrial park investments.",
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
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
          />
        </svg>
      ),
    },
    {
      title: "Tourism & Hospitality",
      description:
        "Luxury accommodation, adventure tourism, and cultural tourism investments.",
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
    {
      title: "ICT & Innovation",
      description:
        "Tech hubs, BPO, software development, and digital infrastructure projects.",
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
      title: "Infrastructure",
      description:
        "Transport, logistics, real estate, and urban development investments.",
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
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
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
            Thematic Investment Areas
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            UNITE Expo 2025 focuses on six key sectors that represent Uganda&apos;s
            greatest investment potential and strategic development priorities.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {thematicAreas.map((area) => (
            <div
              key={area.title}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600"
            >
              <div className="p-6">
                <div className="text-yellow-500 mb-4">{area.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                  {area.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {area.description}
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
      value: "300+",
      label: "Exhibitors",
      description: "Representing key sectors of the economy",
    },
    {
      value: "5000+",
      label: "Attendees",
      description: "Business leaders, investors, and policymakers",
    },
    {
      value: "50+",
      label: "Speakers",
      description: "Global experts and thought leaders",
    },
    {
      value: "30+",
      label: "Countries",
      description: "International delegation participation",
    },
    {
      value: "$1B+",
      label: "Investment Potential",
      description: "Projects and opportunities showcased",
    },
    {
      value: "75+",
      label: "B2B Events",
      description: "Matchmaking and networking sessions",
    },
  ];

  return (
    <section className="py-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <span className="inline-block mb-3 h-1 w-16 bg-yellow-500"></span>
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            UNITE Expo 2025 by the Numbers
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
            The scale and scope of East Africa&apos;s premier investment and trade
            exhibition.
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
// Organizers Section
// -------------------------------------------------------------------
function OrganizersSection() {
  const organizers = [
    {
      name: "Uganda Investment Authority",
      role: "Lead Organizer",
      description:
        "Responsible for overall coordination and investment facilitation.",
      logoPlaceholder: "UIA",
    },
    {
      name: "Ministry of Trade, Industry & Cooperatives",
      role: "Co-organizer",
      description: "Provides policy guidance and international trade linkages.",
      logoPlaceholder: "MTIC",
    },
    {
      name: "Private Sector Foundation Uganda",
      role: "Strategic Partner",
      description:
        "Represents private sector interests and business participation.",
      logoPlaceholder: "PSFU",
    },
    {
      name: "Uganda Export Promotion Board",
      role: "Strategic Partner",
      description:
        "Facilitates export promotion and market access initiatives.",
      logoPlaceholder: "UEPB",
    },
  ];

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <span className="inline-block mb-3 h-1 w-16 bg-blue-600"></span>
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Organizing Partners
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
            UNITE Expo 2025 is a collaborative effort between government
            agencies, private sector organizations, and international partners.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {organizers.map((org) => (
            <div
              key={org.name}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600"
            >
              <div className="h-32 flex items-center justify-center bg-gray-100 dark:bg-gray-600">
                <span className="text-3xl font-bold text-gray-400 dark:text-gray-400">
                  {org.logoPlaceholder}
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold mb-1 text-gray-900 dark:text-white">
                  {org.name}
                </h3>
                <div className="mb-2">
                  <Chip variant="primary" size="sm">
                    {org.role}
                  </Chip>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {org.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button
            variant="primary"
            buttonType="outline"
            href="/about/mission-vision"
          >
            Learn More About Our Partners
          </Button>
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------------
// Timeline Section
// -------------------------------------------------------------------
function TimelineSection() {
  const timelineEvents = [
    {
      date: "March 15, 2025",
      title: "Opening Ceremony",
      description:
        "Official opening by H.E. The President of Uganda with keynote speeches from government officials and dignitaries.",
    },
    {
      date: "March 16, 2025",
      title: "Sector-Specific Investment Forums",
      description:
        "Parallel investment forums focusing on each thematic area with presentations and panel discussions.",
    },
    {
      date: "March 17, 2025",
      title: "B2B Matchmaking Day",
      description:
        "Structured business matchmaking sessions, site visits to industrial parks, and networking events.",
    },
    {
      date: "March 18, 2025",
      title: "Closing & Investment Announcements",
      description:
        "Closing ceremony featuring investment commitment announcements and awards presentation.",
    },
  ];

  return (
    <section className="py-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <span className="inline-block mb-3 h-1 w-16 bg-yellow-500"></span>
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Event Timeline
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
            Four days of investment opportunities, knowledge sharing, and
            networking.
          </p>
        </div>
        <div className="space-y-6">
          {timelineEvents.map((event, index) => (
            <div key={event.title} className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-3">
                <div className="flex items-center h-full">
                  <div className="bg-yellow-500 text-black p-3">
                    <span className="font-bold">Day {index + 1}</span>
                  </div>
                  <div className="bg-black text-white dark:bg-white dark:text-black p-3 flex-grow">
                    <span>{event.date}</span>
                  </div>
                </div>
              </div>
              <div className="col-span-12 md:col-span-9 border border-gray-200 dark:border-gray-600 p-6 bg-gray-50 dark:bg-gray-700">
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                  {event.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {event.description}
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
// CTA Section - styled to match homepage
// -------------------------------------------------------------------
function CTASection() {
  return (
    <section className="bg-black text-white dark:bg-white dark:text-black py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-6">
          Be Part of Uganda&apos;s Economic Growth Story
        </h2>
        <p className="text-xl max-w-3xl mx-auto mb-10">
          Join us at UNITE Expo 2025 and discover investment opportunities in
          one of Africa&apos;s fastest-growing economies.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button variant="primary" size="lg" href="/tickets">
            Register Now
          </Button>
          <Button
            variant="light"
            buttonType="outline"
            size="lg"
            href="/contact"
            className="border-white text-white dark:border-black dark:text-black"
          >
            Become an Exhibitor
          </Button>
        </div>
      </div>
    </section>
  );
}

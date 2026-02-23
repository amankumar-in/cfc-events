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
              Driving Uganda&apos;s economic transformation through strategic
              investments and partnerships
            </p>
          </div>
          <div className="md:w-1/3 bg-black text-white dark:bg-white dark:text-black p-8 border border-gray-200 dark:border-gray-600">
            <div className="relative">
              <div className="absolute top-0 right-0 w-12 h-12 bg-blue-600"></div>
              <h2 className="text-2xl font-bold mb-4">Strategic Goals</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="w-2 h-2 inline-block bg-yellow-500 mt-2 mr-3 flex-shrink-0"></span>
                  <span>$5B in new investments by 2026</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 inline-block bg-yellow-500 mt-2 mr-3 flex-shrink-0"></span>
                  <span>Create 50,000 new jobs</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 inline-block bg-yellow-500 mt-2 mr-3 flex-shrink-0"></span>
                  <span>Establish 200+ international partnerships</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 inline-block bg-yellow-500 mt-2 mr-3 flex-shrink-0"></span>
                  <span>Expand exports by 30%</span>
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
                UNITE 2025 is dedicated to accelerating Uganda&apos;s economic
                development by creating a dynamic platform that showcases
                investment opportunities and facilitates meaningful
                partnerships.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 dark:border-gray-600 p-4 bg-white dark:bg-gray-800">
                  <h3 className="font-bold text-black dark:text-white mb-2">
                    Connecting Investors
                  </h3>
                  <p>
                    Connecting international investors with high-potential
                    opportunities across Uganda&apos;s diverse economy
                  </p>
                </div>
                <div className="border border-gray-200 dark:border-gray-600 p-4 bg-white dark:bg-gray-800">
                  <h3 className="font-bold text-black dark:text-white mb-2">
                    Showcasing Uganda
                  </h3>
                  <p>
                    Showcasing Uganda&apos;s competitive advantages and strategic
                    position in the East African Community
                  </p>
                </div>
                <div className="border border-gray-200 dark:border-gray-600 p-4 bg-white dark:bg-gray-800">
                  <h3 className="font-bold text-black dark:text-white mb-2">
                    Facilitating Partnerships
                  </h3>
                  <p>
                    Facilitating meaningful partnerships between foreign
                    investors and local businesses
                  </p>
                </div>
                <div className="border border-gray-200 dark:border-gray-600 p-4 bg-white dark:bg-gray-800">
                  <h3 className="font-bold text-black dark:text-white mb-2">
                    Knowledge Transfer
                  </h3>
                  <p>
                    Promoting knowledge transfer and capacity building through
                    networking and dialogue
                  </p>
                </div>
              </div>
              <p>
                Through UNITE Expo 2025, we aim to create a vibrant marketplace
                of ideas, opportunities, and connections that will drive
                investment, job creation, and prosperity across Uganda.
              </p>
            </div>
          </div>
          <div className="md:col-span-5">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 p-8">
              <div className="bg-black text-white dark:bg-white dark:text-black p-8 relative">
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-600"></div>
                <h3 className="text-2xl font-bold mb-6">Our Commitment</h3>
                <p className="mb-6">
                  We are committed to positioning Uganda as a premier investment
                  destination by:
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="w-4 h-4 inline-block bg-yellow-500 mt-1 mr-3 flex-shrink-0"></span>
                    <span>Supporting Uganda Vision 2040</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-4 h-4 inline-block bg-yellow-500 mt-1 mr-3 flex-shrink-0"></span>
                    <span>Building an inclusive economy</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-4 h-4 inline-block bg-yellow-500 mt-1 mr-3 flex-shrink-0"></span>
                    <span>Promoting sustainable development</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-4 h-4 inline-block bg-yellow-500 mt-1 mr-3 flex-shrink-0"></span>
                    <span>Facilitating regional integration</span>
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
                A Prosperous and Globally Integrated Uganda
              </p>
              <div className="w-32 h-1 bg-yellow-500 mb-8"></div>
              <p>
                We envision Uganda as a thriving investment destination and a
                key player in the global economy, leveraging its strategic
                position, abundant resources, and entrepreneurial spirit.
              </p>
            </div>
          </div>
          <div>
            <span className="inline-block mb-3 h-1 w-16 bg-yellow-500"></span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              Our Vision for Uganda
            </h2>
            <div className="space-y-6 text-gray-600 dark:text-gray-300">
              <p className="text-lg">
                We envision Uganda as a thriving investment destination and a
                key player in the global economy, where:
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-yellow-500 text-black h-8 w-8 flex items-center justify-center mr-4 flex-shrink-0">
                    <span>1</span>
                  </div>
                  <p>
                    <span className="font-bold text-black dark:text-white">
                      Strategic investments
                    </span>{" "}
                    drive sustainable growth across all sectors of the economy
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="bg-yellow-500 text-black h-8 w-8 flex items-center justify-center mr-4 flex-shrink-0">
                    <span>2</span>
                  </div>
                  <p>
                    <span className="font-bold text-black dark:text-white">
                      Ugandan businesses
                    </span>{" "}
                    are competitive regionally and globally
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="bg-yellow-500 text-black h-8 w-8 flex items-center justify-center mr-4 flex-shrink-0">
                    <span>3</span>
                  </div>
                  <p>
                    <span className="font-bold text-black dark:text-white">
                      Economic opportunities
                    </span>{" "}
                    are accessible to all Ugandans
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="bg-yellow-500 text-black h-8 w-8 flex items-center justify-center mr-4 flex-shrink-0">
                    <span>4</span>
                  </div>
                  <p>
                    <span className="font-bold text-black dark:text-white">
                      Innovation and technology
                    </span>{" "}
                    adoption accelerate development
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="bg-yellow-500 text-black h-8 w-8 flex items-center justify-center mr-4 flex-shrink-0">
                    <span>5</span>
                  </div>
                  <p>
                    <span className="font-bold text-black dark:text-white">
                      Uganda serves
                    </span>{" "}
                    as a model for sustainable and inclusive economic growth in
                    Africa
                  </p>
                </div>
              </div>
              <p>
                UNITE Expo 2025 contributes to this vision by creating a
                platform where investment meets opportunity, ideas meet
                resources, and global markets meet local enterprise.
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
      title: "Integrity",
      description:
        "We uphold the highest standards of integrity and transparency in all our interactions, providing trustworthy information and facilitating honest connections.",
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
      title: "Innovation",
      description:
        "We embrace creative and forward-thinking approaches to showcase Uganda's potential and connect stakeholders in meaningful ways.",
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
      title: "Inclusivity",
      description:
        "We create opportunities for all stakeholders, regardless of size or sector, ensuring diverse participation and representation.",
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
      title: "Collaboration",
      description:
        "We foster a spirit of partnership and teamwork, believing that together we can achieve greater impact and success.",
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      title: "Impact",
      description:
        "We are committed to delivering real, measurable results that contribute to Uganda's economic development and prosperity.",
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
      title: "Sustainability",
      description:
        "We promote investments and partnerships that are environmentally responsible, socially beneficial, and economically viable in the long term.",
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
            The principles that guide everything we do at UNITE Expo, informing
            our decisions and actions
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
// Core Principles Section
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
              Beyond our core values, these operational principles shape how we
              execute our mission and work toward our vision.
            </p>
            <div className="bg-black text-white dark:bg-white dark:text-black p-6 border border-gray-200 dark:border-gray-600">
              <h3 className="text-xl font-bold mb-4">Strategic Direction</h3>
              <p>
                By adhering to these principles, UNITE Expo 2025 aims to be more
                than an event—we strive to be a catalyst for lasting economic
                transformation in Uganda.
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
                  We prioritize tangible outcomes over process, constantly
                  measuring and evaluating our impact against concrete goals and
                  targets.
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-6">
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white flex items-center">
                  <span className="bg-yellow-500 text-black h-8 w-8 inline-flex items-center justify-center mr-3">
                    02
                  </span>
                  Client-Centered
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We put the needs of investors, exhibitors, and attendees at
                  the center of our planning and execution, ensuring value for
                  all stakeholders.
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
                  We base our decisions on solid research, market intelligence,
                  and feedback, continuously refining our approach for maximum
                  effectiveness.
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-6">
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white flex items-center">
                  <span className="bg-yellow-500 text-black h-8 w-8 inline-flex items-center justify-center mr-3">
                    04
                  </span>
                  Long-Term Focus
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We design our programs for lasting impact, focusing on
                  investments and partnerships that will deliver sustained
                  benefits beyond the expo itself.
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
              Share Our Vision for Uganda&apos;s Future
            </h2>
            <p className="text-lg mb-8">
              Join us at UNITE Expo 2025 and be part of Uganda&apos;s economic
              transformation story. Together, we can build a more prosperous and
              globally integrated Uganda.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" size="lg" href="/tickets">
                Register Now
              </Button>
              <Button
                variant="light"
                buttonType="outline"
                size="lg"
                href="/about"
                className="border-white text-white dark:border-black dark:text-black"
              >
                Meet Our Team
              </Button>
            </div>
          </div>
          <div className="bg-white text-black dark:bg-black dark:text-white p-8 border border-gray-200 dark:border-gray-600">
            <div className="relative p-6">
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-600"></div>
              <h3 className="text-2xl font-bold mb-6">Strategic Partnership</h3>
              <p className="mb-6">
                UNITE Expo 2025 offers more than exhibition space—we provide a
                comprehensive platform for building lasting relationships and
                creating real business opportunities.
              </p>
              <div className="flex items-center">
                <Link
                  href="/contact"
                  className="flex items-center text-black dark:text-white hover:text-yellow-500 dark:hover:text-yellow-500 font-medium"
                >
                  <span>Inquire About Partnerships</span>
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

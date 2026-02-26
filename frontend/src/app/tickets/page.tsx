"use client";

import { useState, useEffect } from "react";
import { fetchAPI } from "@/lib/api/api-config";
import { Button } from "@/components/ui/Button";

interface TicketCategory {
  id: number;
  documentId: string;
  name: string;
  description: Record<string, unknown>[];
  price: number;
  currency: string;
  validFrom: string;
  validUntil: string;
  maxPurchaseQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  allowedEvents: Record<string, unknown>[];
}

export default function TicketsPage() {
  const [ticketCategories, setTicketCategories] = useState<TicketCategory[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTicketCategories = async () => {
      try {
        const response = await fetchAPI("/ticket-categories?populate=*");
        console.log("Ticket categories response:", response);

        if (response && response.data) {
          setTicketCategories(response.data);
        } else {
          setError("Failed to retrieve ticket categories data");
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching ticket categories:", err);
        setError("Failed to load ticket categories. Please try again later.");
        setLoading(false);
      }
    };

    fetchTicketCategories();
  }, []);

  // Helper function to format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Helper function to render rich text description
  const renderDescription = (description: Record<string, unknown>[]) => {
    if (!description || !Array.isArray(description)) return null;

    return description.map((block, blockIndex) => {
      if (block.type === "paragraph") {
        return (
          <p key={blockIndex} className="mb-2">
            {(block.children as Record<string, unknown>[])?.map((child: Record<string, unknown>, childIndex: number) => (
              <span key={childIndex}>{child.text as string}</span>
            ))}
          </p>
        );
      } else if (block.type === "list") {
        return (
          <ul
            key={blockIndex}
            className={
              block.format === "ordered"
                ? "list-decimal ml-5"
                : "list-disc ml-5"
            }
          >
            {(block.children as Record<string, unknown>[])?.map((item: Record<string, unknown>, itemIndex: number) => (
              <li key={itemIndex}>
                {(item.children as Record<string, unknown>[])?.map((child: Record<string, unknown>, childIndex: number) => (
                  <span key={childIndex}>{child.text as string}</span>
                ))}
              </li>
            ))}
          </ul>
        );
      }
      return null;
    });
  };

  return (
    <main className="bg-white dark:bg-gray-900">
      <HeroSection />
      <TicketsSection
        ticketCategories={ticketCategories}
        loading={loading}
        error={error}
        formatCurrency={formatCurrency}
        renderDescription={renderDescription}
      />
      <FAQsSection />
      <GroupRegistrationSection />
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
              CFC Events Tickets
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Secure your place at Uganda&apos;s premier investment and trade expo
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" href="#tickets">
                View Ticket Options
              </Button>
              <Button
                variant="dark"
                buttonType="outline"
                href="/contact"
                className="dark:border-white dark:text-white"
              >
                Group Registration
              </Button>
            </div>
          </div>
          <div className="bg-black text-white dark:bg-white dark:text-black p-8 border border-gray-200 dark:border-gray-600">
            <div className="relative">
              <div className="absolute top-0 right-0 w-12 h-12 bg-blue-600"></div>
              <h2 className="text-2xl font-bold mb-6">Key Dates</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="bg-yellow-500 text-black h-8 w-8 flex items-center justify-center mr-4 flex-shrink-0">
                    <span>1</span>
                  </div>
                  <div>
                    <p className="font-bold">Early Bird Ends</p>
                    <p>May 31, 2025</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-yellow-500 text-black h-8 w-8 flex items-center justify-center mr-4 flex-shrink-0">
                    <span>2</span>
                  </div>
                  <div>
                    <p className="font-bold">General Registration</p>
                    <p>May 1 - June 28, 2025</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-yellow-500 text-black h-8 w-8 flex items-center justify-center mr-4 flex-shrink-0">
                    <span>3</span>
                  </div>
                  <div>
                    <p className="font-bold">Event Dates</p>
                    <p>July 7-14, 2025</p>
                  </div>
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
// Tickets Section
// -------------------------------------------------------------------
function TicketsSection({
  ticketCategories,
  loading,
  error,
  formatCurrency,
  renderDescription,
}: {
  ticketCategories: TicketCategory[];
  loading: boolean;
  error: string | null;
  formatCurrency: (amount: number, currency: string) => string;
  renderDescription: (description: Record<string, unknown>[]) => React.ReactNode;
}) {
  return (
    <section
      id="tickets"
      className="py-16 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block mb-3 h-1 w-16 bg-blue-600 mx-auto"></span>
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Choose Your Ticket
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Select the ticket option that best suits your needs
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="inline-block h-8 w-8 animate-spin border-2 border-solid border-yellow-500 border-r-transparent"></div>
            <p className="ml-4 text-gray-600 dark:text-gray-300">
              Loading ticket options...
            </p>
          </div>
        ) : error ? (
          <div className="border border-gray-200 dark:border-gray-600 p-8 bg-white dark:bg-gray-800 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 mb-4">
              <svg
                className="w-8 h-8 text-yellow-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Error Loading Ticket Options
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        ) : ticketCategories.length === 0 ? (
          <div className="border border-gray-200 dark:border-gray-600 p-8 bg-white dark:bg-gray-800 text-center">
            <p className="text-lg text-gray-600 dark:text-gray-300">
              No ticket options available at this time. Please check back later.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {ticketCategories
              .filter((ticket) => ticket.isActive)
              .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
              .map((ticket) => (
                <div
                  key={ticket.documentId}
                  className={`bg-white dark:bg-gray-800 border ${
                    ticket.isFeatured
                      ? "border-yellow-500"
                      : "border-gray-200 dark:border-gray-600"
                  } flex flex-col h-full`}
                >
                  {/* Featured indicator */}
                  {ticket.isFeatured && (
                    <div className="bg-yellow-500 text-black p-2 text-center font-bold">
                      FEATURED
                    </div>
                  )}

                  {/* Ticket header */}
                  <div className="p-6 bg-black text-white dark:bg-white dark:text-black">
                    <h3 className="text-2xl font-bold mb-2">{ticket.name}</h3>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-yellow-500 mr-2">
                        {formatCurrency(ticket.price, ticket.currency)}
                      </span>
                      <span className="text-sm opacity-75">per person</span>
                    </div>
                  </div>

                  {/* Ticket content */}
                  <div className="p-6 flex-grow border-t border-gray-200 dark:border-gray-600">
                    <div className="text-gray-600 dark:text-gray-300 mb-6">
                      {renderDescription(ticket.description)}
                    </div>

                    <div className="space-y-2 mb-6">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-yellow-500 mr-2"></div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Valid until:{" "}
                          {new Date(ticket.validUntil).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-yellow-500 mr-2"></div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Max purchase: {ticket.maxPurchaseQuantity} tickets
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Purchase button */}
                  <div className="p-6 border-t border-gray-200 dark:border-gray-600">
                    <Button
                      variant={ticket.isFeatured ? "primary" : "dark"}
                      href={`/tickets/buy?categoryId=${ticket.documentId}`}
                      className="w-full dark:border-white dark:text-white"
                    >
                      Purchase Now
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </section>
  );
}

// -------------------------------------------------------------------
// FAQs Section
// -------------------------------------------------------------------
function FAQsSection() {
  const faqs = [
    {
      question: "What's included in the All-Access Pass?",
      answer:
        "The All-Access Pass provides entry to all events at CFC Events, including keynote speeches, workshops, networking events, and the exhibition area. You'll also receive priority check-in and complimentary refreshments.",
    },
    {
      question: "Can I purchase tickets at the venue?",
      answer:
        "We strongly recommend purchasing tickets online in advance to guarantee your spot, as certain events may sell out. Limited tickets may be available at the venue, subject to availability.",
    },
    {
      question: "What is the refund policy?",
      answer:
        "Tickets can be refunded up to 14 days before the event. After that, tickets are non-refundable but can be transferred to another attendee by contacting our support team.",
    },
  ];

  return (
    <section className="py-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block mb-3 h-1 w-16 bg-yellow-500 mx-auto"></span>
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Common questions about tickets and attendance
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-1">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-600"
            >
              <div className="p-6 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {faq.question}
                </h3>
              </div>
              <div className="p-6 bg-white dark:bg-gray-800">
                <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button variant="primary" buttonType="outline" href="/events">
            Browse Events
          </Button>
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------------
// Group Registration Section
// -------------------------------------------------------------------
function GroupRegistrationSection() {
  const benefits = [
    "Discounted rates for 5+ attendees",
    "Reserved seating at keynote events",
    "Dedicated liaison for your group",
    "Simplified billing with a single invoice",
  ];

  return (
    <section
      id="group-registration"
      className="py-16 bg-gray-50 dark:bg-gray-700"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <span className="inline-block mb-3 h-1 w-16 bg-blue-600"></span>
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
              Group Registration
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Coming with a team of 5 or more? Contact us for special group
              rates and custom packages that can be tailored to your
              organization&apos;s needs.
            </p>
            <Button variant="primary" href="/contact">
              Contact for Group Bookings
            </Button>
          </div>

          <div className="bg-black text-white dark:bg-white dark:text-black border border-gray-200 dark:border-gray-600 p-8">
            <div className="relative mb-6">
              <div className="absolute top-0 right-0 w-12 h-12 bg-yellow-500"></div>
              <h3 className="text-2xl font-bold">Group Benefits</h3>
            </div>

            <ul className="space-y-4">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <div className="bg-yellow-500 text-black h-8 w-8 flex items-center justify-center mr-4 flex-shrink-0">
                    <span>{index + 1}</span>
                  </div>
                  <span className="pt-1">{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 p-4 border border-yellow-500">
              <p className="text-lg font-bold mb-1">Corporate Packages</p>
              <p>
                Special pricing and exclusive benefits available for corporate
                teams. Custom packages start at 10+ attendees.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

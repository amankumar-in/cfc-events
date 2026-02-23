"use client";

import { useEventContext } from "@/components/event/EventContext";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { PageBanner } from "@/components/event/PageBanner";

export default function TicketsPage() {
  const event = useEventContext();

  // Placeholder ticket categories - would come from event data in production
  const tickets = [
    {
      name: "General Admission",
      price: "Free",
      description: "Access to all public sessions and general areas",
      features: ["Public sessions", "Networking areas", "Event materials"],
    },
    {
      name: "Standard",
      price: "$49",
      description: "Full event access with additional perks",
      features: [
        "All public sessions",
        "Workshop access",
        "Networking events",
        "Session recordings",
      ],
      popular: true,
    },
    {
      name: "VIP",
      price: "$149",
      description: "Premium experience with exclusive access",
      features: [
        "All Standard benefits",
        "VIP seating",
        "Speaker meet & greet",
        "Priority Q&A",
        "Premium content",
      ],
    },
  ];

  return (
    <main className="bg-white dark:bg-gray-900">
      <PageBanner title="Get Tickets" subtitle={`Choose your access level for ${event.Title}`} />

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {tickets.map((ticket) => (
              <div
                key={ticket.name}
                className={`border ${
                  ticket.popular
                    ? "border-yellow-500"
                    : "border-gray-200 dark:border-gray-600"
                } bg-white dark:bg-gray-800 p-8 flex flex-col relative`}
              >
                {ticket.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Chip variant="primary" size="sm">
                      Most Popular
                    </Chip>
                  </div>
                )}

                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {ticket.name}
                </h2>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {ticket.price}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
                  {ticket.description}
                </p>

                <ul className="space-y-3 mb-8 flex-grow">
                  {ticket.features.map((feature) => (
                    <li key={feature} className="flex items-start text-sm">
                      <div className="w-4 h-4 bg-yellow-500 flex-shrink-0 mr-3 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={ticket.popular ? "primary" : "dark"}
                  buttonType={ticket.popular ? "solid" : "outline"}
                  className="w-full"
                >
                  Select
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

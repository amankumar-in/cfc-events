import { notFound } from "next/navigation";
import { fetchEventBySlug } from "@/lib/api/events";
import { EventProvider } from "@/components/event/EventContext";
import { EventNav } from "@/components/event/EventNav";
import { SetActiveEvent } from "@/components/layout/SetActiveEvent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ eventSlug: string }>;
}) {
  const { eventSlug } = await params;
  const event = await fetchEventBySlug(eventSlug);
  if (!event) return { title: "Event Not Found" };

  return {
    title: `${event.Title} | CFC Events`,
    description: event.ShortDescription,
  };
}

export default async function EventLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ eventSlug: string }>;
}) {
  const { eventSlug } = await params;
  const event = await fetchEventBySlug(eventSlug);

  if (!event) {
    notFound();
  }

  return (
    <EventProvider event={event}>
      <SetActiveEvent title={event.Title} slug={eventSlug} />
      <EventNav eventSlug={eventSlug} />
      {children}
    </EventProvider>
  );
}

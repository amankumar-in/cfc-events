"use client";

import { createContext, useContext, ReactNode } from "react";

export interface SponsorData {
  id: number;
  Name: string;
  Slug: string;
  Tier?: string;
  Description?: string;
  Logo?: { url: string };
  Website?: string;
}

export interface VenueData {
  id: number;
  Name: string;
  Slug?: string;
  Address?: string;
  City?: string;
  Country?: string;
  Description?: unknown[];
  Phone?: string;
  Email?: string;
  Website?: string;
  MapEmbedURL?: string;
  MainVenue?: boolean;
}

export interface FaqData {
  id: number;
  Question: string;
  Answer: string;
  Category?: { id: number; Name: string };
}

export interface EventData {
  id: number;
  documentId?: string;
  Title: string;
  Slug: string;
  ShortDescription: string;
  Description?: unknown[];
  StartDate: string;
  EndDate: string;
  Location: string;
  Category: string;
  accessMode: "open" | "registration" | "ticketed";
  isFeatured: boolean;
  Status: "draft" | "published" | "live" | "completed" | "cancelled";
  Image?: {
    url: string;
    width?: number;
    height?: number;
    alternativeText?: string | null;
    formats?: {
      small?: { url: string };
      medium?: { url: string };
      thumbnail?: { url: string };
    };
  };
  Banner?: {
    url: string;
    width?: number;
    height?: number;
    alternativeText?: string | null;
  };
  sessions?: unknown[];
  sponsors?: SponsorData[];
  venue?: VenueData;
  ticketCategories?: unknown[];
  organizers?: unknown[];
  organizations?: unknown[];
  faqs?: FaqData[];
  contactMessages?: unknown[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

const EventContext = createContext<EventData | null>(null);

export function EventProvider({
  event,
  children,
}: {
  event: EventData;
  children: ReactNode;
}) {
  return (
    <EventContext.Provider value={event}>{children}</EventContext.Provider>
  );
}

export function useEventContext(): EventData {
  const ctx = useContext(EventContext);
  if (!ctx) {
    throw new Error("useEventContext must be used within an EventProvider");
  }
  return ctx;
}

/** Safe version — returns null when outside EventProvider */
export function useOptionalEventContext(): EventData | null {
  return useContext(EventContext);
}

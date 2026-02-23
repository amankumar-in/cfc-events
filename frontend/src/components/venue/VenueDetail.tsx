"use client";

import { getStrapiURL } from "@/lib/api/api-config";

interface BlockChild {
  type: string;
  text?: string;
  children?: BlockChild[];
}

interface Block {
  type: string;
  children?: BlockChild[];
}

export interface VenueDetailData {
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
  MainImage?: { url: string };
}

function renderBlocks(blocks: Block[]) {
  return blocks.map((block, i) => {
    const text = block.children?.map((c) => c.text ?? "").join("") ?? "";
    if (block.type === "heading") {
      return (
        <h3 key={i} className="text-lg font-bold mt-4 mb-2 text-gray-900 dark:text-white">
          {text}
        </h3>
      );
    }
    return (
      <p key={i} className="mb-2 text-gray-600 dark:text-gray-300">
        {text}
      </p>
    );
  });
}

function parseMapUrl(raw: string): string {
  if (raw.includes('src="')) {
    return raw.match(/src="([^"]+)"/)?.[1] ?? raw;
  }
  return raw;
}

/**
 * Full venue detail with address, description, contact info, and map.
 * Used on both the venue page and session detail page.
 */
export function VenueDetail({
  venue,
  compact = false,
}: {
  venue: VenueDetailData;
  compact?: boolean;
}) {
  const hasMap = !!venue.MapEmbedURL;
  const hasDescription =
    venue.Description && Array.isArray(venue.Description) && venue.Description.length > 0;
  const hasContact = venue.Phone || venue.Email || venue.Website;

  return (
    <div className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 overflow-hidden">
      {/* Map or Image */}
      <div className={`bg-gray-100 dark:bg-gray-700 ${compact ? "h-48" : "h-64"}`}>
        {hasMap ? (
          <iframe
            src={parseMapUrl(venue.MapEmbedURL!)}
            className="w-full h-full"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`${venue.Name} Map`}
          />
        ) : venue.MainImage ? (
          <img
            src={getStrapiURL(venue.MainImage.url)}
            alt={venue.Name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-6">
        <h3 className={`font-bold text-gray-900 dark:text-white mb-3 ${compact ? "text-lg" : "text-xl"}`}>
          {venue.Name}
        </h3>

        {/* Address */}
        {(venue.Address || venue.City) && (
          <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300 mb-3">
            <svg className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>
              {venue.Address}
              {venue.Address && venue.City ? ", " : ""}
              {venue.City}
              {venue.Country ? `, ${venue.Country}` : ""}
            </span>
          </div>
        )}

        {/* Contact */}
        {hasContact && (
          <div className="space-y-1 mb-3">
            {venue.Phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <svg className="h-4 w-4 text-yellow-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{venue.Phone}</span>
              </div>
            )}
            {venue.Email && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <svg className="h-4 w-4 text-yellow-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href={`mailto:${venue.Email}`} className="hover:text-yellow-500 transition-colors">{venue.Email}</a>
              </div>
            )}
            {venue.Website && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <svg className="h-4 w-4 text-yellow-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <a href={venue.Website} target="_blank" rel="noopener noreferrer" className="hover:text-yellow-500 transition-colors">
                  {venue.Website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        {!compact && hasDescription && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {renderBlocks(venue.Description as Block[])}
          </div>
        )}
      </div>
    </div>
  );
}

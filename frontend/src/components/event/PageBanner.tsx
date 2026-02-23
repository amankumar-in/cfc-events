"use client";

import { useEventContext } from "./EventContext";
import { getStrapiURL } from "@/lib/api/api-config";

export function PageBanner({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const event = useEventContext();
  const bgImage = (event.Banner as { url: string } | undefined) ?? (event.Image as { url: string } | undefined);

  return (
    <section className="relative bg-gray-900 text-white overflow-hidden">
      {bgImage && (
        <div className="absolute inset-0">
          <img
            src={getStrapiURL(bgImage.url)}
            alt=""
            className="w-full h-full object-cover opacity-20"
          />
        </div>
      )}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-block mb-3 h-1 w-16 bg-yellow-500" />
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{title}</h1>
            {subtitle && <p className="text-lg text-gray-300">{subtitle}</p>}
          </div>
          {action && <div className="flex-shrink-0 pt-6">{action}</div>}
        </div>
        {children}
      </div>
    </section>
  );
}

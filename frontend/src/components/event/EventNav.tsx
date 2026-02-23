"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

interface EventNavProps {
  eventSlug: string;
}

const navItems = [
  { label: "Overview", path: "", mobileVisible: true },
  { label: "Sessions", path: "sessions", mobileVisible: true },
  { label: "Speakers", path: "speakers", mobileVisible: true },
  { label: "Sponsors", path: "sponsors", mobileVisible: true },
  { label: "Venue", path: "venue", mobileVisible: true },
  { label: "Archive", path: "archive", mobileVisible: false },
  { label: "FAQ", path: "faq", mobileVisible: false },
  { label: "Contact", path: "contact", mobileVisible: false },
];

// Main header height (h-16 = 64px)
const HEADER_HEIGHT = 64;

export function EventNav({ eventSlug }: EventNavProps) {
  const pathname = usePathname();
  const basePath = `/events/${eventSlug}`;
  const isOverview = pathname === basePath;
  const [scrolledPastHeader, setScrolledPastHeader] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolledPastHeader(window.scrollY > HEADER_HEIGHT);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center h-14">
          {/* Logo - visible only when scrolled past main header */}
          <div
            className={`flex-shrink-0 mr-4 transition-all duration-200 overflow-hidden hidden sm:block ${
              scrolledPastHeader ? "sm:w-28 opacity-100" : "w-0 opacity-0"
            }`}
          >
            <Logo />
          </div>

          {/* Nav Links */}
          <div className="flex overflow-x-auto scrollbar-hide -mb-px flex-1">
            {navItems.map((item) => {
              const href = item.path
                ? `${basePath}/${item.path}`
                : basePath;
              const isActive = item.path
                ? pathname === href
                : pathname === basePath;

              return (
                <Link
                  key={item.path || "overview"}
                  href={href}
                  className={`whitespace-nowrap px-3 sm:px-4 py-4 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
                    !item.mobileVisible ? "hidden sm:block" : ""
                  } ${
                    isActive
                      ? "border-yellow-500 text-yellow-500"
                      : "border-transparent text-gray-600 dark:text-gray-300 hover:text-yellow-500 hover:border-gray-300 dark:hover:border-gray-500"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Get Tickets Button
              Mobile: only after scrolling past main header (which also has Get Tickets)
              Desktop: always on sub-pages, scroll-reveal on overview */}
          {(scrolledPastHeader || (!isOverview && !scrolledPastHeader)) && (
            <div className={`flex-shrink-0 ml-2 sm:ml-4 ${
              !scrolledPastHeader ? "hidden sm:block" : ""
            }`}>
              <Button variant="primary" size="sm" className="!text-xs sm:!text-sm !px-2 sm:!px-3" href={`${basePath}/tickets`}>
                Get Tickets
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

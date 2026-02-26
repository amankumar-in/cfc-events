"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { NavigationLink } from "@/components/ui/NavigationLink";
import { MobileMenuButton } from "@/components/ui/MobileMenuButton";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/useAuth";
import { useActiveEvent } from "@/components/layout/ActiveEventContext";

const platformNavItems = [
  { name: "All Events", href: "/events" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

const eventNavItems = [
  { label: "Overview", path: "" },
  { label: "Sessions", path: "sessions" },
  { label: "Speakers", path: "speakers" },
  { label: "Sponsors", path: "sponsors" },
  { label: "Venue", path: "venue" },
  { label: "FAQ", path: "faq" },
  { label: "Contact", path: "contact" },
];

export default function Header({ minimal = false }: { minimal?: boolean }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { activeEvent } = useActiveEvent();

  // Detect if we're on an event-scoped page
  const isEventPage = /^\/events\/[^/]+/.test(pathname);
  const eventSlugMatch = pathname.match(/^\/events\/([^/]+)/);
  const eventSlug = eventSlugMatch?.[1];

  const navItems = platformNavItems;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [mobileMenuOpen]);

  if (minimal) {
    return (
      <>
        <header className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <Logo />
            </div>
          </div>
        </header>
      </>
    );
  }

  return (
    <>
      <header
        className={`w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 ${
          isEventPage ? "relative" : "fixed top-0"
        } z-30 transition-shadow ${scrolled && !isEventPage ? "shadow-md" : ""}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Logo />
            </div>

            {/* Desktop Navigation + Actions (right-aligned) */}
            <div className="hidden md:flex items-center ml-auto space-x-1">
              <nav className="flex items-center space-x-1">
                {navItems.map((item) => (
                  <NavigationLink key={item.name} href={item.href}>
                    {item.name}
                  </NavigationLink>
                ))}
              </nav>
              <div className="flex items-center space-x-3 ml-4">
                {isAuthenticated ? (
                  <Link
                    href="/account"
                    className="text-base font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
                  >
                    My Account
                  </Link>
                ) : (
                  <Button variant="primary" buttonType="outline" href="/auth/login">
                    Sign In
                  </Button>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center space-x-3 ml-auto">
              {isEventPage && eventSlug ? (
                <Button variant="primary" size="sm" href={`/events/${eventSlug}/tickets`}>
                  Register
                </Button>
              ) : isAuthenticated ? (
                <Button variant="primary" size="sm" href="/account">
                  My Account
                </Button>
              ) : (
                <Button variant="primary" size="sm" href="/auth/login">
                  Sign In
                </Button>
              )}
              <MobileMenuButton
                isOpen={mobileMenuOpen}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Full-screen Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900">
          <div className="px-4 sm:px-6 lg:px-8 h-full flex flex-col">
            {/* Top bar — matches header height */}
            <div className="flex items-center justify-between h-16 flex-shrink-0">
              <Logo />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-black dark:text-white"
                aria-label="Close menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="square"
                  strokeLinejoin="arcs"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {isEventPage && eventSlug ? (
              <>
                {activeEvent && (
                  <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    {activeEvent.title}
                  </p>
                )}
                <div className="py-4 space-y-4">
                  <Button variant="primary" fullWidth href={`/events/${eventSlug}/tickets`}>
                    Register
                  </Button>
                </div>

                <nav className="flex-1 flex flex-col">
                  {eventNavItems.map((item) => {
                    const href = item.path
                      ? `/events/${eventSlug}/${item.path}`
                      : `/events/${eventSlug}`;
                    const isActive = item.path
                      ? pathname === href
                      : pathname === `/events/${eventSlug}`;
                    return (
                      <Link
                        key={item.path || "overview"}
                        href={href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block w-full text-center text-lg py-4 font-medium transition-colors border-b ${
                          isActive
                            ? "border-yellow-500 text-yellow-500"
                            : "border-gray-100 dark:border-gray-800 text-black dark:text-white hover:text-yellow-500"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}

                  <div className="mt-4 pt-4">
                    {isAuthenticated && (
                      <Link
                        href="/account"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block w-full text-center text-lg py-4 font-medium text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                      >
                        My Account
                      </Link>
                    )}
                    <Link
                      href="/events"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full text-center text-lg py-4 font-medium text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                    >
                      All Events
                    </Link>
                  </div>
                </nav>
              </>
            ) : (
              <>
                <div className="py-6 space-y-4">
                  {isAuthenticated ? (
                    <Button variant="primary" fullWidth href="/account">
                      My Account
                    </Button>
                  ) : (
                    <Button variant="primary" fullWidth href="/auth/login">
                      Sign In
                    </Button>
                  )}
                </div>

                <nav className="flex-1 flex flex-col">
                  {navItems.map((item) => (
                    <NavigationLink
                      key={item.name}
                      href={item.href}
                      isMobile={true}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </NavigationLink>
                  ))}
                </nav>
              </>
            )}
          </div>
        </div>
      )}

      {!isEventPage && <div className="h-16" />}
    </>
  );
}

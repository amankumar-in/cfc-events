"use client";

import { useState, useEffect } from "react";
import { NavigationLink } from "@/components/ui/NavigationLink";
import { MobileMenuButton } from "@/components/ui/MobileMenuButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";

export default function TestComponentsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initialize dark mode class if needed
  useEffect(() => {
    // Check localStorage
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <div className="min-h-screen transition-colors bg-white dark:bg-gray-900 text-black dark:text-white">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-10">Component Testing Page</h1>

        {/* Button Tests */}
        <section className="mb-12 p-6 border border-gray-300 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-6">Button Component</h2>

          <div className="space-y-10">
            {/* Button Variants */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Button Variants (Solid)
              </h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="dark">Dark</Button>
                <Button variant="light">Light</Button>
              </div>
            </div>

            {/* Button Outlines */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Button Variants (Outline)
              </h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary" buttonType="outline">
                  Primary
                </Button>
                <Button variant="secondary" buttonType="outline">
                  Secondary
                </Button>
                <Button variant="danger" buttonType="outline">
                  Danger
                </Button>
                <Button variant="dark" buttonType="outline">
                  Dark
                </Button>
                <Button variant="light" buttonType="outline">
                  Light
                </Button>
              </div>
            </div>

            {/* Button Text */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Button Variants (Text)
              </h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary" buttonType="text">
                  Primary
                </Button>
                <Button variant="secondary" buttonType="text">
                  Secondary
                </Button>
                <Button variant="danger" buttonType="text">
                  Danger
                </Button>
                <Button variant="dark" buttonType="text">
                  Dark
                </Button>
                <Button variant="light" buttonType="text">
                  Light
                </Button>
              </div>
            </div>

            {/* Button Sizes */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Button Sizes</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="primary" size="sm">
                  Small
                </Button>
                <Button variant="primary" size="md">
                  Medium
                </Button>
                <Button variant="primary" size="lg">
                  Large
                </Button>
              </div>
            </div>

            {/* Button as Link */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Button as Link</h3>
              <div className="flex flex-wrap gap-4">
                <Button href="/test-components" variant="primary">
                  Link Button
                </Button>
                <Button
                  href="/test-components"
                  variant="secondary"
                  buttonType="outline"
                >
                  Outline Link
                </Button>
              </div>
            </div>

            {/* Full Width Button */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Full Width Button</h3>
              <div className="max-w-md space-y-4">
                <Button variant="primary" fullWidth>
                  Full Width Button
                </Button>
                <Button variant="secondary" buttonType="outline" fullWidth>
                  Full Width Outline
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ThemeToggle Tests */}
        <section className="mb-12 p-6 border border-gray-300 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-6">ThemeToggle Component</h2>

          <div className="flex flex-col items-start gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Dark Mode:</span>
              <ThemeToggle />
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              Click to toggle between light and dark mode.
            </p>
          </div>
        </section>

        {/* NavigationLink Tests */}
        <section className="mb-12 p-6 border border-gray-300 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-6">NavigationLink Component</h2>

          <div className="mb-8">
            <h3 className="font-medium mb-4">Desktop Navigation Links:</h3>
            <div className="flex flex-wrap gap-1 border border-gray-300 dark:border-gray-700 p-4">
              <NavigationLink href="/test-components">
                Active Link
              </NavigationLink>
              <NavigationLink href="/about">About</NavigationLink>
              <NavigationLink href="/events">Events</NavigationLink>
              <NavigationLink href="/speakers">Speakers</NavigationLink>
              <NavigationLink href="/tickets">Tickets</NavigationLink>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-medium mb-4">Mobile Navigation Links:</h3>
            <div className="w-64 border border-gray-300 dark:border-gray-700 p-4">
              <NavigationLink href="/test-components" isMobile={true}>
                Active Link
              </NavigationLink>
              <NavigationLink href="/about" isMobile={true}>
                About
              </NavigationLink>
              <NavigationLink href="/events" isMobile={true}>
                Events
              </NavigationLink>
              <NavigationLink href="/speakers" isMobile={true}>
                Speakers
              </NavigationLink>
              <NavigationLink href="/tickets" isMobile={true}>
                Tickets
              </NavigationLink>
            </div>
          </div>
        </section>

        {/* MobileMenuButton Tests */}
        <section className="mb-12 p-6 border border-gray-300 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-6">MobileMenuButton Component</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-medium mb-4">States:</h3>
              <div className="flex items-center gap-8">
                <div>
                  <div className="text-sm mb-2">Closed:</div>
                  <div className="inline-block border border-gray-300 dark:border-gray-700">
                    <MobileMenuButton isOpen={false} onClick={() => {}} />
                  </div>
                </div>

                <div>
                  <div className="text-sm mb-2">Open:</div>
                  <div className="inline-block border border-gray-300 dark:border-gray-700">
                    <MobileMenuButton isOpen={true} onClick={() => {}} />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-4">Interactive Demo:</h3>
              <div className="flex flex-col items-start gap-4">
                <div className="inline-block border border-gray-300 dark:border-gray-700">
                  <MobileMenuButton
                    isOpen={mobileMenuOpen}
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  />
                </div>
                <p className="text-sm">
                  Current state:{" "}
                  <span className="font-medium">
                    {mobileMenuOpen ? "Open" : "Closed"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Logo with Chip Component */}
        <section className="mb-12 p-6 border border-gray-300 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-6">Logo with Chip Component</h2>

          <div className="space-y-10">
            <div>
              <h3 className="font-medium mb-4">Yellow Chip (Primary):</h3>
              <div className="p-4 bg-white border border-gray-300 inline-block">
                <div className="flex items-center gap-2">
                  <Logo forceMode="light" />
                  <Chip variant="primary">2026</Chip>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-4">Black Chip:</h3>
              <div className="p-4 bg-white border border-gray-300 inline-block">
                <div className="flex items-center gap-2">
                  <Logo forceMode="light" />
                  <Chip variant="black">2025</Chip>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-4">Outline Chip:</h3>
              <div className="p-4 bg-white border border-gray-300 inline-block">
                <div className="flex items-center gap-2">
                  <Logo forceMode="light" />
                  <Chip variant="outline">2026</Chip>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-4">
                Accent Chip (Yellow & Black):
              </h3>
              <div className="p-4 bg-white border border-gray-300 inline-block">
                <div className="flex items-center gap-2">
                  <Logo forceMode="light" />
                  <Chip variant="accent">2025</Chip>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-4">Dark Mode Example:</h3>
              <div className="p-4 bg-gray-900 border border-gray-700 inline-block">
                <div className="flex items-center gap-2">
                  <Logo forceMode="dark" />
                  <Chip variant="primary">2025</Chip>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-4">Size Variations:</h3>
              <div className="p-4 bg-white border border-gray-300 flex items-end gap-4">
                <div className="flex items-center gap-2">
                  <Chip variant="primary" size="sm">
                    2025
                  </Chip>
                </div>
                <div className="flex items-center gap-2">
                  <Chip variant="primary" size="md">
                    2025
                  </Chip>
                </div>
                <div className="flex items-center gap-2">
                  <Chip variant="primary" size="lg">
                    2025
                  </Chip>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Logo Component */}
        <section className="mb-12 p-6 border border-gray-300 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-6">Logo Component</h2>

          <div className="flex flex-col gap-8">
            <div>
              <h3 className="font-medium mb-4">Light Mode Logo:</h3>
              <div className="p-4 bg-white border border-gray-300 inline-block">
                <Logo forceMode="light" />
                <p className="mt-2 text-sm text-gray-500">
                  Using logo-lightmode.svg
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-4">Dark Mode Logo:</h3>
              <div className="p-4 bg-gray-900 border border-gray-700 inline-block">
                <Logo forceMode="dark" />
                <p className="mt-2 text-sm text-gray-400">
                  Using logo-darkmode.svg
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-4">Automatic Mode Switching:</h3>
              <div className="p-4 border border-gray-300 dark:border-gray-700 inline-block">
                <Logo />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Automatically switches based on current theme
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mock Header Example */}
        <section className="mb-12 p-6 border border-gray-300 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-6">Mock Header Example</h2>

          <div className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
              <div className="flex justify-between items-center">
                {/* Logo */}
                <Logo />

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-1">
                  <NavigationLink href="/test-components">Home</NavigationLink>
                  <NavigationLink href="/about">About</NavigationLink>
                  <NavigationLink href="/events">Events</NavigationLink>
                  <NavigationLink href="/tickets">Tickets</NavigationLink>
                </div>

                {/* Theme Toggle and Mobile Menu */}
                <div className="flex items-center gap-4">
                  <Button variant="primary" size="sm" href="/tickets">
                    Get Tickets
                  </Button>
                  <ThemeToggle />
                  <div className="md:hidden">
                    <MobileMenuButton
                      isOpen={mobileMenuOpen}
                      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    />
                  </div>
                </div>
              </div>

              {/* Mobile Menu */}
              {mobileMenuOpen && (
                <div className="mt-2 md:hidden">
                  <NavigationLink href="/test-components" isMobile={true}>
                    Home
                  </NavigationLink>
                  <NavigationLink href="/about" isMobile={true}>
                    About
                  </NavigationLink>
                  <NavigationLink href="/events" isMobile={true}>
                    Events
                  </NavigationLink>
                  <NavigationLink href="/tickets" isMobile={true}>
                    Tickets
                  </NavigationLink>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

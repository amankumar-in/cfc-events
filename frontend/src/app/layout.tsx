import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "@/lib/react-query-provider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import SiteLayout from "@/components/layout/SiteLayout";
import { ActiveEventProvider } from "@/components/layout/ActiveEventContext";
import { ThemeProvider } from "next-themes";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CFC Events - Multi-Event Platform",
  description:
    "Discover and participate in events, conferences, and sessions across the platform.",
  keywords: [
    "Events",
    "Conferences",
    "Sessions",
    "Virtual Events",
    "Livestream",
  ],
  viewport: "width=device-width, initial-scale=1",
  appleWebApp: {
    title: "CFC Events",
    capable: true,
    statusBarStyle: "default",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "CFC Events - Multi-Event Platform",
    description:
      "Discover and participate in events, conferences, and sessions across the platform.",
    type: "website",
    siteName: "CFC Events",
  },
  twitter: {
    card: "summary_large_image",
    title: "CFC Events - Multi-Event Platform",
    description:
      "Discover and participate in events, conferences, and sessions across the platform.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ReactQueryProvider>
            <AuthProvider>
              <ActiveEventProvider>
                <SiteLayout>{children}</SiteLayout>
              </ActiveEventProvider>
            </AuthProvider>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

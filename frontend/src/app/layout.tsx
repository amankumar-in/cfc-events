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
  title: "CFC Events - Coins For College",
  description:
    "Discover and participate in events, conferences, and sessions hosted by Coins For College.",
  keywords: [
    "CFC Events",
    "Coins For College",
    "Events",
    "Conferences",
    "Sessions",
    "Virtual Events",
    "Livestream",
  ],
  metadataBase: new URL("https://events.coinsforcollege.org"),
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
    title: "CFC Events - Coins For College",
    description:
      "Discover and participate in events, conferences, and sessions hosted by Coins For College.",
    type: "website",
    url: "https://events.coinsforcollege.org",
    siteName: "CFC Events",
  },
  twitter: {
    card: "summary_large_image",
    title: "CFC Events - Coins For College",
    description:
      "Discover and participate in events, conferences, and sessions hosted by Coins For College.",
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

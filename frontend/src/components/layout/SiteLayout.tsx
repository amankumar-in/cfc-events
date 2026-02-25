"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

interface SiteLayoutProps {
  children: ReactNode;
}

export default function SiteLayout({ children }: SiteLayoutProps) {
  const pathname = usePathname();
  const isAdminLive = pathname.startsWith("/admin");
  const isTicketPurchase = pathname.startsWith("/tickets/buy");

  if (isAdminLive) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header minimal={isTicketPurchase} />
      <main className="flex-grow">{children}</main>
      {!isTicketPurchase && <Footer />}
    </div>
  );
}

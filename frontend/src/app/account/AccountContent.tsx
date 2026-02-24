"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/useAuth";
import { fetchAPI } from "@/lib/api/api-config";
import { TicketPreview } from "@/components/tickets/TicketPreview";
import { Button } from "@/components/ui/Button";
import type { Ticket } from "@/lib/tickets/ticket-utils";
import {
  generateQRCodeImages,
  generateTicketPDF,
  generateAllTicketPDFs,
} from "@/lib/tickets/ticket-utils";

export default function AccountContent() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login?returnTo=/account");
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch tickets
  useEffect(() => {
    if (authLoading) return;
    if (!user?.email) {
      setLoading(false);
      return;
    }

    const fetchTickets = async () => {
      try {
        setLoading(true);
        const email = encodeURIComponent(user.email);

        // Fetch tickets where user is the attendee OR the buyer
        const response = await fetchAPI(
          `/tickets?filters[$or][0][attendeeEmail][$eq]=${email}&filters[$or][1][purchase][buyerEmail][$eq]=${email}&populate=ticketCategory&populate=purchase&sort=createdAt:desc`
        );

        if (response?.data && response.data.length > 0) {
          const ticketsWithQR = await generateQRCodeImages(response.data);
          setTickets(ticketsWithQR);
        } else {
          setTickets([]);
        }
      } catch (err) {
        console.error("Error fetching tickets:", err);
        setError("Failed to load your tickets. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [authLoading, user?.email]);

  const handleDownloadPDF = async (ticket: Ticket) => {
    try {
      setIsGeneratingPDF(true);
      await generateTicketPDF(ticket);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDownloadAll = async () => {
    try {
      setIsGeneratingPDF(true);
      await generateAllTicketPDFs(tickets);
    } catch (err) {
      console.error("Error generating PDFs:", err);
      alert("Error generating PDFs. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Still loading auth
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin border-4 border-solid border-yellow-500 border-r-transparent" />
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Loading your account...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated (redirecting)
  if (!isAuthenticated || !user) {
    return null;
  }

  // Loading tickets
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin border-4 border-solid border-yellow-500 border-r-transparent" />
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Loading your tickets...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-900 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-black mb-4">
              <svg
                className="w-6 h-6 text-yellow-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Something went wrong
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">{error}</p>
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Profile Section */}
        <div className="mb-10">
          <span className="inline-block mb-3 h-1 w-16 bg-yellow-500" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Account
          </h1>
          <div className="mt-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user?.name && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Name
                  </h3>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {user.name}
                  </p>
                </div>
              )}
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Email
                </h3>
                <p className="mt-1 text-gray-900 dark:text-white">
                  {user.email || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tickets Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              My Tickets
            </h2>
            {tickets.length > 1 && (
              <button
                onClick={handleDownloadAll}
                disabled={isGeneratingPDF}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-yellow-500 text-black disabled:opacity-50"
              >
                {isGeneratingPDF ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <>
                    <svg
                      className="mr-1 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="square"
                        strokeLinejoin="miter"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                      />
                    </svg>
                    Download All
                  </>
                )}
              </button>
            )}
          </div>

          {tickets.length > 0 ? (
            <div className="space-y-6">
              {tickets.map((ticket) => (
                <div key={ticket.id}>
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={() => handleDownloadPDF(ticket)}
                      disabled={isGeneratingPDF}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-yellow-500 text-black disabled:opacity-50"
                    >
                      {isGeneratingPDF ? (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        <>
                          <svg
                            className="mr-1 h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="square"
                              strokeLinejoin="miter"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                            />
                          </svg>
                          Download Ticket
                        </>
                      )}
                    </button>
                  </div>
                  <TicketPreview ticket={ticket} />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  strokeWidth={1.5}
                  d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                No tickets yet
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                You haven&apos;t purchased any tickets. Browse our events to get
                started.
              </p>
              <div className="mt-6">
                <Link
                  href="/events"
                  className="inline-flex items-center px-5 py-2 font-medium bg-yellow-500 text-black"
                >
                  Browse Events
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

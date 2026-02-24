"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { fetchAPI } from "@/lib/api/api-config";
import { generateQRCodeDataURL } from "@/lib/qrcode";
import { TicketPreview } from "@/components/tickets/TicketPreview";
import type { Ticket, PurchaseDetails } from "@/lib/tickets/ticket-utils";
import {
  generateQRCodeImages as generateQRImages,
  generateTicketPDF,
  generateAllTicketPDFs,
  formatDate,
  formatCurrency,
} from "@/lib/tickets/ticket-utils";

// -------------------------------------------------------------------
// Type Definitions
// -------------------------------------------------------------------

interface PaymentDetails {
  success: boolean;
  paymentMethod: string;
  amount: number;
  createdDate: string;
  confirmationCode: string;
  paymentStatus: string;
  statusCode: number;
  description: string;
  paymentAccount: string;
  merchantReference: string;
  currency: string;
  message: string;
}

interface Attendee {
  name: string;
  email: string;
  phone: string;
  organization: string;
}

// -------------------------------------------------------------------
// ConfirmationContent Component
// -------------------------------------------------------------------

export default function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderTrackingId = searchParams.get("OrderTrackingId");
  const orderMerchantReference = searchParams.get("OrderMerchantReference");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const orderNotificationType = searchParams.get("OrderNotificationType");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(
    null
  );
  const [purchaseDetails, setPurchaseDetails] =
    useState<PurchaseDetails | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isGeneratingTickets, setIsGeneratingTickets] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Ref for scrolling to tickets section
  const ticketsSectionRef = useRef<HTMLDivElement>(null);
  const scrollToTickets = () => {
    ticketsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // -------------------------------------------------------------------
  // Generate QR code images for tickets
  const generateQRCodeImages = useCallback(async (ticketsData: Ticket[]) => {
    return generateQRImages(ticketsData);
  }, []);

  // -------------------------------------------------------------------
  // PDF Generation for a single ticket (using shared utility)
  const generatePDF = async (ticket: Ticket) => {
    try {
      setIsGeneratingPDF(true);
      await generateTicketPDF(ticket);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // -------------------------------------------------------------------
  // PDF Generation for All Tickets
  const generateAllPDFs = async () => {
    try {
      setIsGeneratingPDF(true);
      await generateAllTicketPDFs(tickets);
    } catch (error) {
      console.error("Error generating PDFs:", error);
      alert("Error generating PDFs. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // -------------------------------------------------------------------
  // Data fetching and ticket generation
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getStatusBadgeClass = (_status: string) => {
    return "bg-yellow-500 text-black";
  };

  useEffect(() => {
    if (!orderTrackingId) {
      setError("No order tracking ID found in URL");
      setLoading(false);
      return;
    }

    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(
          `/api/tickets/transaction-status?orderTrackingId=${orderTrackingId}&OrderMerchantReference=${orderMerchantReference}`,
          { method: "GET", headers: { "Content-Type": "application/json" } }
        );
        const data = await response.json();
        console.log("Payment details:", data);
        if (data.success) {
          setPaymentDetails(data);
          if (
            data.paymentStatus === "Completed" &&
            data.statusCode === 1 &&
            data.merchantReference
          ) {
            // Update purchase record directly
            try {
              let STRAPI_URL = process.env.NEXT_PUBLIC_API_URL;
              if (STRAPI_URL && STRAPI_URL.includes("localhost")) {
                STRAPI_URL = STRAPI_URL.replace("localhost", "127.0.0.1");
              }
              const updateUrl = `${STRAPI_URL}/api/ticket-purchases/by-reference/${data.merchantReference}`;
              const updateResponse = await fetch(updateUrl, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  data: {
                    paymentStatus: "paid",
                    paymentMethod: data.paymentMethod || null,
                    transactionId: orderTrackingId,
                  },
                }),
              });
              if (!updateResponse.ok) {
                console.error(
                  "Failed direct update:",
                  await updateResponse.json()
                );
              }
            } catch (updateError) {
              console.error("Error in direct update:", updateError);
            }
          }
          if (data.merchantReference) {
            try {
              const purchaseResponse = await fetchAPI(
                `/ticket-purchases?filters[referenceNumber][$eq]=${data.merchantReference}`
              );
              if (
                purchaseResponse &&
                purchaseResponse.data &&
                purchaseResponse.data.length > 0
              ) {
                setPurchaseDetails(purchaseResponse.data[0]);
                if (
                  data.paymentStatus === "Completed" &&
                  data.statusCode === 1
                ) {
                  const ticketsResponse = await fetchAPI(
                    `/tickets?filters[purchase][referenceNumber][$eq]=${data.merchantReference}&populate=ticketCategory`
                  );
                  if (
                    ticketsResponse &&
                    ticketsResponse.data &&
                    ticketsResponse.data.length > 0
                  ) {
                    console.log("Tickets already exist for this purchase");
                    const ticketsWithQR = await generateQRCodeImages(
                      ticketsResponse.data
                    );
                    setTickets(ticketsWithQR);
                  } else {
                    await generateTickets(
                      purchaseResponse.data[0],
                      orderTrackingId
                    );
                  }
                }
              }
            } catch (purchaseError) {
              console.error("Error fetching purchase details:", purchaseError);
            }
          }
        } else {
          setError("Failed to retrieve payment details");
        }
        setLoading(false);
      } catch (err: unknown) {
        console.error("Error checking payment status:", err);
        setError(`Failed to check payment status: ${(err as Error).message}`);
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [orderTrackingId, generateQRCodeImages]);

  // -------------------------------------------------------------------
  // Ticket Generation for a Successful Purchase
  const generateTickets = async (
    purchase: PurchaseDetails,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _transactionId: string
  ) => {
    try {
      setIsGeneratingTickets(true);
      let STRAPI_URL = process.env.NEXT_PUBLIC_API_URL;
      if (STRAPI_URL && STRAPI_URL.includes("localhost")) {
        STRAPI_URL = STRAPI_URL.replace("localhost", "127.0.0.1");
      }
      let attendeeData: Attendee[] = [];
      let ticketCategoryId: string | null = null;
      let ticketQuantity = 1;

      try {
        const storedData = localStorage.getItem(
          `attendeeData_${purchase.referenceNumber}`
        );
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          attendeeData = parsedData.attendees;
          ticketCategoryId = parsedData.ticketCategoryId;
          ticketQuantity = parsedData.quantity;
        }
      } catch (localStorageError) {
        console.error(
          "Error retrieving data from localStorage:",
          localStorageError
        );
      }

      if (!attendeeData || attendeeData.length === 0) {
        try {
          const categoriesResponse = await fetchAPI("/ticket-categories");
          if (categoriesResponse && categoriesResponse.data) {
            const categories = categoriesResponse.data;
            for (const category of categories) {
              if (purchase.totalAmount === category.price) {
                ticketCategoryId = category.documentId;
                ticketQuantity = 1;
                break;
              } else if (purchase.totalAmount % category.price === 0) {
                ticketCategoryId = category.documentId;
                ticketQuantity = purchase.totalAmount / category.price;
                break;
              }
            }
          }
        } catch (error) {
          console.error(
            "Error determining ticket category and quantity:",
            error
          );
        }
        attendeeData = Array(ticketQuantity).fill({
          name: purchase.buyerName,
          email: purchase.buyerEmail,
          phone: purchase.buyerPhone,
          organization: "",
        });
      }

      let ticketCategory = null;
      if (ticketCategoryId) {
        try {
          const categoryResponse = await fetchAPI(
            `/ticket-categories?filters[documentId][$eq]=${ticketCategoryId}`
          );
          if (
            categoryResponse &&
            categoryResponse.data &&
            categoryResponse.data.length > 0
          ) {
            ticketCategory = categoryResponse.data[0];
          }
        } catch (error) {
          console.error("Error fetching ticket category:", error);
        }
      }

      const generatedTickets: Ticket[] = [];
      for (let i = 0; i < ticketQuantity; i++) {
        const ticketNumber = `${purchase.referenceNumber}-${i + 1}-${Math.floor(
          Math.random() * 10000
        )
          .toString()
          .padStart(4, "0")}`;
        const qrContent = { ticketNumber, event: "UNITE" };
        const qrCodeData = JSON.stringify(qrContent);
        const ticketData = {
          ticketNumber,
          attendeeName: attendeeData[i]?.name || purchase.buyerName,
          attendeeEmail: attendeeData[i]?.email || purchase.buyerEmail,
          attendeePhone: attendeeData[i]?.phone || purchase.buyerPhone,
          attendeeOrganization: attendeeData[i]?.organization || "",
          isCheckedIn: false,
          qrCodeData,
          purchase: { connect: [{ documentId: purchase.documentId }] },
          ticketCategory: ticketCategory
            ? { connect: [{ documentId: ticketCategory.documentId }] }
            : null,
        };

        try {
          const ticketResponse = await fetchAPI("/tickets", {
            method: "POST",
            body: JSON.stringify({ data: ticketData }),
          });
          if (ticketResponse && ticketResponse.data) {
            const ticket = ticketResponse.data;
            try {
              ticket.ticketCategory = ticketCategory;
              ticket.qrCodeImage = await generateQRCodeDataURL(
                ticket.qrCodeData
              );
              generatedTickets.push(ticket);
            } catch (qrError) {
              console.error("Error generating QR code image:", qrError);
              generatedTickets.push(ticket);
            }
          }
        } catch (ticketError) {
          console.error(`Error creating ticket ${i + 1}:`, ticketError);
        }
      }

      setTickets(generatedTickets);
      try {
        localStorage.removeItem(`attendeeData_${purchase.referenceNumber}`);
      } catch (error) {
        console.error("Error removing localStorage data:", error);
      }

      if (generatedTickets.length > 0) {
        try {
          const baseUrl = window.location.origin;
          const confirmationUrl = `${baseUrl}/tickets/confirmation?OrderTrackingId=${orderTrackingId}&OrderMerchantReference=${purchase.referenceNumber}`;
          const emailData = {
            email: purchase.buyerEmail,
            name: purchase.buyerName,
            subject: "Your UNITE Expo 2025 Tickets",
            ticketDetails: generatedTickets.map((ticket) => ({
              ticketNumber: ticket.ticketNumber,
              attendeeName: ticket.attendeeName,
              attendeeEmail: ticket.attendeeEmail,
              ticketCategory: ticket.ticketCategory,
            })),
            eventDate: "April 12-30, 2025",
            eventLocation: "Kampala International Convention Centre, Uganda",
            confirmationUrl,
          };
          const emailResponse = await fetch("/api/tickets/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(emailData),
          });
          const emailResult = await emailResponse.json();
          if (!emailResult.success) {
            console.error("Failed to send email:", emailResult.message);
          }
        } catch (emailError) {
          console.error("Error in email sending process:", emailError);
        }
      }
    } catch (error) {
      console.error("Error generating tickets:", error);
    } finally {
      setIsGeneratingTickets(false);
    }
  };

  // -------------------------------------------------------------------
  // Rendering
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-black dark:text-gray-300">
            Verifying payment details, please wait...
          </p>
        </div>
      </div>
    );
  }

  if (error || !paymentDetails) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-white dark:bg-gray-900">
        <div className="text-center max-w-md px-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-black">
            <svg
              className="w-6 h-6 text-yellow-500"
              xmlns="http://www.w3.org/2000/svg"
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
          <h2 className="text-xl font-bold text-black dark:text-white mt-4">
            Payment Verification Failed
          </h2>
          <p className="text-black dark:text-gray-300 mt-2">
            {error || "We couldn't verify your payment details."}
          </p>
          <Link
            href="/tickets"
            className="inline-flex items-center mt-4 px-4 py-2 text-sm font-medium bg-blue-600 text-white"
            onClick={() => (window.location.href = "/tickets")}
          >
            Back to Tickets
          </Link>
        </div>
      </div>
    );
  }

  const isPaymentSuccessful =
    paymentDetails.paymentStatus.toLowerCase() === "completed" &&
    paymentDetails.statusCode === 1;

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link
            href="/tickets"
            className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Tickets
          </Link>
        </div>

        {/* Payment Confirmation Panel */}
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
          {/* Header */}
          <div className="px-6 py-5 border-b bg-black flex justify-between items-center">
            <div className="flex items-center">
              {isPaymentSuccessful ? (
                <svg
                  className="h-8 w-8 text-yellow-500 mr-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="square"
                    strokeLinejoin="square"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-8 w-8 text-yellow-500 mr-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="square"
                    strokeLinejoin="square"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              <div>
                <h1 className="text-lg font-medium text-white">
                  {isPaymentSuccessful
                    ? "Payment Successful"
                    : "Payment Failed"}
                </h1>
                <p className="mt-1 text-sm text-yellow-500">
                  {paymentDetails.description}
                </p>
              </div>
            </div>
            {isPaymentSuccessful ? (
              <button
                onClick={scrollToTickets}
                className="px-3 py-1 text-sm font-medium bg-gray-200 text-black dark:bg-gray-200 dark:text-black"
              >
                View Tickets
              </button>
            ) : (
              <div
                className={`px-3 py-1 text-sm font-medium ${getStatusBadgeClass(
                  paymentDetails.paymentStatus
                )}`}
              >
                {paymentDetails.paymentStatus}
              </div>
            )}
          </div>

          {/* Payment Details */}
          <div className="px-6 py-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Payment Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Reference Number
                </h3>
                <p className="mt-1 text-sm text-black dark:text-gray-300">
                  {paymentDetails.merchantReference}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Transaction ID
                </h3>
                <p className="mt-1 text-sm text-black dark:text-gray-300">
                  {orderTrackingId}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Amount
                </h3>
                <p className="mt-1 text-sm text-black dark:text-gray-300">
                  {formatCurrency(
                    paymentDetails.amount,
                    paymentDetails.currency
                  )}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Payment Method
                </h3>
                <p className="mt-1 text-sm text-black dark:text-gray-300">
                  {paymentDetails.paymentMethod}{" "}
                  {paymentDetails.paymentAccount
                    ? `(${paymentDetails.paymentAccount})`
                    : ""}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Payment Date
                </h3>
                <p className="mt-1 text-sm text-black dark:text-gray-300">
                  {formatDate(paymentDetails.createdDate)}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Confirmation Code
                </h3>
                <p className="mt-1 text-sm text-black dark:text-gray-300">
                  {paymentDetails.confirmationCode}
                </p>
              </div>
            </div>

            {/* Buyer Information */}
            {purchaseDetails && (
              <div className="mt-8">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Buyer Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Name
                    </h3>
                    <p className="mt-1 text-sm text-black dark:text-gray-300">
                      {purchaseDetails.buyerName}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Email
                    </h3>
                    <p className="mt-1 text-sm text-black dark:text-gray-300">
                      {purchaseDetails.buyerEmail}
                    </p>
                  </div>
                  {purchaseDetails.buyerPhone && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Phone
                      </h3>
                      <p className="mt-1 text-sm text-black dark:text-gray-300">
                        {purchaseDetails.buyerPhone}
                      </p>
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Purchase Date
                    </h3>
                    <p className="mt-1 text-sm text-black dark:text-gray-300">
                      {formatDate(purchaseDetails.purchaseDate)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tickets Section */}
            {isPaymentSuccessful && (
              <div ref={ticketsSectionRef} className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                    Your Tickets
                  </h2>
                  {tickets.length > 0 && (
                    <button
                      onClick={generateAllPDFs}
                      disabled={isGeneratingPDF}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-blue-600 text-white"
                    >
                      {isGeneratingPDF ? (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                              strokeLinejoin="square"
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
                {isGeneratingTickets ? (
                  <div className="text-center py-8">
                    <div className="inline-block h-8 w-8 animate-spin border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="mt-2 text-black dark:text-gray-300">
                      Generating your tickets...
                    </p>
                  </div>
                ) : tickets.length > 0 ? (
                  <div className="space-y-6">
                    {tickets.map((ticket) => (
                      <div key={ticket.id} className="mb-6">
                        {/* Download Button */}
                        <div className="flex justify-end mb-2">
                          <button
                            onClick={() => generatePDF(ticket)}
                            disabled={isGeneratingPDF}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-blue-600 text-white"
                          >
                            {isGeneratingPDF ? (
                              <span className="flex items-center">
                                <svg
                                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                                    strokeLinejoin="square"
                                    strokeWidth={2}
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                                  />
                                </svg>
                                Download Ticket
                              </>
                            )}
                          </button>
                        </div>
                        {/* Ticket Preview */}
                        <TicketPreview ticket={ticket} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border border-gray-300 bg-gray-50">
                    <p className="text-black dark:text-black">
                      No tickets have been generated yet. This might take a few
                      moments.
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        purchaseDetails &&
                        generateTickets(purchaseDetails, orderTrackingId || "")
                      }
                      className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium bg-blue-600 text-white"
                      disabled={!purchaseDetails || isGeneratingTickets}
                    >
                      Generate Tickets Manually
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Actions Section */}
            <div className="mt-8">
              {isPaymentSuccessful ? (
                <div className="border border-blue-600 bg-blue-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-yellow-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.293 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        Thank you for your purchase!
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>
                          Your payment has been successfully processed. Your
                          tickets are ready for download above.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border border-black bg-black p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-yellow-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-500">
                        Payment Failed
                      </h3>
                      <div className="mt-2 text-sm text-yellow-500">
                        <p>
                          Your payment could not be processed.{" "}
                          {paymentDetails.description}
                        </p>
                      </div>
                      <div className="mt-4">
                        <Link
                          href="/tickets"
                          className="inline-flex items-center px-4 py-2 text-sm font-medium bg-blue-600 text-white"
                        >
                          Try Again
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 text-sm font-medium bg-gray-200 dark:bg-gray-700 text-black dark:text-white hover:bg-gray-300"
            onClick={() => (window.location.href = "/")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

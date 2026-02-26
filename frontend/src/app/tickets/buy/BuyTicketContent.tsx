"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchAPI } from "@/lib/api/api-config";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/useAuth";
import {
  TICKET_CATEGORY_DEEP_POPULATE,
  type EventInfo,
  type SessionInfo,
} from "@/lib/tickets/ticket-utils";

interface TicketCategory {
  id: number;
  documentId: string;
  name: string;
  description: Record<string, unknown>[];
  price: number;
  currency: string;
  validFrom: string;
  validUntil: string;
  maxPurchaseQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  grantsFullEventAccess?: boolean;
  allowedEvents?: EventInfo[];
  allowedSessions?: SessionInfo[];
}

interface Attendee {
  name: string;
  email: string;
  phone: string;
  organization: string;
}

interface FormData {
  quantity: number;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  attendees: Attendee[];
}

export default function BuyTicketContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("categoryId");
  const { user } = useAuth();

  const [ticketCategory, setTicketCategory] = useState<TicketCategory | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    quantity: 1,
    buyerName: "",
    buyerEmail: "",
    buyerPhone: "",
    attendees: [{ name: "", email: "", phone: "", organization: "" }],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (!categoryId) {
      setError("No ticket category selected");
      setLoading(false);
      return;
    }

    const fetchTicketCategory = async () => {
      try {
        const response = await fetchAPI(
          `/ticket-categories?filters[documentId][$eq]=${categoryId}&${TICKET_CATEGORY_DEEP_POPULATE}`
        );
        console.log("Ticket category response:", response);

        if (response && response.data && response.data.length > 0) {
          setTicketCategory(response.data[0]);
        } else {
          setError("Ticket category not found");
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching ticket category:", err);
        setError("Failed to load ticket details. Please try again later.");
        setLoading(false);
      }
    };

    fetchTicketCategory();
  }, [categoryId]);

  // Prefill form with logged-in user's info
  useEffect(() => {
    if (user) {
      const name = user.name || "";
      const email = user.email || "";
      setFormData((prev) => ({
        ...prev,
        buyerName: name,
        buyerEmail: email,
        attendees: prev.attendees.map((a, i) =>
          i === 0 ? { ...a, name, email } : a
        ),
      }));
    }
  }, [user]);

  // Helper function to format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Update quantity and attendees array when quantity changes
  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newQuantity = parseInt(e.target.value);

    // Update the attendees array to match the quantity
    let newAttendees = [...formData.attendees];

    if (newQuantity > formData.attendees.length) {
      // Add more attendee slots
      for (let i = formData.attendees.length; i < newQuantity; i++) {
        newAttendees.push({ name: "", email: "", phone: "", organization: "" });
      }
    } else if (newQuantity < formData.attendees.length) {
      // Remove excess attendee slots
      newAttendees = newAttendees.slice(0, newQuantity);
    }

    setFormData((prev) => ({
      ...prev,
      quantity: newQuantity,
      attendees: newAttendees,
    }));
  };

  // Update buyer information
  const handleBuyerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Prefill first attendee's information with buyer info
    if (
      name === "buyerName" ||
      name === "buyerEmail" ||
      name === "buyerPhone"
    ) {
      const attendeeField = name.replace("buyer", "").toLowerCase();
      const newAttendees = [...formData.attendees];

      if (newAttendees.length > 0) {
        newAttendees[0] = {
          ...newAttendees[0],
          [attendeeField]: value,
        };

        setFormData((prev) => ({
          ...prev,
          attendees: newAttendees,
        }));
      }
    }
  };

  // Update attendee information
  const handleAttendeeChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const newAttendees = [...formData.attendees];
    newAttendees[index] = {
      ...newAttendees[index],
      [name]: value,
    };

    setFormData((prev) => ({
      ...prev,
      attendees: newAttendees,
    }));
  };

  // Validate form data
  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Validate buyer information
    if (!formData.buyerName.trim()) {
      errors.buyerName = "Name is required";
    }

    if (!formData.buyerEmail.trim()) {
      errors.buyerEmail = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.buyerEmail)) {
      errors.buyerEmail = "Email is invalid";
    }

    // Validate attendees
    formData.attendees.forEach((attendee, index) => {
      if (!attendee.name.trim()) {
        errors[`attendee${index}Name`] = "Attendee name is required";
      }

      if (!attendee.email.trim()) {
        errors[`attendee${index}Email`] = "Attendee email is required";
      } else if (!/\S+@\S+\.\S+/.test(attendee.email)) {
        errors[`attendee${index}Email`] = "Attendee email is invalid";
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create a reference number for the purchase
      const referenceNumber = `TIX-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}`;

      // Calculate total amount
      const totalAmount = formData.quantity * (ticketCategory?.price || 0);

      // Save attendee data to localStorage for later ticket creation
      if (ticketCategory) {
        localStorage.setItem(
          `attendeeData_${referenceNumber}`,
          JSON.stringify({
            attendees: formData.attendees,
            quantity: formData.quantity,
            ticketCategoryId: ticketCategory.documentId,
            eventId: event?.documentId || null,
            sessionId: ticketCategory.grantsFullEventAccess ? null : (event?.sessions?.[0]?.documentId || ticketCategory?.allowedSessions?.[0]?.documentId || null),
            eventSlug: eventSlug || null,
            eventName: eventName || null,
            eventLocation: eventLocation || null,
            eventStartDate: event?.StartDate || null,
            eventEndDate: event?.EndDate || null,
          })
        );
      }

      console.log("Creating purchase with data:", {
        referenceNumber,
        totalAmount,
        currency: ticketCategory?.currency || "UGX",
        paymentStatus: "pending",
        purchaseDate: new Date().toISOString(),
        buyerName: formData.buyerName,
        buyerEmail: formData.buyerEmail,
        buyerPhone: formData.buyerPhone,
      });

      // Create ticket purchase in Strapi
      const purchaseResponse = await fetchAPI("/ticket-purchases", {
        method: "POST",
        body: JSON.stringify({
          data: {
            referenceNumber,
            totalAmount,
            currency: ticketCategory?.currency || "UGX",
            paymentStatus: "pending",
            purchaseDate: new Date().toISOString(),
            buyerName: formData.buyerName,
            buyerEmail: formData.buyerEmail,
            buyerPhone: formData.buyerPhone,
          },
        }),
      });

      console.log("Purchase created:", purchaseResponse);

      if (purchaseResponse && purchaseResponse.data) {
        // Special handling for free tickets
        if (totalAmount <= 0) {
          console.log("Processing free ticket...");

          // Generate a transaction ID for the free ticket
          const freeTransactionId = `FREE-${Date.now()}`;

          // Get Strapi URL
          let STRAPI_URL = process.env.NEXT_PUBLIC_API_URL;
          if (STRAPI_URL && STRAPI_URL.includes("localhost")) {
            STRAPI_URL = STRAPI_URL.replace("localhost", "127.0.0.1");
          }

          // Update purchase status directly
          try {
            const updateUrl = `${STRAPI_URL}/api/ticket-purchases/by-reference/${referenceNumber}`;
            console.log("Updating free ticket purchase at:", updateUrl);

            const updateResponse = await fetch(updateUrl, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                data: {
                  paymentStatus: "paid",
                  paymentMethod: "Free Ticket",
                  transactionId: freeTransactionId,
                },
              }),
            });

            if (!updateResponse.ok) {
              console.error(
                "Failed to update purchase:",
                await updateResponse.text()
              );
              throw new Error("Failed to update purchase status");
            }

            console.log("Free ticket purchase updated successfully");

            // Redirect to confirmation page
            router.push(
              `/tickets/confirmation?OrderTrackingId=${freeTransactionId}&OrderMerchantReference=${referenceNumber}&OrderNotificationType=COMPLETED`
            );
          } catch (updateError) {
            console.error("Error updating free ticket status:", updateError);
            throw new Error("Failed to process free ticket. Please try again.");
          }
        } else {
          // Normal flow for paid tickets
          console.log("Initiating payment with Pesapal...");
          const paymentResponse = await fetch("/api/tickets/initiate-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              referenceNumber,
              amount: totalAmount,
              currency: ticketCategory?.currency || "UGX",
              description: `${eventName} - ${ticketCategory?.name}`,
              buyerName: formData.buyerName,
              buyerEmail: formData.buyerEmail,
              buyerPhone: formData.buyerPhone || "",
            }),
          });

          const paymentData = await paymentResponse.json();
          console.log("Payment initiation response:", paymentData);

          if (paymentData.success && paymentData.redirectUrl) {
            // Redirect to Pesapal payment page
            window.location.href = paymentData.redirectUrl;
          } else {
            throw new Error(
              paymentData.message || "Failed to initiate payment"
            );
          }
        }
      } else {
        throw new Error("Failed to create purchase record");
      }
    } catch (err: unknown) {
      console.error("Error in payment process:", err);
      setError(`Payment process failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total price
  const totalPrice = formData.quantity * (ticketCategory?.price || 0);

  // Derive event info from the ticket category
  const event = ticketCategory?.allowedEvents?.[0];
  const eventSlug = event?.Slug;
  const eventName = event?.Title ?? "Event";
  const eventLocation = event?.venue
    ? `${event.venue.Name}, ${event.venue.City}, ${event.venue.Country}`
    : (event?.Location ?? "");
  const cancelUrl = eventSlug ? `/events/${eventSlug}/tickets` : "/tickets";

  // Generate quantity options up to maxPurchaseQuantity
  const quantityOptions = () => {
    const options = [];
    const max = ticketCategory?.maxPurchaseQuantity || 10;

    for (let i = 1; i <= max; i++) {
      options.push(
        <option key={i} value={i}>
          {i}
        </option>
      );
    }

    return options;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin border-2 border-solid border-yellow-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Loading ticket details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !ticketCategory) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center max-w-md px-4">
          <div className="bg-black dark:bg-white p-4 mb-4 inline-block">
            <svg
              className="w-8 h-8 text-yellow-500"
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
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Error
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {error || "Failed to load ticket details"}
          </p>
          <Button variant="primary" href="/tickets">
            Back to Tickets
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-6 px-4 sm:py-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm">
          {/* Title */}
          <div className="p-6 bg-blue-600">
            <h1 className="text-2xl font-bold text-white">
              {ticketCategory.name}
            </h1>
            {event?.Title && (
              <p className="text-sm mt-1 text-blue-100">
                {event.Title}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Left column - Ticket and Buyer Information */}
              <div className="p-6 lg:pr-8 lg:border-r lg:border-gray-200 lg:dark:border-gray-600">
                {/* Ticket info */}
                <div className="flex flex-wrap justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                      {ticketCategory.name}
                    </h3>
                    <p className="text-yellow-500 font-bold mt-1">
                      {formatCurrency(
                        ticketCategory.price,
                        ticketCategory.currency
                      )}{" "}
                      / ticket
                    </p>
                  </div>

                  <div className="flex items-end gap-4 mt-4 sm:mt-0">
                    <div>
                      <label
                        htmlFor="quantity"
                        className="block font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Quantity
                      </label>
                      <select
                        id="quantity"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleQuantityChange}
                        className="w-20 py-2 px-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:border-yellow-500"
                      >
                        {quantityOptions()}
                      </select>
                    </div>

                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Total
                      </p>
                      <p className="text-xl font-bold text-yellow-500">
                        {formatCurrency(totalPrice, ticketCategory.currency)}
                      </p>
                    </div>
                  </div>
                </div>

                <hr className="my-6 border-gray-200 dark:border-gray-600" />

                {/* Buyer Information */}
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Buyer Information
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="buyerName"
                      className="block font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Full Name<span className="text-yellow-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="buyerName"
                      name="buyerName"
                      value={formData.buyerName}
                      onChange={handleBuyerChange}
                      className={`block w-full p-3 bg-white dark:bg-gray-800 border ${
                        validationErrors.buyerName
                          ? "border-red-500"
                          : "border-gray-200 dark:border-gray-600 focus:border-yellow-500"
                      } text-gray-900 dark:text-white`}
                    />
                    {validationErrors.buyerName && (
                      <p className="mt-1 text-red-500">
                        {validationErrors.buyerName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="buyerEmail"
                      className="block font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Email<span className="text-yellow-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="buyerEmail"
                      name="buyerEmail"
                      value={formData.buyerEmail}
                      onChange={handleBuyerChange}
                      className={`block w-full p-3 bg-white dark:bg-gray-800 border ${
                        validationErrors.buyerEmail
                          ? "border-red-500"
                          : "border-gray-200 dark:border-gray-600 focus:border-yellow-500"
                      } text-gray-900 dark:text-white`}
                    />
                    {validationErrors.buyerEmail && (
                      <p className="mt-1 text-red-500">
                        {validationErrors.buyerEmail}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="buyerPhone"
                      className="block font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="buyerPhone"
                      name="buyerPhone"
                      value={formData.buyerPhone}
                      onChange={handleBuyerChange}
                      className="block w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 focus:border-yellow-500 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Right column - Attendee Information */}
              <div className="p-6 lg:pl-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Attendee Information
                </h2>

                {formData.attendees.map((attendee, index) => (
                  <div key={index}>
                    {index > 0 && (
                      <hr className="my-6 border-gray-200 dark:border-gray-600" />
                    )}

                    <div className="mb-4">
                      <div className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black inline-block">
                        <h3 className="font-bold">Attendee {index + 1}</h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label
                          htmlFor={`attendee${index}Name`}
                          className="block font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          Full Name<span className="text-yellow-500">*</span>
                        </label>
                        <input
                          type="text"
                          id={`attendee${index}Name`}
                          name="name"
                          value={attendee.name}
                          onChange={(e) => handleAttendeeChange(index, e)}
                          className={`block w-full p-3 bg-white dark:bg-gray-800 border ${
                            validationErrors[`attendee${index}Name`]
                              ? "border-red-500"
                              : "border-gray-200 dark:border-gray-600 focus:border-yellow-500"
                          } text-gray-900 dark:text-white`}
                        />
                        {validationErrors[`attendee${index}Name`] && (
                          <p className="mt-1 text-red-500">
                            {validationErrors[`attendee${index}Name`]}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor={`attendee${index}Email`}
                          className="block font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          Email<span className="text-yellow-500">*</span>
                        </label>
                        <input
                          type="email"
                          id={`attendee${index}Email`}
                          name="email"
                          value={attendee.email}
                          onChange={(e) => handleAttendeeChange(index, e)}
                          className={`block w-full p-3 bg-white dark:bg-gray-800 border ${
                            validationErrors[`attendee${index}Email`]
                              ? "border-red-500"
                              : "border-gray-200 dark:border-gray-600 focus:border-yellow-500"
                          } text-gray-900 dark:text-white`}
                        />
                        {validationErrors[`attendee${index}Email`] && (
                          <p className="mt-1 text-red-500">
                            {validationErrors[`attendee${index}Email`]}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor={`attendee${index}Phone`}
                          className="block font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id={`attendee${index}Phone`}
                          name="phone"
                          value={attendee.phone}
                          onChange={(e) => handleAttendeeChange(index, e)}
                          className="block w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 focus:border-yellow-500 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`attendee${index}Organization`}
                          className="block font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          Organization
                        </label>
                        <input
                          type="text"
                          id={`attendee${index}Organization`}
                          name="organization"
                          value={attendee.organization}
                          onChange={(e) => handleAttendeeChange(index, e)}
                          className="block w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 focus:border-yellow-500 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sticky payment actions for mobile */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600 px-4 py-3 z-10 flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Total
                </div>
                <div className="text-lg font-bold text-yellow-500">
                  {formatCurrency(totalPrice, ticketCategory.currency)}
                </div>
              </div>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-black"
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
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  totalPrice <= 0 ? "Proceed" : "Pay Now"
                )}
              </Button>
            </div>

            {/* Desktop payment actions */}
            <div className="hidden sm:flex justify-between items-center mt-10 pt-6">
              <Button
                variant="dark"
                buttonType="outline"
                onClick={() => (window.location.href = cancelUrl)}
                className="dark:border-white dark:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="min-w-[200px]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
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
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  totalPrice <= 0 ? "Proceed" : "Proceed to Payment"
                )}
              </Button>
            </div>
            <div className="h-16 sm:hidden">
              {/* Space to prevent content being hidden behind the sticky bottom bar on mobile */}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

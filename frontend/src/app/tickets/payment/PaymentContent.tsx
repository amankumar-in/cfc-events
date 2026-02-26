"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { fetchAPI } from "@/lib/api/api-config";

interface TicketPurchase {
  id: number;
  documentId: string;
  referenceNumber: string;
  totalAmount: number;
  currency: string;
  paymentStatus: string;
  paymentMethod: string | null;
  transactionId: string | null;
  purchaseDate: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string | null;
}

export default function PaymentContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");

  const [purchase, setPurchase] = useState<TicketPurchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pesapalLoading, setPesapalLoading] = useState(false);
  const [pesapalError, setPesapalError] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) {
      setError("No purchase reference provided");
      setLoading(false);
      return;
    }

    const fetchPurchase = async () => {
      try {
        // Using reference number to fetch the purchase
        const response = await fetchAPI(
          `/ticket-purchases?filters[referenceNumber][$eq]=${reference}`
        );
        console.log("Purchase response:", response);

        if (response && response.data && response.data.length > 0) {
          setPurchase(response.data[0]);
        } else {
          setError("Purchase not found");
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching purchase:", err);
        setError("Failed to load purchase details. Please try again later.");
        setLoading(false);
      }
    };

    fetchPurchase();
  }, [reference]);

  // Helper function to format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Initiate payment with Pesapal
  const initiatePayment = async () => {
    if (!purchase) return;

    setPesapalLoading(true);
    setPesapalError(null);

    try {
      // Call our API route that will handle the Pesapal integration
      const response = await fetch("/api/tickets/initiate-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          referenceNumber: purchase.referenceNumber,
          amount: purchase.totalAmount,
          currency: purchase.currency,
          description: `Ticket purchase for CFC Events`,
          buyerName: purchase.buyerName,
          buyerEmail: purchase.buyerEmail,
          buyerPhone: purchase.buyerPhone || "",
        }),
      });

      const data = await response.json();

      if (data.success && data.redirectUrl) {
        // Redirect to Pesapal payment page
        window.location.href = data.redirectUrl;
      } else {
        setPesapalError(data.message || "Failed to initiate payment");
      }
    } catch (err) {
      console.error("Error initiating payment:", err);
      setPesapalError("Payment initiation failed. Please try again.");
    } finally {
      setPesapalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading purchase details...</p>
        </div>
      </div>
    );
  }

  if (error || !purchase) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center max-w-md px-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-3">
            <svg
              className="w-6 h-6 text-red-600"
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">
            {error || "Failed to load purchase details"}
          </p>
          <Link
            href="/tickets"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
          >
            Back to Tickets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link
            href="/tickets"
            className="text-green-600 hover:text-green-700 inline-flex items-center text-sm font-medium"
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

        {/* Payment Section */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h1 className="text-lg font-medium text-gray-900">
              Complete Your Payment
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Reference: {purchase.referenceNumber}
            </p>
          </div>

          <div className="px-4 py-5 sm:p-6">
            {/* Order Summary */}
            <div className="mb-8 pb-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Order Summary
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Purchase Date:</span>
                  <span className="font-medium">
                    {new Date(purchase.purchaseDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Buyer:</span>
                  <span className="font-medium">{purchase.buyerName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{purchase.buyerEmail}</span>
                </div>
                {purchase.buyerPhone && (
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{purchase.buyerPhone}</span>
                  </div>
                )}
                <div className="flex justify-between py-3 mt-2">
                  <span className="text-gray-800 font-medium">
                    Total Amount:
                  </span>
                  <span className="text-xl font-bold text-green-600">
                    {formatCurrency(purchase.totalAmount, purchase.currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Payment Status
              </h2>
              <div className="flex items-center bg-yellow-50 p-4 rounded-lg">
                <svg
                  className="h-6 w-6 text-yellow-600 mr-3"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-medium text-yellow-800">
                  Your order is pending payment
                </span>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Payment Methods
              </h2>
              <p className="text-gray-600 mb-4">
                Click the button below to proceed to our secure payment gateway
                where you can complete your purchase using various payment
                methods including mobile money, credit/debit cards, and bank
                transfers.
              </p>

              {pesapalError && (
                <div className="bg-red-50 p-4 rounded-lg mb-4">
                  <div className="flex">
                    <svg
                      className="h-5 w-5 text-red-400 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-red-700">{pesapalError}</span>
                  </div>
                </div>
              )}

              <button
                onClick={initiatePayment}
                disabled={pesapalLoading}
                className={`w-full flex justify-center items-center px-6 py-4 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                  pesapalLoading ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {pesapalLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                  </>
                ) : (
                  <>
                    <svg
                      className="h-5 w-5 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Pay Now -{" "}
                    {formatCurrency(purchase.totalAmount, purchase.currency)}
                  </>
                )}
              </button>
            </div>

            {/* Secure Payment Note */}
            <div className="mt-8 text-center">
              <div className="flex justify-center mb-2">
                <svg
                  className="h-5 w-5 text-green-600 mr-1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium text-green-600">
                  Secure Payment
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Your payment information is processed securely. We do not store
                credit card details nor have access to your payment information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

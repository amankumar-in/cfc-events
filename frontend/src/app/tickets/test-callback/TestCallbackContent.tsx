"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function TestCallbackContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  // Extract parameters from URL
  const orderTrackingId = searchParams.get("OrderTrackingId");
  const orderMerchantReference = searchParams.get("OrderMerchantReference");
  const orderNotificationType = searchParams.get("OrderNotificationType");

  useEffect(() => {
    // Log the callback parameters
    console.log("Pesapal callback received:", {
      orderTrackingId,
      orderMerchantReference,
      orderNotificationType,
    });

    const checkTransactionStatus = async () => {
      if (!orderTrackingId) {
        setLoading(false);
        return;
      }

      try {
        // Call transaction status API
        const response = await fetch(
          `/api/tickets/transaction-status?orderTrackingId=${orderTrackingId}`
        );
        const data = await response.json();
        setStatus(data);
      } catch (error) {
        console.error("Error checking transaction status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkTransactionStatus();
  }, [orderTrackingId, orderMerchantReference, orderNotificationType]);

  if (loading) {
    return <div>Checking payment status...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Payment Information</h2>

      <div className="mb-4">
        <p>Order Tracking ID: {orderTrackingId || "Not provided"}</p>
        <p>Reference Number: {orderMerchantReference || "Not provided"}</p>
        <p>Notification Type: {orderNotificationType || "Not provided"}</p>
      </div>

      {status ? (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Transaction Status:</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(status, null, 2)}
          </pre>
        </div>
      ) : (
        <div className="text-yellow-600">No transaction status available.</div>
      )}

      <div className="mt-6">
        <Link
          href="/tickets"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Back to Tickets
        </Link>
      </div>
    </div>
  );
}

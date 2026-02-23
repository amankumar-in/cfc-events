import { NextRequest, NextResponse } from "next/server";

// Pesapal API URLs - using production by default
const PESAPAL_BASE_URL = "https://pay.pesapal.com/v3";
// For sandbox/testing, use:
// const PESAPAL_BASE_URL = "https://cybqa.pesapal.com/pesapalv3";

const PESAPAL_TRANSACTION_STATUS_URL = `${PESAPAL_BASE_URL}/api/Transactions/GetTransactionStatus`;
// =====================================

// ========================================
/**
 * Handles checking transaction status from Pesapal
 */
export async function GET(request: NextRequest) {
  try {
    console.log("==== TRANSACTION STATUS CHECK START ====");

    // Extract host information
    const host = request.headers.get("host") || "";
    const isLocalhost =
      host.includes("localhost") || host.includes("127.0.0.1");

    // Properly determine the base URL for API calls
    // Critical fix: Don't use request.nextUrl.origin as it may be incorrect in production
    // Use http for localhost, https for production
    const protocol = isLocalhost ? "http" : "https";
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;

    console.log("Environment info:", {
      nodeVersion: process.version,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
      host: host,
      detectedBaseUrl: baseUrl,
      requestUrl: request.url,
      isLocalhost: isLocalhost,
    });

    // Get the orderTrackingId from the query parameters
    const searchParams = request.nextUrl.searchParams;
    const orderTrackingId = searchParams.get("orderTrackingId");

    // Validate that orderTrackingId is provided
    if (!orderTrackingId) {
      console.log("Missing orderTrackingId parameter");
      return NextResponse.json(
        {
          success: false,
          message: "Missing orderTrackingId parameter",
        },
        { status: 400 }
      );
    }
    // ======
    // Special handling for free tickets
    if (orderTrackingId.startsWith("FREE-")) {
      console.log("Processing free ticket transaction:", orderTrackingId);

      // Extract reference number from query parameters - check both cases
      const orderMerchantReference =
        searchParams.get("OrderMerchantReference") ||
        searchParams.get("orderMerchantReference");

      console.log("Free ticket merchant reference:", orderMerchantReference);

      // Return mock successful transaction data for free tickets
      return NextResponse.json({
        success: true,
        paymentMethod: "Free Ticket",
        amount: 0,
        createdDate: new Date().toISOString(),
        confirmationCode: orderTrackingId,
        paymentStatus: "Completed",
        statusCode: 1,
        description: "Free ticket processed successfully",
        paymentAccount: "",
        merchantReference: orderMerchantReference,
        currency: "UGX",
        message: "Free ticket transaction completed successfully",
      });
    }
    // ========================
    console.log("Checking transaction status for:", orderTrackingId);

    // Auth URL for token retrieval - using the correct base URL
    const authUrl = `${baseUrl}/api/tickets/pesapal-auth`;
    console.log("Auth URL:", authUrl);

    // First, get authentication token
    console.log("Attempting to fetch auth token...");
    let authResponse;
    try {
      authResponse = await fetch(authUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Auth response status:", authResponse.status);
      console.log("Auth response OK:", authResponse.ok);
    } catch (authError: unknown) {
      const err = authError as Record<string, unknown>;
      console.error("Error fetching auth token:", {
        message: (err as Error).message,
        cause: err.cause
          ? JSON.stringify(err.cause)
          : "No cause provided",
        stack: (err as Error).stack,
      });
      throw new Error(`Auth request failed: ${(err as Error).message}`);
    }

    const authData = await authResponse.json();
    console.log("Auth data received:", {
      success: authData.success,
      tokenReceived: !!authData.token,
      expiryDate: authData.expiryDate || "Not provided",
    });

    if (!authData.success || !authData.token) {
      console.error("Failed to authenticate with Pesapal:", authData);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to authenticate with payment provider",
          error: authData.error || authData.message || "Authentication failed",
        },
        { status: 500 }
      );
    }

    // Now call Pesapal's GetTransactionStatus API
    const statusUrl = `${PESAPAL_TRANSACTION_STATUS_URL}?orderTrackingId=${orderTrackingId}`;
    console.log("Calling Pesapal Transaction Status API:", statusUrl);
    console.log("Auth token length:", authData.token.length);
    console.log("Auth token prefix:", authData.token.substring(0, 20) + "...");

    // Using the same pattern as in the working file
    let statusResponse;
    try {
      statusResponse = await fetch(statusUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${authData.token}`,
        },
      });
      console.log("Status response status:", statusResponse.status);
      console.log("Status response OK:", statusResponse.ok);
    } catch (statusError: unknown) {
      const err = statusError as Record<string, unknown>;
      console.error("Pesapal status request failed:", {
        message: (err as Error).message,
        cause: err.cause
          ? JSON.stringify(err.cause)
          : "No cause provided",
        code: err.code || "No error code",
        stack: (err as Error).stack,
      });

      if (err.cause) {
        const cause = err.cause as Record<string, unknown>;
        console.error("Error cause details:", {
          name: cause.name,
          code: cause.code,
          library: cause.library,
          reason: cause.reason,
        });
      }

      throw new Error(`Pesapal status request failed: ${(err as Error).message}`);
    }

    const statusData = await statusResponse.json();
    console.log("Pesapal transaction status response:", statusData);

    if (statusData.status === "200") {
      // Successfully retrieved transaction status
      console.log("Transaction status retrieved successfully");
      console.log("Payment status:", statusData.payment_status_description);
      console.log("==== TRANSACTION STATUS CHECK COMPLETED SUCCESSFULLY ====");

      return NextResponse.json({
        success: true,
        paymentMethod: statusData.payment_method,
        amount: statusData.amount,
        createdDate: statusData.created_date,
        confirmationCode: statusData.confirmation_code,
        paymentStatus: statusData.payment_status_description,
        statusCode: statusData.status_code,
        description: statusData.description,
        paymentAccount: statusData.payment_account,
        merchantReference: statusData.merchant_reference,
        currency: statusData.currency,
        message: statusData.message,
      });
    } else {
      // Failed to get transaction status
      console.error("Failed to retrieve transaction status:", statusData);
      console.log("==== TRANSACTION STATUS CHECK FAILED ====");

      return NextResponse.json(
        {
          success: false,
          message: "Failed to retrieve transaction status",
          error: statusData.error || "Unknown error from Pesapal",
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    // Handle any unexpected errors
    console.error("Error checking transaction status:", error);
    console.log("Error stack:", (error as Error).stack);
    console.log("==== TRANSACTION STATUS CHECK FAILED WITH EXCEPTION ====");

    return NextResponse.json(
      {
        success: false,
        message: `Failed to check transaction status: ${
          (error as Error).message || "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}

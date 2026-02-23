import { NextRequest, NextResponse } from "next/server";

// Pesapal API URLs - using production by default
const PESAPAL_BASE_URL = "https://pay.pesapal.com/v3";
// For sandbox/testing, use:
// const PESAPAL_BASE_URL = "https://cybqa.pesapal.com/pesapalv3";

const PESAPAL_AUTH_URL = `${PESAPAL_BASE_URL}/api/Auth/RequestToken`;
const PESAPAL_SUBMIT_ORDER_URL = `${PESAPAL_BASE_URL}/api/Transactions/SubmitOrderRequest`;

/**
 * Handles initiating a payment with Pesapal API 3.0
 */
export async function POST(request: NextRequest) {
  try {
    console.log("==== PAYMENT INITIATION START ====");
    console.log("Environment info:", {
      nodeVersion: process.version,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
      ipnIdSet: !!process.env.PESAPAL_IPN_ID,
      consumerKeySet: !!process.env.PESAPAL_CONSUMER_KEY,
      host: request.headers.get("host"),
      requestUrl: request.url,
    });

    // Extract the payment details from the request body
    const body = await request.json();
    const {
      referenceNumber,
      amount,
      currency,
      description,
      buyerName,
      buyerEmail,
      buyerPhone,
    } = body;

    // Validate required fields
    if (!referenceNumber || !amount || !currency || !description) {
      console.log("Missing required fields:", {
        referenceNumber,
        amount,
        currency,
        description,
      });
      return NextResponse.json(
        {
          success: false,
          message: "Missing required payment details",
        },
        { status: 400 }
      );
    }

    if (!buyerEmail && !buyerPhone) {
      console.log("Missing contact details:", { buyerEmail, buyerPhone });
      return NextResponse.json(
        {
          success: false,
          message: "Either email or phone number is required",
        },
        { status: 400 }
      );
    }

    console.log("Initiating payment with details:", {
      referenceNumber,
      amount,
      currency,
      description,
      buyerName: buyerName || "Not provided",
      buyerEmail: buyerEmail || "Not provided",
      buyerPhone: buyerPhone || "Not provided",
    });

    // Get Pesapal credentials from environment variables
    const PESAPAL_CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY;
    const PESAPAL_CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET;
    const PESAPAL_IPN_ID = process.env.PESAPAL_IPN_ID;

    if (!PESAPAL_CONSUMER_KEY || !PESAPAL_CONSUMER_SECRET) {
      console.error("Pesapal credentials not found in environment variables");
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment system not properly configured (missing credentials)",
        },
        { status: 500 }
      );
    }

    if (!PESAPAL_IPN_ID) {
      console.error("Pesapal IPN ID not found in environment variables");
      return NextResponse.json(
        {
          success: false,
          message: "Payment system not properly configured (missing IPN ID)",
        },
        { status: 500 }
      );
    }

    // Get the base URL for callbacks
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
    console.log("Base URL for callbacks:", baseUrl);

    // Get authentication token directly (without using internal API)
    console.log(
      "Getting authentication token directly from Pesapal:",
      PESAPAL_AUTH_URL
    );
    let authResponse;
    try {
      authResponse = await fetch(PESAPAL_AUTH_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          consumer_key: PESAPAL_CONSUMER_KEY,
          consumer_secret: PESAPAL_CONSUMER_SECRET,
        }),
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
      throw new Error(`Direct auth request failed: ${(err as Error).message}`);
    }

    const authData = await authResponse.json();
    console.log("Auth data received:", {
      status: authData.status,
      tokenReceived: !!authData.token,
      expiryDate: authData.expiryDate || "Not provided",
    });

    if (authData.error || !authData.token || authData.status !== "200") {
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

    // Split name into first and last name for billing address
    const nameParts = buyerName ? buyerName.split(" ") : ["", ""];
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Prepare the order request payload for Pesapal
    const orderRequestPayload = {
      id: referenceNumber,
      currency,
      amount: parseFloat(amount),
      description,
      callback_url: `${baseUrl}/tickets/confirmation`,
      notification_id: PESAPAL_IPN_ID,
      billing_address: {
        email_address: buyerEmail || "",
        phone_number: buyerPhone || "",
        country_code: "UG", // Default to Uganda
        first_name: firstName,
        middle_name: "",
        last_name: lastName,
        line_1: "",
        line_2: "",
        city: "",
        state: "",
        postal_code: "",
        zip_code: "",
      },
    };

    console.log("Submitting order to Pesapal URL:", PESAPAL_SUBMIT_ORDER_URL);
    console.log("Order payload:", JSON.stringify(orderRequestPayload));
    console.log("Auth token length:", authData.token.length);
    console.log("Auth token prefix:", authData.token.substring(0, 20) + "...");

    // Submit the order to Pesapal
    console.log("Sending request to Pesapal...");
    let orderResponse;
    try {
      orderResponse = await fetch(PESAPAL_SUBMIT_ORDER_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${authData.token}`,
        },
        body: JSON.stringify(orderRequestPayload),
      });
      console.log("Order submission response status:", orderResponse.status);
      console.log("Order submission response OK:", orderResponse.ok);
    } catch (pesapalError: unknown) {
      const err = pesapalError as Record<string, unknown>;
      console.error("Pesapal API request failed:", {
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

      throw new Error(`Pesapal API request failed: ${(err as Error).message}`);
    }

    const orderData = await orderResponse.json();
    console.log("Pesapal order submission response:", orderData);

    if (orderData.status === "200" && orderData.redirect_url) {
      // Successfully created order request
      console.log(
        "Order successfully created with tracking ID:",
        orderData.order_tracking_id
      );
      console.log("Redirect URL:", orderData.redirect_url);
      console.log("==== PAYMENT INITIATION COMPLETED SUCCESSFULLY ====");

      return NextResponse.json({
        success: true,
        orderTrackingId: orderData.order_tracking_id,
        merchantReference: orderData.merchant_reference,
        redirectUrl: orderData.redirect_url,
      });
    } else {
      // Failed to create order request
      console.error("Failed to create order request:", orderData);
      console.log("==== PAYMENT INITIATION FAILED ====");

      return NextResponse.json(
        {
          success: false,
          message: "Failed to create payment request",
          error: orderData.error || "Unknown error from payment provider",
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    // Handle any unexpected errors
    console.error("Error initiating payment:", error);
    console.log("Error stack:", (error as Error).stack);
    console.log("==== PAYMENT INITIATION FAILED WITH EXCEPTION ====");

    return NextResponse.json(
      {
        success: false,
        message: `Failed to initiate payment: ${
          (error as Error).message || "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}

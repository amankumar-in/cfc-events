import { NextRequest, NextResponse } from "next/server";

// Pesapal API URLs - using production by default
const PESAPAL_BASE_URL = "https://pay.pesapal.com/v3";
// For sandbox/testing, use:
// const PESAPAL_BASE_URL = "https://cybqa.pesapal.com/pesapalv3";

const PESAPAL_AUTH_URL = `${PESAPAL_BASE_URL}/api/Auth/RequestToken`;
const PESAPAL_SUBMIT_ORDER_URL = `${PESAPAL_BASE_URL}/api/Transactions/SubmitOrderRequest`;

// Default IPN ID - if you have a fixed IPN ID, you can set it here
// Otherwise, we'll need to pass it with each request
const DEFAULT_IPN_ID =
  process.env.PESAPAL_IPN_ID || "a91c3b5a-8c81-4bf0-8911-dbef00943908";

/**
 * Handles submitting an order to Pesapal for payment processing
 */
export async function POST(request: NextRequest) {
  try {
    // Get request body
    const body = await request.json();

    // Extract order details
    const {
      reference, // Unique order reference from your system
      amount, // Payment amount
      currency = "UGX", // Currency code (default UGX)
      description, // Order description
      callbackUrl, // URL to redirect after payment
      cancellationUrl, // URL to redirect on cancellation (optional)
      notificationId, // IPN ID (optional, will use default if not provided)
      customerName, // Customer name
      customerEmail, // Customer email
      customerPhone, // Customer phone
      customerCountry = "UG", // Customer country code (default UG)
      branchName, // Branch name (optional)
      redirectMode = "TOP_WINDOW", // TOP_WINDOW or PARENT_WINDOW
    } = body;

    // Validate required fields
    if (
      !reference ||
      !amount ||
      !description ||
      !callbackUrl ||
      !customerName ||
      !(customerEmail || customerPhone)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
        },
        { status: 400 }
      );
    }

    // Split customer name into first and last name
    const nameParts = customerName.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "-";

    // Get authentication token
    const authToken = await getAuthToken();
    if (!authToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to authenticate with Pesapal",
        },
        { status: 401 }
      );
    }

    // Prepare order submission payload
    const orderPayload = {
      id: reference,
      currency: currency,
      amount: parseFloat(amount.toString()),
      description: description,
      callback_url: callbackUrl,
      notification_id: notificationId || DEFAULT_IPN_ID,
      redirect_mode: redirectMode,
      branch: branchName || undefined,
      cancellation_url: cancellationUrl || undefined,
      billing_address: {
        email_address: customerEmail || undefined,
        phone_number: customerPhone || undefined,
        country_code: customerCountry,
        first_name: firstName,
        last_name: lastName,
      },
    };

    console.log("Submitting order to Pesapal:", orderPayload);

    // Submit order to Pesapal
    const response = await fetch(PESAPAL_SUBMIT_ORDER_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(orderPayload),
    });

    // Get response
    const responseData = await response.json();
    console.log("Pesapal order submission response:", responseData);

    // Check if submission was successful
    if (responseData.status === "200" && responseData.redirect_url) {
      return NextResponse.json({
        success: true,
        orderTrackingId: responseData.order_tracking_id,
        merchantReference: responseData.merchant_reference,
        redirectUrl: responseData.redirect_url,
      });
    } else {
      // Order submission failed
      return NextResponse.json(
        {
          success: false,
          message: "Failed to submit order to Pesapal",
          error: responseData.error || responseData.message || "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error("Error submitting order to Pesapal:", error);
    return NextResponse.json(
      {
        success: false,
        message: `Failed to submit order: ${(error as Error).message || "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}

/**
 * Helper function to get authentication token from Pesapal
 */
async function getAuthToken(): Promise<string | null> {
  try {
    // Get consumer key and secret from environment variables
    const PESAPAL_CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY;
    const PESAPAL_CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET;

    // Verify credentials are available
    if (!PESAPAL_CONSUMER_KEY || !PESAPAL_CONSUMER_SECRET) {
      console.error("Pesapal credentials not found in environment variables");
      return null;
    }

    // Authenticate with Pesapal
    const response = await fetch(PESAPAL_AUTH_URL, {
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

    const data = await response.json();

    // Check if authentication was successful
    if (data.token && data.status === "200") {
      return data.token;
    } else {
      console.error("Pesapal authentication failed:", data);
      return null;
    }
  } catch (error) {
    console.error("Error getting Pesapal auth token:", error);
    return null;
  }
}

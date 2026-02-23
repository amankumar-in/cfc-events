import { NextRequest, NextResponse } from "next/server";

// Pesapal API URLs - using production by default
const PESAPAL_BASE_URL = "https://pay.pesapal.com/v3";
// For sandbox/testing, use:
// const PESAPAL_BASE_URL = "https://cybqa.pesapal.com/pesapalv3";

const PESAPAL_REGISTER_IPN_URL = `${PESAPAL_BASE_URL}/api/URLSetup/RegisterIPN`;

/**
 * Registers an IPN URL with Pesapal
 * IPN (Instant Payment Notification) is used to receive payment status updates
 */
export async function POST(request: NextRequest) {
  try {
    // First, authenticate with Pesapal to get a token
    const PESAPAL_CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY;
    const PESAPAL_CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET;

    // Verify credentials are available
    if (!PESAPAL_CONSUMER_KEY || !PESAPAL_CONSUMER_SECRET) {
      console.error("Pesapal credentials not found in environment variables");
      return NextResponse.json(
        {
          success: false,
          message: "Pesapal API credentials not configured",
        },
        { status: 500 }
      );
    }

    // Authenticate directly with Pesapal
    const authResponse = await fetch(
      `${PESAPAL_BASE_URL}/api/Auth/RequestToken`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          consumer_key: PESAPAL_CONSUMER_KEY,
          consumer_secret: PESAPAL_CONSUMER_SECRET,
        }),
      }
    );

    const authData = await authResponse.json();

    // Check if authentication was successful
    if (!authData.token) {
      console.error("Failed to authenticate with Pesapal:", authData);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to authenticate with Pesapal",
          error: authData.error || authData.message || "Authentication failed",
        },
        { status: 401 }
      );
    }

    // Get the token
    const token = authData.token;

    // Get notification URL from request body or use default
    let url;
    let ipnNotificationType = "GET"; // Default to GET

    // Get the request body (if any)
    let body;
    try {
      body = await request.json();
    } catch (e) {
      // No JSON body or parsing error
      console.log("No request body or invalid JSON:", e);
      body = {};
    }

    // Get URL from body or use default
    url = body.url;
    ipnNotificationType = body.ipn_notification_type || "GET";

    // If no URL provided, use the default one
    if (!url) {
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      url = `${baseUrl}/api/tickets/ipn-notification`;
      console.log("Using default IPN URL:", url);
    }

    // Verify the URL is valid
    if (!url) {
      return NextResponse.json(
        {
          success: false,
          message: "IPN URL is required",
        },
        { status: 400 }
      );
    }

    // Prepare IPN registration request to Pesapal
    const response = await fetch(PESAPAL_REGISTER_IPN_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        url: url,
        ipn_notification_type: ipnNotificationType,
      }),
    });

    // Get the response data
    const data = await response.json();

    // Log the complete response for debugging
    console.log("Pesapal IPN registration response:", data);

    // Check if registration was successful
    if (data.ipn_id && data.status === "200") {
      return NextResponse.json({
        success: true,
        ipn_id: data.ipn_id,
        url: data.url,
        notificationType: data.ipn_notification_type_description,
        status: data.ipn_status_description,
        createdDate: data.created_date,
      });
    } else {
      // Registration failed
      console.error("Pesapal IPN registration failed:", data);
      return NextResponse.json(
        {
          success: false,
          message: "IPN registration with Pesapal failed",
          error: data.error || data.message || "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    // Handle any unexpected errors
    console.error("Error in Pesapal IPN registration:", error);
    return NextResponse.json(
      {
        success: false,
        message: `Failed to register IPN with Pesapal: ${
          (error as Error).message || "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}

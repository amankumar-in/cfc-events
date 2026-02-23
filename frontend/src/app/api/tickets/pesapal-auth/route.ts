import { NextRequest, NextResponse } from "next/server";

// Pesapal API URLs - using production by default
const PESAPAL_BASE_URL = "https://pay.pesapal.com/v3";
// For sandbox/testing, use:
// const PESAPAL_BASE_URL = "https://cybqa.pesapal.com/pesapalv3";

const PESAPAL_AUTH_URL = `${PESAPAL_BASE_URL}/api/Auth/RequestToken`;

/**
 * Handles authentication with Pesapal API to obtain access token
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_request: NextRequest) {
  try {
    // Get consumer key and secret from environment variables
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

    // Prepare authentication request to Pesapal
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

    // Get the response data
    const data = await response.json();

    // Check if authentication was successful
    if (data.token && data.status === "200") {
      return NextResponse.json({
        success: true,
        token: data.token,
        expiryDate: data.expiryDate,
      });
    } else {
      // Authentication failed
      console.error("Pesapal authentication failed:", data);
      return NextResponse.json(
        {
          success: false,
          message: "Authentication with Pesapal failed",
          error: data.error || data.message || "Unknown error",
        },
        { status: 401 }
      );
    }
  } catch (error: unknown) {
    // Handle any unexpected errors
    console.error("Error in Pesapal authentication:", error);
    return NextResponse.json(
      {
        success: false,
        message: `Failed to authenticate with Pesapal: ${
          (error as Error).message || "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}

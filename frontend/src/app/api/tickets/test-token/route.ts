import { NextRequest, NextResponse } from "next/server";

/**
 * Test endpoint to verify API token works with Strapi
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  try {
    console.log("==== TESTING STRAPI API TOKEN ====");

    // Get Strapi API URL and token from environment
    let STRAPI_URL = process.env.NEXT_PUBLIC_API_URL;
    const STRAPI_API_TOKEN =
      process.env.STRAPI_API_TOKEN || process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

    // Fix for IPv6/IPv4 issue - explicitly use IPv4 for localhost
    if (STRAPI_URL && STRAPI_URL.includes("localhost")) {
      STRAPI_URL = STRAPI_URL.replace("localhost", "127.0.0.1");
    }

    if (!STRAPI_URL) {
      return NextResponse.json(
        {
          success: false,
          message: "API URL not configured",
        },
        { status: 500 }
      );
    }

    if (!STRAPI_API_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          message: "API token not configured",
        },
        { status: 500 }
      );
    }

    console.log("API URL:", STRAPI_URL);
    console.log(
      "API Token (first 10 chars):",
      STRAPI_API_TOKEN.substring(0, 10) + "..."
    );

    // Check token with the regular API endpoint
    console.log("Testing token with API endpoint...");
    const apiResponse = await fetch(
      `${STRAPI_URL}/api/ticket-purchases?pagination[limit]=1`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        },
      }
    );

    console.log("API response status:", apiResponse.status);

    const apiData = await apiResponse.json();
    const apiSuccess = apiResponse.status === 200;

    return NextResponse.json({
      success: apiSuccess,
      tokenConfigured: true,
      apiEndpointTest: {
        url: `${STRAPI_URL}/api/ticket-purchases?pagination[limit]=1`,
        status: apiResponse.status,
        success: apiSuccess,
        data: apiSuccess ? apiData : null,
        error: !apiSuccess ? apiData : null,
      },
      message: apiSuccess
        ? "API token works with Strapi"
        : "API token does not work with Strapi",
    });
  } catch (error: unknown) {
    console.error("Error testing token:", error);

    return NextResponse.json(
      {
        success: false,
        message: `Token test failed: ${(error as Error).message || "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}

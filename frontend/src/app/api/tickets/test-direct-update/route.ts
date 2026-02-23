import { NextRequest, NextResponse } from "next/server";

/**
 * Test endpoint to directly update a purchase in Strapi
 * This is for debugging purposes
 */
export async function POST(request: NextRequest) {
  try {
    console.log("==== TEST DIRECT UPDATE START ====");

    // Get request body
    const body = await request.json();
    const { id, updateData } = body;

    // Validate required fields
    if (!id || !updateData) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: id and updateData",
        },
        { status: 400 }
      );
    }

    console.log(`Testing direct update of purchase ID: ${id}`);
    console.log("Update data:", updateData);

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

    // Try different URL structures for Strapi
    const urlOptions = [
      `${STRAPI_URL}/api/ticket-purchases/${id}`,
      `${STRAPI_URL}/api/ticket-purchases/${id}?populate=*`,
      `${STRAPI_URL}/ticket-purchases/${id}`,
      `${STRAPI_URL}/content-manager/collection-types/api::ticket-purchase.ticket-purchase/${id}`,
    ];

    let successfulUpdate = false;
    let updateResponse = null;
    let updateResult = null;
    let successUrl = "";

    // Try each URL until one works
    for (const url of urlOptions) {
      try {
        console.log(`Attempting update with URL: ${url}`);

        updateResponse = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(STRAPI_API_TOKEN && {
              Authorization: `Bearer ${STRAPI_API_TOKEN}`,
            }),
          },
          body: JSON.stringify({
            data: updateData,
          }),
        });

        console.log(`Response status for ${url}: ${updateResponse.status}`);
        updateResult = await updateResponse.json();

        if (updateResponse.ok) {
          successfulUpdate = true;
          successUrl = url;
          console.log(`Update successful with URL: ${url}`);
          break;
        } else {
          console.log(`Update failed with URL: ${url}`, updateResult);
        }
      } catch (error: unknown) {
        console.error(`Error with URL ${url}:`, (error as Error).message);
      }
    }

    if (successfulUpdate) {
      return NextResponse.json({
        success: true,
        message: "Purchase updated successfully",
        successUrl: successUrl,
        data: updateResult.data,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update purchase with any URL structure",
          lastAttemptUrl: urlOptions[urlOptions.length - 1],
          lastResponse: updateResult,
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error("Error in test update:", error);

    return NextResponse.json(
      {
        success: false,
        message: `Test update failed: ${(error as Error).message || "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}

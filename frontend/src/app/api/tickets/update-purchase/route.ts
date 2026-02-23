import { NextRequest, NextResponse } from "next/server";

/**
 * API route to update ticket purchase by referenceNumber
 * This avoids using Strapi IDs directly in application code
 */
export async function POST(request: NextRequest) {
  try {
    console.log("==== UPDATE PURCHASE BY REFERENCE START ====");

    // Get request body
    const body = await request.json();
    const { referenceNumber, updateData } = body;

    // Validate required fields
    if (!referenceNumber || !updateData) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: referenceNumber and updateData",
        },
        { status: 400 }
      );
    }

    console.log(`Updating purchase with reference: ${referenceNumber}`);
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

    // Step 1: Find the purchase by referenceNumber
    console.log(
      `Finding purchase with URL: ${STRAPI_URL}/api/ticket-purchases?filters[referenceNumber][$eq]=${referenceNumber}`
    );

    let findResponse;
    try {
      findResponse = await fetch(
        `${STRAPI_URL}/api/ticket-purchases?filters[referenceNumber][$eq]=${referenceNumber}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(STRAPI_API_TOKEN && {
              Authorization: `Bearer ${STRAPI_API_TOKEN}`,
            }),
          },
        }
      );
    } catch (findError: unknown) {
      console.error("Error in find request:", findError);
      console.log("Error message:", (findError as Error).message);
      console.log("Error name:", (findError as Error).name);
      console.log("Error cause:", (findError as Record<string, unknown>).cause);
      throw new Error(`Find request failed: ${(findError as Error).message}`);
    }

    const findData = await findResponse.json();
    console.log("Find response data:", findData);

    // Check if purchase was found
    if (!findData.data || findData.data.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Purchase with reference ${referenceNumber} not found`,
        },
        { status: 404 }
      );
    }

    // Get the ID of the first matching record
    const purchaseId = findData.data[0].id;

    // Build the update URL
    const updateUrl = `${STRAPI_URL}/api/ticket-purchases/${purchaseId}`;
    console.log(`Attempting to update purchase at URL: ${updateUrl}`);

    // Log headers being sent
    const headers = {
      "Content-Type": "application/json",
      ...(STRAPI_API_TOKEN && { Authorization: `Bearer ${STRAPI_API_TOKEN}` }),
    };
    console.log("Request headers:", Object.keys(headers));

    // Log the body being sent
    const updateBody = {
      data: updateData,
    };
    console.log("Update body:", JSON.stringify(updateBody));

    // Step 2: Update the purchase by ID
    const purchaseUpdateUrl = `${STRAPI_URL}/api/ticket-purchases/${purchaseId}`;
    console.log(`Update URL: ${purchaseUpdateUrl}`);

    // Log the exact URL and request we're making
    console.log(`Complete request: PUT ${purchaseUpdateUrl}`);
    console.log(
      `Headers: Content-Type + Authorization Bearer Token (${
        STRAPI_API_TOKEN ? "present" : "missing"
      })`
    );
    console.log(`Body: ${JSON.stringify({ data: updateData })}`);

    const updateResponse = await fetch(purchaseUpdateUrl, {
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

    const updateResult = await updateResponse.json();

    // Check if update was successful
    if (updateResponse.ok) {
      console.log(`Successfully updated purchase ${referenceNumber}`);
      console.log("==== UPDATE PURCHASE BY REFERENCE COMPLETED ====");

      return NextResponse.json({
        success: true,
        message: "Purchase updated successfully",
        data: updateResult.data,
      });
    } else {
      console.error("Failed to update purchase:", updateResult);
      console.log("==== UPDATE PURCHASE BY REFERENCE FAILED ====");

      return NextResponse.json(
        {
          success: false,
          message: "Failed to update purchase",
          error: updateResult,
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    // Handle any unexpected errors
    console.error("Error updating purchase:", error);
    console.log("Error message:", (error as Error).message);
    console.log("Error name:", (error as Error).name);
    console.log("Error cause:", (error as Record<string, unknown>).cause);
    console.log("Error stack:", (error as Error).stack);
    console.log("==== UPDATE PURCHASE BY REFERENCE FAILED WITH EXCEPTION ====");

    return NextResponse.json(
      {
        success: false,
        message: `Failed to update purchase: ${
          (error as Error).message || "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}

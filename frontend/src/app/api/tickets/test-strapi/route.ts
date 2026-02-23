import { NextRequest, NextResponse } from "next/server";

/**
 * Simple test endpoint to verify Strapi connectivity
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  try {
    // Get Strapi API URL from environment
    const STRAPI_URL = process.env.NEXT_PUBLIC_API_URL;
    console.log(`Testing connection to Strapi at: ${STRAPI_URL}`);

    if (!STRAPI_URL) {
      return NextResponse.json(
        {
          success: false,
          message: "API URL not configured",
        },
        { status: 500 }
      );
    }

    // Try a simple fetch to see if Strapi is accessible
    console.log("Attempting to connect to Strapi...");
    const response = await fetch(
      `${STRAPI_URL}/api/ticket-purchases?pagination[limit]=1`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: "Successfully connected to Strapi",
      status: response.status,
      data: data,
    });
  } catch (error: unknown) {
    console.error("Error connecting to Strapi:", error);
    console.log("Error message:", (error as Error).message);
    console.log("Error name:", (error as Error).name);
    console.log("Error cause:", (error as Record<string, unknown>).cause);

    return NextResponse.json(
      {
        success: false,
        message: `Failed to connect to Strapi: ${(error as Error).message}`,
        error: {
          name: (error as Error).name,
          cause: (error as Record<string, unknown>).cause ? String((error as Record<string, unknown>).cause) : "unknown",
        },
      },
      { status: 500 }
    );
  }
}

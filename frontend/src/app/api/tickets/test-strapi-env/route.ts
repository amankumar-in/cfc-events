import { NextRequest, NextResponse } from "next/server";

/**
 * Diagnostic endpoint to check Strapi connectivity and environment
 */
export async function GET(request: NextRequest) {
  try {
    // Collect environment information
    const apiUrlFromEnv = process.env.NEXT_PUBLIC_API_URL;
    const baseUrlFromEnv = process.env.NEXT_PUBLIC_BASE_URL;
    const nodeEnv = process.env.NODE_ENV;

    // Determine host
    const host = request.headers.get("host") || "";
    const isLocalhost =
      host.includes("localhost") || host.includes("127.0.0.1");

    // Different URLs to try
    const urlsToTry = [
      apiUrlFromEnv,
      "http://localhost:1337",
      "http://127.0.0.1:1337",
    ];

    // Create results object
    const results = {
      environment: {
        NEXT_PUBLIC_API_URL: apiUrlFromEnv,
        NEXT_PUBLIC_BASE_URL: baseUrlFromEnv,
        NODE_ENV: nodeEnv,
        host: host,
        isLocalhost: isLocalhost,
      },
      connectionTests: [] as Record<string, unknown>[],
    };

    // Try connecting to different URLs
    for (const url of urlsToTry) {
      if (!url) continue;

      try {
        console.log(
          `Testing connection to: ${url}/api/ticket-purchases?pagination[limit]=1`
        );

        const startTime = Date.now();
        const response = await fetch(
          `${url}/api/ticket-purchases?pagination[limit]=1`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const endTime = Date.now();

        const responseData = await response.json();
        const connectionResult = {
          url: url,
          success: response.ok,
          status: response.status,
          timeMs: endTime - startTime,
          hasData:
            responseData && responseData.data && responseData.data.length > 0,
          dataCount: responseData?.data?.length || 0,
        };

        results.connectionTests.push(connectionResult);
        console.log(`Test result for ${url}:`, connectionResult);
      } catch (error: unknown) {
        results.connectionTests.push({
          url: url,
          success: false,
          error: (error as Error).message,
          cause: (error as Record<string, unknown>).cause ? String((error as Record<string, unknown>).cause) : "unknown",
        });
        console.error(`Error connecting to ${url}:`, error);
      }
    }

    return NextResponse.json({
      success: results.connectionTests.some((test) => test.success),
      message: "Connectivity test completed",
      diagnosticResults: results,
    });
  } catch (error: unknown) {
    console.error("Error in diagnostic test:", error);

    return NextResponse.json(
      {
        success: false,
        message: `Diagnostic test failed: ${(error as Error).message}`,
        error: {
          name: (error as Error).name,
          cause: (error as Record<string, unknown>).cause ? String((error as Record<string, unknown>).cause) : "unknown",
        },
      },
      { status: 500 }
    );
  }
}

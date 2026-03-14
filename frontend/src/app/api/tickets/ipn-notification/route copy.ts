import { NextRequest, NextResponse } from "next/server";

/**
 * Handles IPN (Instant Payment Notification) from Pesapal
 * This endpoint will receive payment status updates
 */
export async function GET(request: NextRequest) {
  // Get URL parameters
  const searchParams = request.nextUrl.searchParams;
  const orderTrackingId = searchParams.get("OrderTrackingId");
  const orderMerchantReference = searchParams.get("OrderMerchantReference");
  const orderNotificationType = searchParams.get("OrderNotificationType");

  console.log("Pesapal IPN notification received (GET):", {
    orderTrackingId,
    orderMerchantReference,
    orderNotificationType,
    allParams: Object.fromEntries(searchParams.entries()),
  });

  // Process the notification (in a real implementation, you would update your database)
  try {
    // Verify payment status with Pesapal
    if (orderTrackingId && orderMerchantReference) {
      console.log("Verifying payment status with Pesapal");

      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;

      // Mock payment data for testing
      let paymentData;

      // For testing: If orderTrackingId starts with "test-", use mock data
      if (orderTrackingId.startsWith("test-")) {
        console.log("Using mock payment data for test transaction");
        paymentData = {
          success: true,
          paymentStatus: "COMPLETED",
          paymentMethod: "Test Method",
          amount: 100,
          currency: "USD",
        };
      } else {
        // Get real payment status from Pesapal
        const statusUrl = `${baseUrl}/api/tickets/transaction-status?orderTrackingId=${orderTrackingId}`;
        const statusResponse = await fetch(statusUrl);
        paymentData = await statusResponse.json();
      }

      if (paymentData.success) {
        console.log("Payment status received:", paymentData.paymentStatus);

        // Map Pesapal status to our status
        let paymentStatus = "pending";
        if (paymentData.paymentStatus === "COMPLETED") {
          paymentStatus = "paid";
        } else if (paymentData.paymentStatus === "FAILED") {
          paymentStatus = "failed";
        } else if (paymentData.paymentStatus === "CANCELLED") {
          paymentStatus = "cancelled";
        }

        // Update the purchase record using the reference number endpoint
        if (orderMerchantReference) {
          console.log(
            `Updating purchase with reference: ${orderMerchantReference}`
          );

          // Get Strapi API URL from environment
          let STRAPI_URL = process.env.NEXT_PUBLIC_API_URL;

          // Fix for IPv6/IPv4 issue
          if (STRAPI_URL && STRAPI_URL.includes("localhost")) {
            STRAPI_URL = STRAPI_URL.replace("localhost", "127.0.0.1");
          }

          // Use our new custom endpoint to update by reference number
          const updateUrl = `${STRAPI_URL}/api/ticket-purchases/by-reference/${orderMerchantReference}`;
          console.log(`Using update URL: ${updateUrl}`);

          const updateResponse = await fetch(updateUrl, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              data: {
                paymentStatus: paymentStatus,
                paymentMethod: paymentData.paymentMethod || null,
                transactionId: orderTrackingId,
              },
            }),
          });

          if (updateResponse.ok) {
            console.log(
              `Successfully updated purchase ${orderMerchantReference} to ${paymentStatus}`
            );

            // TODO: Generate tickets if payment was successful
            if (paymentStatus === "paid") {
              console.log("Payment successful - would generate tickets here");
              // Add ticket generation logic here
            }
          } else {
            console.error(
              "Failed to update purchase:",
              await updateResponse.json()
            );
          }
        }
      } else {
        console.error("Failed to get payment status:", paymentData);
      }
    }

    // Respond to Pesapal with a success message
    return NextResponse.json({
      orderNotificationType: orderNotificationType,
      orderTrackingId: orderTrackingId,
      orderMerchantReference: orderMerchantReference,
      status: 200,
    });
  } catch (error) {
    console.error("Error processing IPN notification:", error);

    // Respond with an error message
    return NextResponse.json({
      orderNotificationType: orderNotificationType,
      orderTrackingId: orderTrackingId,
      orderMerchantReference: orderMerchantReference,
      status: 500,
    });
  }
}

/**
 * Handles IPN (Instant Payment Notification) from Pesapal via POST
 */
export async function POST(request: NextRequest) {
  try {
    // Get the POST body
    const body = await request.json();

    // Extract the data
    const orderTrackingId = body.OrderTrackingId;
    const orderMerchantReference = body.OrderMerchantReference;
    const orderNotificationType = body.OrderNotificationType;

    console.log("Pesapal IPN notification received (POST):", body);

    // Process the notification
    if (orderTrackingId && orderMerchantReference) {
      console.log("Verifying payment status with Pesapal");

      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;

      // Mock payment data for testing
      let paymentData;

      // For testing: If orderTrackingId starts with "test-", use mock data
      if (orderTrackingId.startsWith("test-")) {
        console.log("Using mock payment data for test transaction");
        paymentData = {
          success: true,
          paymentStatus: "COMPLETED",
          paymentMethod: "Test Method",
          amount: 100,
          currency: "USD",
        };
      } else {
        // Get real payment status from Pesapal
        const statusUrl = `${baseUrl}/api/tickets/transaction-status?orderTrackingId=${orderTrackingId}`;
        const statusResponse = await fetch(statusUrl);
        paymentData = await statusResponse.json();
      }

      if (paymentData.success) {
        console.log("Payment status received:", paymentData.paymentStatus);

        // Map Pesapal status to our status
        let paymentStatus = "pending";
        if (paymentData.paymentStatus === "COMPLETED") {
          paymentStatus = "paid";
        } else if (paymentData.paymentStatus === "FAILED") {
          paymentStatus = "failed";
        } else if (paymentData.paymentStatus === "CANCELLED") {
          paymentStatus = "cancelled";
        }

        // Update the purchase record using the reference number endpoint
        if (orderMerchantReference) {
          console.log(
            `Updating purchase with reference: ${orderMerchantReference}`
          );

          // Get Strapi API URL from environment
          let STRAPI_URL = process.env.NEXT_PUBLIC_API_URL;

          // Fix for IPv6/IPv4 issue
          if (STRAPI_URL && STRAPI_URL.includes("localhost")) {
            STRAPI_URL = STRAPI_URL.replace("localhost", "127.0.0.1");
          }

          // Use our new custom endpoint to update by reference number
          const updateUrl = `${STRAPI_URL}/api/ticket-purchases/by-reference/${orderMerchantReference}`;
          console.log(`Using update URL: ${updateUrl}`);

          const updateResponse = await fetch(updateUrl, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              data: {
                paymentStatus: paymentStatus,
                paymentMethod: paymentData.paymentMethod || null,
                transactionId: orderTrackingId,
              },
            }),
          });

          if (updateResponse.ok) {
            console.log(
              `Successfully updated purchase ${orderMerchantReference} to ${paymentStatus}`
            );

            // TODO: Generate tickets if payment was successful
            if (paymentStatus === "paid") {
              console.log("Payment successful - would generate tickets here");
              // Add ticket generation logic here
            }
          } else {
            console.error(
              "Failed to update purchase:",
              await updateResponse.json()
            );
          }
        }
      } else {
        console.error("Failed to get payment status:", paymentData);
      }
    }

    // Respond to Pesapal with a success message
    return NextResponse.json({
      orderNotificationType: orderNotificationType,
      orderTrackingId: orderTrackingId,
      orderMerchantReference: orderMerchantReference,
      status: 200,
    });
  } catch (error) {
    console.error("Error processing IPN notification:", error);

    // Respond with an error message
    return NextResponse.json({
      orderNotificationType: "IPNCHANGE",
      orderTrackingId: "",
      orderMerchantReference: "",
      status: 500,
    });
  }
}

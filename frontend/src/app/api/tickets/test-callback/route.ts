import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  // Get transaction details from query parameters
  const searchParams = request.nextUrl.searchParams;
  const pesapalTrackingId = searchParams.get("pesapal_transaction_tracking_id");
  const pesapalMerchantReference = searchParams.get(
    "pesapal_merchant_reference"
  );
  const pesapalNotification = searchParams.get("pesapal_notification_type");

  console.log("Pesapal test callback received:", {
    reference: pesapalMerchantReference,
    trackingId: pesapalTrackingId,
    notification: pesapalNotification,
    allParams: Object.fromEntries(searchParams.entries()),
  });

  // Redirect to the test results page with the parameters
  const redirectUrl = `/tickets/test-payment?callback=true&reference=${
    pesapalMerchantReference || ""
  }&trackingId=${pesapalTrackingId || ""}&notification=${
    pesapalNotification || ""
  }`;

  return Response.redirect(
    `${
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    }${redirectUrl}`,
    302
  );
}

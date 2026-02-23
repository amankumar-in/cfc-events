import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Function to generate OAuth signature
function generateOAuthSignature(baseString: string, consumerSecret: string) {
  return crypto
    .createHmac("sha1", `${consumerSecret}&`)
    .update(baseString)
    .digest("base64");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      consumerKey,
      consumerSecret,
      referenceNumber,
      amount,
      currency,
      description,
      buyerName,
      buyerEmail,
    } = body;

    // Validate required fields
    if (!consumerKey || !consumerSecret) {
      return NextResponse.json(
        { success: false, message: "Missing consumer key or secret" },
        { status: 400 }
      );
    }

    if (!referenceNumber || !amount || !currency || !buyerEmail) {
      return NextResponse.json(
        { success: false, message: "Missing required payment details" },
        { status: 400 }
      );
    }

    // Log test parameters
    console.log("Testing Pesapal with parameters:", {
      referenceNumber,
      amount,
      currency,
      buyerEmail,
      // Don't log sensitive data like consumer key/secret
    });

    // Build XML for Pesapal request
    // Split name into first and last name
    const nameParts = buyerName.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const xml = `<?xml version="1.0" encoding="utf-8"?>
      <PesapalDirectOrderInfo 
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
        xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
        Amount="${amount}" 
        Description="${description || "Test Payment"}" 
        Type="MERCHANT" 
        Reference="${referenceNumber}" 
        FirstName="${firstName}" 
        LastName="${lastName}" 
        Email="${buyerEmail}" 
        Currency="${currency}" />`;

    // URL encode the XML
    const xmlString = encodeURIComponent(xml);

    // Determine endpoints based on testing or production
    // Using the demo/sandbox endpoints for testing
    const isProd = false; // Set to true for production environment

    const pesapalBaseUrl = isProd
      ? "https://www.pesapal.com"
      : "https://demo.pesapal.com";

    const pesapalIframeUrl = `${pesapalBaseUrl}/API/PostPesapalDirectOrderV4`;

    // Callback URL would be your application's callback endpoint
    const callbackUrl = `${
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    }/api/tickets/test-callback`;

    // Generate OAuth parameters
    const oauth = {
      oauth_consumer_key: consumerKey,
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_nonce: crypto.randomUUID(),
      oauth_version: "1.0",
      oauth_callback: callbackUrl,
    };

    // Create base string for signature
    const baseString =
      "POST&" +
      encodeURIComponent(pesapalIframeUrl) +
      "&" +
      encodeURIComponent(
        Object.keys(oauth)
          .sort()
          .map(
            (key) =>
              `${key}=${encodeURIComponent(oauth[key as keyof typeof oauth])}`
          )
          .join("&")
      );

    // Generate signature
    const signature = generateOAuthSignature(baseString, consumerSecret);
    oauth["oauth_signature"] = signature;

    // Create OAuth header
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _oauthHeader = Object.keys(oauth)
      .map(
        (key) =>
          `${key}="${encodeURIComponent(oauth[key as keyof typeof oauth])}"`
      )
      .join(", ");

    // Create iFrame URL with parameters
    const iframeUrl = `${pesapalIframeUrl}?oauth_callback=${encodeURIComponent(
      callbackUrl
    )}&pesapal_request_data=${xmlString}`;

    // Return the success response with redirect URL
    return NextResponse.json({
      success: true,
      message: "Successfully generated Pesapal payment URL",
      redirectUrl: iframeUrl,
      reference: referenceNumber,
      baseUrl: pesapalBaseUrl,
      iframeUrl: pesapalIframeUrl,
      oauth: oauth,
      signature: signature,
      requestXml: xml,
    });
  } catch (error: unknown) {
    console.error("Error in test-pesapal:", error);
    return NextResponse.json(
      {
        success: false,
        message: `Failed to test Pesapal integration: ${
          (error as Error).message || "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}

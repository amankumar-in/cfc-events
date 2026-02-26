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
          currency: "UGX",
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

            // Generate tickets if payment was successful
            if (paymentStatus === "paid") {
              console.log("Payment successful - generating tickets");

              try {
                // Fetch the purchase details to get ticket info
                const purchaseResponse = await fetch(
                  `${STRAPI_URL}/api/ticket-purchases?filters[referenceNumber][$eq]=${orderMerchantReference}&populate=*`,
                  {
                    headers: {
                      "Content-Type": "application/json",
                    },
                  }
                );

                if (purchaseResponse.ok) {
                  const purchaseData = await purchaseResponse.json();

                  if (purchaseData.data && purchaseData.data.length > 0) {
                    const purchase = purchaseData.data[0];

                    // Check if tickets already exist for this purchase
                    const ticketsResponse = await fetch(
                      `${STRAPI_URL}/api/tickets?filters[purchase][referenceNumber][$eq]=${orderMerchantReference}`,
                      {
                        headers: {
                          "Content-Type": "application/json",
                        },
                      }
                    );

                    const ticketsData = await ticketsResponse.json();

                    // Skip ticket generation if tickets already exist
                    if (ticketsData.data && ticketsData.data.length > 0) {
                      console.log(
                        `Tickets already exist for purchase ${orderMerchantReference}`
                      );
                      return NextResponse.json({
                        orderNotificationType: orderNotificationType,
                        orderTrackingId: orderTrackingId,
                        orderMerchantReference: orderMerchantReference,
                        status: 200,
                      });
                    }

                    // Get attendee data
                    let attendeeData = null;
                    let ticketCategoryId = null;
                    let ticketQuantity = 1;

                    // Check if there's stored attendee data
                    try {
                      const storedData = localStorage.getItem(
                        `attendeeData_${orderMerchantReference}`
                      );
                      if (storedData) {
                        const parsedData = JSON.parse(storedData);
                        attendeeData = parsedData.attendees;
                        ticketCategoryId = parsedData.ticketCategoryId;
                        ticketQuantity = parsedData.quantity;
                      }
                    } catch (error) {
                      console.log("No stored attendee data available:", error);
                    }

                    // If no stored data, create generic tickets using buyer info
                    if (!attendeeData) {
                      ticketQuantity = 1; // Default to 1 if we don't know the quantity

                      // Use purchase amount and ticket prices to guess quantity
                      try {
                        const categoriesResponse = await fetch(
                          `${STRAPI_URL}/api/ticket-categories`,
                          {
                            headers: {
                              "Content-Type": "application/json",
                            },
                          }
                        );

                        if (categoriesResponse.ok) {
                          const categoriesData =
                            await categoriesResponse.json();

                          if (
                            categoriesData.data &&
                            categoriesData.data.length > 0
                          ) {
                            // Find matching category based on price
                            const categories = categoriesData.data;
                            for (const category of categories) {
                              if (purchase.totalAmount === category.price) {
                                ticketCategoryId = category.documentId;
                                ticketQuantity = 1;
                                break;
                              } else if (
                                purchase.totalAmount % category.price ===
                                0
                              ) {
                                ticketCategoryId = category.documentId;
                                ticketQuantity =
                                  purchase.totalAmount / category.price;
                                break;
                              }
                            }
                          }
                        }
                      } catch (error) {
                        console.error(
                          "Error determining ticket category and quantity:",
                          error
                        );
                      }

                      // Create generic attendee data based on buyer info
                      attendeeData = Array(ticketQuantity).fill({
                        name: purchase.buyerName,
                        email: purchase.buyerEmail,
                        phone: purchase.buyerPhone,
                        organization: "",
                      });
                    }

                    // Get ticket category details if we have an ID
                    let ticketCategory = null;
                    if (ticketCategoryId) {
                      try {
                        const categoryResponse = await fetch(
                          `${STRAPI_URL}/api/ticket-categories?filters[documentId][$eq]=${ticketCategoryId}&populate[allowedEvents][populate][venue]=*&populate[allowedSessions][populate][event]=*&populate[allowedSessions][populate][venue]=*`,
                          {
                            headers: {
                              "Content-Type": "application/json",
                            },
                          }
                        );

                        if (categoryResponse.ok) {
                          const categoryData = await categoryResponse.json();
                          if (
                            categoryData.data &&
                            categoryData.data.length > 0
                          ) {
                            ticketCategory = categoryData.data[0];
                          }
                        }
                      } catch (error) {
                        console.error("Error fetching ticket category:", error);
                      }
                    }

                    // Generate tickets
                    console.log(
                      `Creating ${ticketQuantity} tickets for purchase ${orderMerchantReference}`
                    );

                    const ticketCreationPromises = [];

                    for (let i = 0; i < ticketQuantity; i++) {
                      // Generate unique ticket number
                      const ticketNumber = `${orderMerchantReference}-${
                        i + 1
                      }-${Math.floor(Math.random() * 10000)
                        .toString()
                        .padStart(4, "0")}`;

                      const qrCodeData = JSON.stringify({ ticketNumber, event: ticketCategory?.allowedEvents?.[0]?.Slug || "event" });

                      // Updated code (using documentId)
                      const ticketData = {
                        ticketNumber,
                        attendeeName:
                          attendeeData[i]?.name || purchase.buyerName,
                        attendeeEmail:
                          attendeeData[i]?.email || purchase.buyerEmail,
                        attendeePhone:
                          attendeeData[i]?.phone || purchase.buyerPhone,
                        attendeeOrganization:
                          attendeeData[i]?.organization || "",
                        isCheckedIn: false,
                        qrCodeData,
                        purchase: {
                          connect: [{ documentId: purchase.documentId }],
                        },
                        ticketCategory: ticketCategory
                          ? {
                              connect: [
                                { documentId: ticketCategory.documentId },
                              ],
                            }
                          : null,
                      };

                      console.log(
                        `Creating ticket: ${JSON.stringify(ticketData)}`
                      );

                      const ticketCreationPromise = fetch(
                        `${STRAPI_URL}/api/tickets`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({ data: ticketData }),
                        }
                      );

                      ticketCreationPromises.push(ticketCreationPromise);
                    }

                    // Wait for all tickets to be created
                    const ticketResponses = await Promise.allSettled(
                      ticketCreationPromises
                    );

                    // Check results
                    const successfulTickets = ticketResponses.filter(
                      (response) => response.status === "fulfilled"
                    ).length;

                    console.log(
                      `Successfully created ${successfulTickets} of ${ticketQuantity} tickets`
                    );

                    // Send email notification with ticket details
                    if (successfulTickets > 0) {
                      try {
                        console.log(
                          `Sending tickets via email to ${purchase.buyerEmail}`
                        );

                        // Get the base URL
                        const baseUrl =
                          process.env.NEXT_PUBLIC_BASE_URL ||
                          request.nextUrl.origin;

                        // Call the email API
                        const emailEndpoint = `${baseUrl}/api/tickets/send-email`;

                        // Create a simple email without PDF for server-side
                        const emailResponse = await fetch(emailEndpoint, {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            email: purchase.buyerEmail,
                            name: purchase.buyerName,
                            subject: `Your ${ticketCategory?.allowedEvents?.[0]?.Title || "Event"} Tickets`,
                            ticketNumber: "Multiple tickets",
                            referenceNumber: orderMerchantReference,
                            eventInfo: {
                              eventName: ticketCategory?.allowedEvents?.[0]?.Title || "Event",
                              eventTagline: ticketCategory?.allowedEvents?.[0]?.ShortDescription || "",
                              startDate: ticketCategory?.allowedEvents?.[0]?.StartDate || "",
                              endDate: ticketCategory?.allowedEvents?.[0]?.EndDate || "",
                              location: ticketCategory?.allowedEvents?.[0]?.venue
                                ? `${ticketCategory.allowedEvents[0].venue.Name}, ${ticketCategory.allowedEvents[0].venue.City}, ${ticketCategory.allowedEvents[0].venue.Country}`
                                : (ticketCategory?.allowedEvents?.[0]?.Location || ""),
                            },
                          }),
                        });

                        const emailResult = await emailResponse.json();
                        console.log("Email notification result:", emailResult);
                      } catch (emailError) {
                        console.error(
                          "Error sending email notification:",
                          emailError
                        );
                        // Non-critical error, don't throw
                      }
                    }
                  } else {
                    console.error(
                      "Purchase not found:",
                      orderMerchantReference
                    );
                  }
                } else {
                  console.error(
                    "Failed to fetch purchase details:",
                    await purchaseResponse.text()
                  );
                }
              } catch (ticketError) {
                console.error("Error generating tickets:", ticketError);
              }
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
          currency: "UGX",
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

            // Generate tickets if payment was successful
            if (paymentStatus === "paid") {
              console.log("Payment successful - generating tickets");

              try {
                // Fetch the purchase details to get ticket info
                const purchaseResponse = await fetch(
                  `${STRAPI_URL}/api/ticket-purchases?filters[referenceNumber][$eq]=${orderMerchantReference}&populate=*`,
                  {
                    headers: {
                      "Content-Type": "application/json",
                    },
                  }
                );

                if (purchaseResponse.ok) {
                  const purchaseData = await purchaseResponse.json();

                  if (purchaseData.data && purchaseData.data.length > 0) {
                    const purchase = purchaseData.data[0];

                    // Check if tickets already exist for this purchase
                    const ticketsResponse = await fetch(
                      `${STRAPI_URL}/api/tickets?filters[purchase][referenceNumber][$eq]=${orderMerchantReference}`,
                      {
                        headers: {
                          "Content-Type": "application/json",
                        },
                      }
                    );

                    const ticketsData = await ticketsResponse.json();

                    // Skip ticket generation if tickets already exist
                    if (ticketsData.data && ticketsData.data.length > 0) {
                      console.log(
                        `Tickets already exist for purchase ${orderMerchantReference}`
                      );
                      return NextResponse.json({
                        orderNotificationType: orderNotificationType,
                        orderTrackingId: orderTrackingId,
                        orderMerchantReference: orderMerchantReference,
                        status: 200,
                      });
                    }

                    // Note: We won't have access to localStorage in a server context,
                    // so we need to rely on other means to determine attendee information

                    // Let's determine the number of tickets based on the total amount
                    let ticketCategoryId = null;
                    let ticketQuantity = 1;

                    // Use purchase amount and ticket prices to guess quantity
                    try {
                      const categoriesResponse = await fetch(
                        `${STRAPI_URL}/api/ticket-categories`,
                        {
                          headers: {
                            "Content-Type": "application/json",
                          },
                        }
                      );

                      if (categoriesResponse.ok) {
                        const categoriesData = await categoriesResponse.json();

                        if (
                          categoriesData.data &&
                          categoriesData.data.length > 0
                        ) {
                          // Find matching category based on price
                          const categories = categoriesData.data;
                          for (const category of categories) {
                            if (purchase.totalAmount === category.price) {
                              ticketCategoryId = category.documentId;
                              ticketQuantity = 1;
                              break;
                            } else if (
                              purchase.totalAmount % category.price ===
                              0
                            ) {
                              ticketCategoryId = category.documentId;
                              ticketQuantity =
                                purchase.totalAmount / category.price;
                              break;
                            }
                          }
                        }
                      }
                    } catch (error) {
                      console.error(
                        "Error determining ticket category and quantity:",
                        error
                      );
                    }

                    // Create generic attendee data based on buyer info
                    const attendeeData = Array(ticketQuantity).fill({
                      name: purchase.buyerName,
                      email: purchase.buyerEmail,
                      phone: purchase.buyerPhone,
                      organization: "",
                    });

                    // Get ticket category details if we have an ID
                    let ticketCategory = null;
                    if (ticketCategoryId) {
                      try {
                        const categoryResponse = await fetch(
                          `${STRAPI_URL}/api/ticket-categories?filters[documentId][$eq]=${ticketCategoryId}&populate[allowedEvents][populate][venue]=*&populate[allowedSessions][populate][event]=*&populate[allowedSessions][populate][venue]=*`,
                          {
                            headers: {
                              "Content-Type": "application/json",
                            },
                          }
                        );

                        if (categoryResponse.ok) {
                          const categoryData = await categoryResponse.json();
                          if (
                            categoryData.data &&
                            categoryData.data.length > 0
                          ) {
                            ticketCategory = categoryData.data[0];
                          }
                        }
                      } catch (error) {
                        console.error("Error fetching ticket category:", error);
                      }
                    }

                    // Generate tickets
                    console.log(
                      `Creating ${ticketQuantity} tickets for purchase ${orderMerchantReference}`
                    );

                    const ticketCreationPromises = [];

                    for (let i = 0; i < ticketQuantity; i++) {
                      // Generate unique ticket number
                      const ticketNumber = `${orderMerchantReference}-${
                        i + 1
                      }-${Math.floor(Math.random() * 10000)
                        .toString()
                        .padStart(4, "0")}`;

                      const qrCodeData = JSON.stringify({ ticketNumber, event: ticketCategory?.allowedEvents?.[0]?.Slug || "event" });

                      // Updated code (using documentId)
                      const ticketData = {
                        ticketNumber,
                        attendeeName:
                          attendeeData[i]?.name || purchase.buyerName,
                        attendeeEmail:
                          attendeeData[i]?.email || purchase.buyerEmail,
                        attendeePhone:
                          attendeeData[i]?.phone || purchase.buyerPhone,
                        attendeeOrganization:
                          attendeeData[i]?.organization || "",
                        isCheckedIn: false,
                        qrCodeData,
                        purchase: {
                          connect: [{ documentId: purchase.documentId }],
                        },
                        ticketCategory: ticketCategory
                          ? {
                              connect: [
                                { documentId: ticketCategory.documentId },
                              ],
                            }
                          : null,
                      };

                      console.log(
                        `Creating ticket: ${JSON.stringify(ticketData)}`
                      );

                      const ticketCreationPromise = fetch(
                        `${STRAPI_URL}/api/tickets`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({ data: ticketData }),
                        }
                      );

                      ticketCreationPromises.push(ticketCreationPromise);
                    }

                    // Wait for all tickets to be created
                    const ticketResponses = await Promise.allSettled(
                      ticketCreationPromises
                    );

                    // Check results
                    const successfulTickets = ticketResponses.filter(
                      (response) => response.status === "fulfilled"
                    ).length;

                    console.log(
                      `Successfully created ${successfulTickets} of ${ticketQuantity} tickets`
                    );

                    // Send email notification with ticket details
                    if (successfulTickets > 0) {
                      try {
                        console.log(
                          `Sending tickets via email to ${purchase.buyerEmail}`
                        );

                        // Get the base URL
                        const baseUrl =
                          process.env.NEXT_PUBLIC_BASE_URL ||
                          request.nextUrl.origin;

                        // Call the email API
                        const emailEndpoint = `${baseUrl}/api/tickets/send-email`;

                        // Create a simple email without PDF for server-side
                        const emailResponse = await fetch(emailEndpoint, {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            email: purchase.buyerEmail,
                            name: purchase.buyerName,
                            subject: `Your ${ticketCategory?.allowedEvents?.[0]?.Title || "Event"} Tickets`,
                            ticketNumber: "Multiple tickets",
                            referenceNumber: orderMerchantReference,
                            eventInfo: {
                              eventName: ticketCategory?.allowedEvents?.[0]?.Title || "Event",
                              eventTagline: ticketCategory?.allowedEvents?.[0]?.ShortDescription || "",
                              startDate: ticketCategory?.allowedEvents?.[0]?.StartDate || "",
                              endDate: ticketCategory?.allowedEvents?.[0]?.EndDate || "",
                              location: ticketCategory?.allowedEvents?.[0]?.venue
                                ? `${ticketCategory.allowedEvents[0].venue.Name}, ${ticketCategory.allowedEvents[0].venue.City}, ${ticketCategory.allowedEvents[0].venue.Country}`
                                : (ticketCategory?.allowedEvents?.[0]?.Location || ""),
                            },
                          }),
                        });

                        const emailResult = await emailResponse.json();
                        console.log("Email notification result:", emailResult);
                      } catch (emailError) {
                        console.error(
                          "Error sending email notification:",
                          emailError
                        );
                        // Non-critical error, don't throw
                      }
                    }
                  } else {
                    console.error(
                      "Purchase not found:",
                      orderMerchantReference
                    );
                  }
                } else {
                  console.error(
                    "Failed to fetch purchase details:",
                    await purchaseResponse.text()
                  );
                }
              } catch (ticketError) {
                console.error("Error generating tickets:", ticketError);
              }
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

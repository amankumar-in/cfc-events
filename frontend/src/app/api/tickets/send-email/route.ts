import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

interface TicketDetail {
  ticketNumber: string;
  attendeeName: string;
  attendeeEmail: string;
  ticketCategory?: { name?: string };
}

interface EventInfoPayload {
  eventName?: string;
  eventTagline?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
}

function formatDateRange(startDate?: string, endDate?: string): string {
  if (!startDate) return "";
  const start = new Date(startDate);
  const startStr = start.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  if (!endDate) return startStr;
  const end = new Date(endDate);
  const endStr = end.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  return `${startStr} – ${endStr}`;
}

export async function POST(request: NextRequest) {
  console.log("Email API endpoint called");

  try {
    const body = await request.json();
    console.log("Request body received:", JSON.stringify(body, null, 2));

    const {
      email,
      name,
      ticketDetails,
      subject,
      confirmationUrl,
      eventInfo,
      // Legacy fields (backwards compatible)
      eventDate,
      eventLocation,
    } = body as {
      email: string;
      name?: string;
      ticketDetails?: TicketDetail[];
      subject?: string;
      confirmationUrl?: string;
      eventInfo?: EventInfoPayload;
      eventDate?: string;
      eventLocation?: string;
    };

    if (!email) {
      console.error("Missing email field in request");
      return NextResponse.json(
        { success: false, message: "Missing required email field" },
        { status: 400 }
      );
    }

    // Derive display values from eventInfo or legacy fields
    const evName = eventInfo?.eventName || "Event";
    const evTagline = eventInfo?.eventTagline || "";
    const evDateStr = eventInfo?.startDate
      ? formatDateRange(eventInfo.startDate, eventInfo.endDate)
      : eventDate || "";
    const evLocation = eventInfo?.location || eventLocation || "";
    const supportEmail = process.env.SUPPORT_EMAIL || "";
    const currentYear = new Date().getFullYear();

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.zeptomail.com",
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your ${evName} Tickets</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; color: #333333; background-color: #f4f4f4;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="padding: 24px 0; text-align: center; background-color: #1e3a8a;">
              <h1 style="margin: 0; color: white; font-size: 26px; letter-spacing: 0.5px;">${evName}</h1>
              ${evTagline ? `<p style="margin: 6px 0 0; color: #bfdbfe; font-size: 15px;">${evTagline}</p>` : ""}
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px; background-color: white;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <h2 style="margin-top: 0; color: #1e3a8a; font-size: 22px;">Hello ${name || "there"},</h2>
                    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6;">Thank you for registering! Your tickets for ${evName} are ready.</p>

                    <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin-bottom: 25px; border: 1px solid #e2e8f0;">
                      <h3 style="margin-top: 0; color: #1e3a8a; font-size: 18px;">Ticket Details</h3>
                      ${
                        ticketDetails
                          ? `
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="8" border="0" style="font-size: 15px;">
                        ${ticketDetails
                          .map(
                            (ticket: TicketDetail, index: number) => `
                        <tr style="${
                          index % 2 === 0 ? "background-color: #f1f5f9;" : ""
                        }">
                          <td style="border-bottom: 1px solid #e2e8f0; padding: 12px 8px;">
                            <strong>Ticket #${index + 1}</strong><br>
                            <span style="font-size: 13px; color: #64748b;">${ticket.ticketNumber}</span>
                          </td>
                          <td style="border-bottom: 1px solid #e2e8f0; padding: 12px 8px;">
                            <strong>${ticket.attendeeName}</strong><br>
                            <span style="font-size: 13px; color: #64748b;">${ticket.ticketCategory?.name || "Ticket"}</span>
                          </td>
                        </tr>
                        `
                          )
                          .join("")}
                      </table>
                      `
                          : `
                      <p style="margin: 0; font-size: 15px;">Your registration has been confirmed. Click the button below to view and download your tickets.</p>
                      `
                      }
                    </div>

                    ${confirmationUrl ? `
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${confirmationUrl}" style="background-color: #1e3a8a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; text-align: center; font-size: 15px;">View & Download Your Tickets</a>
                    </div>
                    ` : ""}

                    ${evDateStr || evLocation ? `
                    <h3 style="color: #1e3a8a; font-size: 18px;">Event Details</h3>
                    <ul style="padding-left: 20px; font-size: 15px; line-height: 1.6; color: #374151;">
                      ${evDateStr ? `<li><strong>Date:</strong> ${evDateStr}</li>` : ""}
                      ${evLocation ? `<li><strong>Location:</strong> ${evLocation}</li>` : ""}
                      <li>Please bring a printed copy of your ticket or show the digital version on your device</li>
                      <li>Arrive 30 minutes early to allow time for check-in</li>
                    </ul>
                    ` : ""}

                    ${supportEmail ? `<p style="margin: 30px 0 0; font-size: 15px; line-height: 1.6; color: #374151;">If you have any questions, contact us at <a href="mailto:${supportEmail}" style="color: #1e3a8a;">${supportEmail}</a>.</p>` : ""}

                    <p style="margin: 20px 0 0; font-size: 15px; line-height: 1.6; color: #374151;">We look forward to seeing you!</p>

                    <p style="margin: 20px 0 0; font-size: 15px; line-height: 1.6; color: #374151;">Best regards,<br>The ${evName} Team</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 30px; text-align: center; background-color: #f1f5f9; color: #64748b; font-size: 13px;">
              <p style="margin: 0 0 8px;">&copy; ${currentYear} ${evName}. All rights reserved.</p>
              ${evLocation ? `<p style="margin: 0;">${evLocation}</p>` : ""}
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Events" <tickets@rewardsforeducation.com>',
      to: email,
      subject: subject || `Your ${evName} Tickets`,
      html: htmlContent,
    };

    console.log("Sending email with options:", {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
    });

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent with info:", info);

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("Error in email API:", error);
    console.error(
      "Error details:",
      error instanceof Error ? error.message : String(error)
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to send email",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

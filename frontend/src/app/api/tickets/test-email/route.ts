import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const testEmail =
      searchParams.get("email") || "your-test-email@example.com";

    console.log("Testing email configuration with:", {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE,
      user: process.env.EMAIL_USER?.substring(0, 5) + "...", // Log only part of the username for security
      from: process.env.EMAIL_FROM,
    });

    // Create transporter with your email settings
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Send test email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: testEmail,
      subject: "CFC Events - Test Email",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1e3a8a; padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0;">CFC EVENTS</h1>
            <p style="margin: 5px 0 0;">Coins For College Events Platform</p>
          </div>
          
          <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
            <p>Hello,</p>
            
            <p>This is a test email to verify the email configuration for CFC Events ticket system.</p>
            
            <div style="background-color: #f3f4f6; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <p style="margin: 0 0 10px;"><strong>Test Time:</strong> ${new Date().toISOString()}</p>
            </div>
            
            <p>If you received this email, your email configuration is working correctly!</p>
            
            <p>Best regards,<br>CFC Events Team</p>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
            <p>© 2025 CFC Events. All rights reserved.</p>
            <p>Kampala International Convention Centre, Uganda</p>
          </div>
        </div>
      `,
    });

    console.log("Test email sent successfully:", info.messageId);

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      messageId: info.messageId,
      sentTo: testEmail,
    });
  } catch (error) {
    console.error("Error sending test email:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send test email",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

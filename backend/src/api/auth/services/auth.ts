import bcrypt from "bcryptjs";

const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;

export default () => ({
  async sendOtp(email: string) {
    const normalizedEmail = email.toLowerCase().trim();

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    strapi.log.info(`[OTP] Code for ${normalizedEmail}: ${code}`);
    const hash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Upsert OTP record
    const existing = await strapi.documents("api::otp-verification.otp-verification").findMany({
      filters: { email: normalizedEmail },
    });

    if (existing.length > 0) {
      await strapi.documents("api::otp-verification.otp-verification").update({
        documentId: existing[0].documentId,
        data: {
          codeHash: hash,
          expiresAt: expiresAt.toISOString(),
          attempts: 0,
          verified: false,
        },
      });
    } else {
      await strapi.documents("api::otp-verification.otp-verification").create({
        data: {
          email: normalizedEmail,
          codeHash: hash,
          expiresAt: expiresAt.toISOString(),
          attempts: 0,
          verified: false,
        },
      });
    }

    // Send email
    await strapi.plugin("email").service("email").send({
      to: normalizedEmail,
      subject: "Your CFC Events Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Your Verification Code</h2>
          <p>Use the following code to sign in to CFC Events:</p>
          <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 8px; font-weight: bold; border-radius: 8px; margin: 20px 0;">
            ${code}
          </div>
          <p style="color: #666;">This code expires in ${OTP_EXPIRY_MINUTES} minutes.</p>
          <p style="color: #999; font-size: 12px;">If you didn't request this code, you can safely ignore this email.</p>
        </div>
      `,
    });

    return { success: true };
  },

  async verifyOtp(email: string, code: string) {
    const normalizedEmail = email.toLowerCase().trim();

    const records = await strapi.documents("api::otp-verification.otp-verification").findMany({
      filters: { email: normalizedEmail },
    });

    if (records.length === 0) {
      throw new Error("No OTP found for this email. Please request a new code.");
    }

    const otpRecord = records[0];

    // Check expiry
    if (new Date(otpRecord.expiresAt) < new Date()) {
      throw new Error("OTP has expired. Please request a new code.");
    }

    // Check attempts
    if (otpRecord.attempts >= MAX_ATTEMPTS) {
      throw new Error("Too many failed attempts. Please request a new code.");
    }

    // Increment attempts
    await strapi.documents("api::otp-verification.otp-verification").update({
      documentId: otpRecord.documentId,
      data: { attempts: otpRecord.attempts + 1 },
    });

    // Verify code
    const isValid = await bcrypt.compare(code, otpRecord.codeHash);
    if (!isValid) {
      throw new Error("Invalid verification code.");
    }

    // Mark as verified
    await strapi.documents("api::otp-verification.otp-verification").update({
      documentId: otpRecord.documentId,
      data: { verified: true },
    });

    // Find or create user
    const userService = strapi.plugin("users-permissions").service("user");
    let users = await userService.fetchAll({
      filters: { email: normalizedEmail },
    });

    let user;
    if (users.length > 0) {
      user = users[0];
    } else {
      // Get the default authenticated role
      const defaultRole = await strapi
        .query("plugin::users-permissions.role")
        .findOne({ where: { type: "authenticated" } });

      user = await userService.add({
        email: normalizedEmail,
        username: normalizedEmail,
        provider: "local",
        confirmed: true,
        blocked: false,
        role: defaultRole ? defaultRole.id : 1,
      });
    }

    // Issue JWT
    const jwt = strapi.plugin("users-permissions").service("jwt").issue({ id: user.id });

    return { jwt, user: { id: user.id, email: user.email, username: user.username } };
  },

  async getMe(userId: number) {
    const user = await strapi
      .query("plugin::users-permissions.user")
      .findOne({
        where: { id: userId },
        populate: ["role"],
      });

    if (!user) {
      throw new Error("User not found.");
    }

    // Fetch entitlements for this user
    const entitlements = await strapi.documents("api::entitlement.entitlement").findMany({
      filters: { user: { id: userId } },
      populate: ["event", "session"],
    });

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name || null,
      isEventAdmin: user.isEventAdmin || false,
      role: user.role,
      entitlements,
    };
  },
});

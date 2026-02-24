export default {
  async sendOtp(ctx) {
    const { email } = ctx.request.body;

    if (!email) {
      return ctx.badRequest("Email is required.");
    }

    try {
      const result = await strapi.service("api::auth.auth").sendOtp(email);
      ctx.body = result;
    } catch (error) {
      strapi.log.error("Send OTP error:", error);
      return ctx.badRequest(error.message);
    }
  },

  async verifyOtp(ctx) {
    const { email, code } = ctx.request.body;

    if (!email || !code) {
      return ctx.badRequest("Email and code are required.");
    }

    try {
      const result = await strapi.service("api::auth.auth").verifyOtp(email, code);
      ctx.body = result;
    } catch (error) {
      strapi.log.error("Verify OTP error:", error);
      return ctx.badRequest(error.message);
    }
  },

  async me(ctx) {
    const token = ctx.request.header.authorization?.replace("Bearer ", "");

    if (!token) {
      return ctx.unauthorized("No token provided.");
    }

    try {
      const payload = await strapi.plugin("users-permissions").service("jwt").verify(token);

      if (!payload?.id) {
        return ctx.unauthorized("Invalid token.");
      }

      const result = await strapi.service("api::auth.auth").getMe(payload.id);
      ctx.body = result;
    } catch (error) {
      strapi.log.error("Get me error:", error);
      return ctx.unauthorized("Invalid or expired token.");
    }
  },
};

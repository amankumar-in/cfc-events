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
    const userId = ctx.state.user?.id;

    if (!userId) {
      return ctx.unauthorized("You must be logged in.");
    }

    try {
      const result = await strapi.service("api::auth.auth").getMe(userId);
      ctx.body = result;
    } catch (error) {
      strapi.log.error("Get me error:", error);
      return ctx.internalServerError(error.message);
    }
  },
};

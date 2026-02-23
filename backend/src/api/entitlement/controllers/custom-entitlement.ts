export default {
  async check(ctx) {
    const userId = ctx.state.user?.id;
    if (!userId) {
      return ctx.unauthorized("You must be logged in.");
    }

    const { eventId, sessionId } = ctx.query;

    if (!eventId && !sessionId) {
      return ctx.badRequest("eventId or sessionId is required.");
    }

    try {
      const result = await strapi
        .service("api::entitlement.custom-entitlement")
        .checkAccess(userId, eventId, sessionId);
      ctx.body = result;
    } catch (error) {
      strapi.log.error("Entitlement check error:", error);
      return ctx.internalServerError(error.message);
    }
  },

  async grant(ctx) {
    const userId = ctx.state.user?.id;
    if (!userId) {
      return ctx.unauthorized("You must be logged in.");
    }

    const { eventId, sessionId, source, ticketId } = ctx.request.body;

    if (!eventId) {
      return ctx.badRequest("eventId is required.");
    }

    try {
      const entitlement = await strapi
        .service("api::entitlement.custom-entitlement")
        .grantEntitlement(userId, eventId, sessionId, source, ticketId);
      ctx.body = entitlement;
    } catch (error) {
      strapi.log.error("Entitlement grant error:", error);
      return ctx.internalServerError(error.message);
    }
  },
};

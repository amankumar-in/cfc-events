export default {
  async createRoom(ctx) {
    const user = ctx.state.user;
    if (!user?.isEventAdmin) {
      return ctx.forbidden("Only event admins can create rooms.");
    }

    const { sessionId } = ctx.request.body;
    if (!sessionId) {
      return ctx.badRequest("sessionId is required.");
    }

    try {
      const room = await strapi.service("api::daily.daily").createRoom(sessionId);
      ctx.body = room;
    } catch (error) {
      strapi.log.error("Create room error:", error);
      return ctx.badRequest(error.message);
    }
  },

  async meetingToken(ctx) {
    const { sessionId, userName } = ctx.request.body;
    if (!sessionId) {
      return ctx.badRequest("sessionId is required.");
    }

    const userId = ctx.state.user?.id;

    try {
      const result = await strapi
        .service("api::daily.daily")
        .generateMeetingToken(sessionId, userId, userName);
      ctx.body = result;
    } catch (error) {
      strapi.log.error("Meeting token error:", error);
      return ctx.badRequest(error.message);
    }
  },

  async sendAction(ctx) {
    const user = ctx.state.user;
    if (!user?.isEventAdmin) {
      return ctx.forbidden("Only event admins can send actions.");
    }

    const { roomName, action } = ctx.request.body;
    if (!roomName || !action) {
      return ctx.badRequest("roomName and action are required.");
    }

    try {
      const result = await strapi.service("api::daily.daily").sendAction(roomName, action);
      ctx.body = result;
    } catch (error) {
      strapi.log.error("Send action error:", error);
      return ctx.badRequest(error.message);
    }
  },

  async deleteRoom(ctx) {
    const user = ctx.state.user;
    if (!user?.isEventAdmin) {
      return ctx.forbidden("Only event admins can delete rooms.");
    }

    const { roomName } = ctx.params;
    if (!roomName) {
      return ctx.badRequest("roomName is required.");
    }

    try {
      const result = await strapi.service("api::daily.daily").deleteRoom(roomName);
      ctx.body = result;
    } catch (error) {
      strapi.log.error("Delete room error:", error);
      return ctx.badRequest(error.message);
    }
  },
};

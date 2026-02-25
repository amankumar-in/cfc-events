import { rateLimit, getClientIP } from "../utils/rate-limit";
import { validateActionPayload } from "../utils/validate-action";

async function resolveUser(ctx) {
  if (ctx.state.user) return ctx.state.user;
  const token = ctx.request.header.authorization?.replace("Bearer ", "");
  if (!token) return null;
  try {
    const payload = await strapi.plugin("users-permissions").service("jwt").verify(token);
    if (!payload?.id) return null;
    const user = await strapi.query("plugin::users-permissions.user").findOne({ where: { id: payload.id } });
    ctx.state.user = user;
    return user;
  } catch {
    return null;
  }
}

export default {
  async createRoom(ctx) {
    const ip = getClientIP(ctx);
    if (!rateLimit(`create-room:${ip}`, 5, 60000)) {
      return ctx.tooManyRequests("Rate limit exceeded. Try again later.");
    }

    const user = await resolveUser(ctx);
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
    const ip = getClientIP(ctx);
    if (!rateLimit(`meeting-token:${ip}`, 20, 60000)) {
      return ctx.tooManyRequests("Rate limit exceeded. Try again later.");
    }

    const { sessionId, userName } = ctx.request.body;
    if (!sessionId) {
      return ctx.badRequest("sessionId is required.");
    }

    const user = await resolveUser(ctx);
    const userId = user?.id;

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
    const ip = getClientIP(ctx);
    if (!rateLimit(`send-action:${ip}`, 30, 60000)) {
      return ctx.tooManyRequests("Rate limit exceeded. Try again later.");
    }

    const user = await resolveUser(ctx);
    if (!user?.isEventAdmin) {
      return ctx.forbidden("Only event admins can send actions.");
    }

    const { roomName, action } = ctx.request.body;
    if (!roomName || !action) {
      return ctx.badRequest("roomName and action are required.");
    }

    const validation = validateActionPayload(action);
    if (!validation.valid) {
      return ctx.badRequest(validation.error);
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
    const user = await resolveUser(ctx);
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

  async goLive(ctx) {
    const user = await resolveUser(ctx);
    if (!user) {
      return ctx.unauthorized("Authentication required.");
    }

    const { sessionId } = ctx.request.body;
    if (!sessionId) {
      return ctx.badRequest("sessionId is required.");
    }

    try {
      const result = await strapi.service("api::daily.daily").goLive(sessionId, user.id);
      ctx.body = result;
    } catch (error) {
      strapi.log.error("Go live error:", error);
      return ctx.badRequest(error.message);
    }
  },

  async endSession(ctx) {
    const user = await resolveUser(ctx);
    if (!user) {
      return ctx.unauthorized("Authentication required.");
    }

    const { sessionId } = ctx.request.body;
    if (!sessionId) {
      return ctx.badRequest("sessionId is required.");
    }

    try {
      const result = await strapi.service("api::daily.daily").endSession(sessionId, user.id);
      ctx.body = result;
    } catch (error) {
      strapi.log.error("End session error:", error);
      return ctx.badRequest(error.message);
    }
  },

  async webhook(ctx) {
    const event = ctx.request.body;

    strapi.log.info(`[Daily Webhook] Incoming: ${event?.type || "unknown"}`);

    try {
      const result = await strapi.service("api::daily.daily").handleWebhook(event);
      ctx.body = result;
    } catch (error) {
      strapi.log.error("[Daily Webhook] Error processing webhook:", error);
      ctx.body = { ok: false, error: error.message };
    }
  },

  // -- Chat persistence --

  async saveChatMessage(ctx) {
    const ip = getClientIP(ctx);
    if (!rateLimit(`chat:${ip}`, 60, 60000)) {
      return ctx.tooManyRequests("Rate limit exceeded.");
    }

    const { sessionId, senderName, message, timestamp, senderId, messageId } = ctx.request.body;
    if (!sessionId || !senderName || !message || !messageId) {
      return ctx.badRequest("sessionId, senderName, message, and messageId are required.");
    }

    try {
      const result = await strapi.service("api::daily.daily").saveChatMessage({
        sessionId, senderName, message, timestamp: timestamp || new Date().toISOString(), senderId: senderId || null, messageId,
      });
      ctx.body = result;
    } catch (error) {
      strapi.log.error("Save chat message error:", error);
      return ctx.badRequest(error.message);
    }
  },

  async getChatMessages(ctx) {
    const { sessionId } = ctx.params;
    if (!sessionId) return ctx.badRequest("sessionId is required.");

    try {
      const result = await strapi.service("api::daily.daily").getChatMessages(sessionId);
      ctx.body = result;
    } catch (error) {
      strapi.log.error("Get chat messages error:", error);
      return ctx.badRequest(error.message);
    }
  },

  async deleteChatMessage(ctx) {
    const user = await resolveUser(ctx);
    if (!user?.isEventAdmin) return ctx.forbidden("Only event admins can delete chat messages.");

    const { messageId } = ctx.params;
    if (!messageId) return ctx.badRequest("messageId is required.");

    try {
      const result = await strapi.service("api::daily.daily").deleteChatMessage(messageId);
      ctx.body = result;
    } catch (error) {
      strapi.log.error("Delete chat message error:", error);
      return ctx.badRequest(error.message);
    }
  },

  // -- Actions persistence (late joiners) --

  async saveAction(ctx) {
    const user = await resolveUser(ctx);
    if (!user?.isEventAdmin) return ctx.forbidden("Only event admins can save actions.");

    const { sessionId, type, payload } = ctx.request.body;
    if (!sessionId || !type) return ctx.badRequest("sessionId and type are required.");

    try {
      const result = await strapi.service("api::daily.daily").saveAction(sessionId, type, payload);
      ctx.body = result;
    } catch (error) {
      strapi.log.error("Save action error:", error);
      return ctx.badRequest(error.message);
    }
  },

  async getActions(ctx) {
    const { sessionId } = ctx.params;
    if (!sessionId) return ctx.badRequest("sessionId is required.");

    try {
      const result = await strapi.service("api::daily.daily").getActions(sessionId);
      ctx.body = result;
    } catch (error) {
      strapi.log.error("Get actions error:", error);
      return ctx.badRequest(error.message);
    }
  },

  async removeAction(ctx) {
    const user = await resolveUser(ctx);
    if (!user?.isEventAdmin) return ctx.forbidden("Only event admins can remove actions.");

    const { actionId } = ctx.params;
    if (!actionId) return ctx.badRequest("actionId is required.");

    try {
      const result = await strapi.service("api::daily.daily").removeAction(actionId);
      ctx.body = result;
    } catch (error) {
      strapi.log.error("Remove action error:", error);
      return ctx.badRequest(error.message);
    }
  },

  // -- Attendance tracking --

  async recordJoin(ctx) {
    const { sessionId, userId, userName } = ctx.request.body;
    if (!sessionId) return ctx.badRequest("sessionId is required.");

    try {
      const result = await strapi.service("api::daily.daily").recordJoin(sessionId, userId, userName);
      ctx.body = result;
    } catch (error) {
      strapi.log.error("Record join error:", error);
      return ctx.badRequest(error.message);
    }
  },

  async recordLeave(ctx) {
    const { sessionId, attendanceId } = ctx.request.body;
    if (!attendanceId) return ctx.badRequest("attendanceId is required.");

    try {
      const result = await strapi.service("api::daily.daily").recordLeave(attendanceId);
      ctx.body = result;
    } catch (error) {
      strapi.log.error("Record leave error:", error);
      return ctx.badRequest(error.message);
    }
  },

  // -- Room management --

  async updateRoom(ctx) {
    const user = await resolveUser(ctx);
    if (!user?.isEventAdmin) return ctx.forbidden("Only event admins can update rooms.");

    const { roomName, properties } = ctx.request.body;
    if (!roomName || !properties) return ctx.badRequest("roomName and properties are required.");

    try {
      const result = await strapi.service("api::daily.daily").updateRoomProperties(roomName, properties);
      ctx.body = result;
    } catch (error) {
      strapi.log.error("Update room error:", error);
      return ctx.badRequest(error.message);
    }
  },
};

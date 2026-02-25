const DAILY_API_BASE = "https://api.daily.co/v1";

// In-memory action store for late joiners
const activeActionsStore = new Map<string, { id: string; type: string; payload: any; createdAt: string }[]>();
let actionCounter = 0;

function getDailyHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
  };
}

export default () => ({
  async createRoom(sessionId: string) {
    // Find the session to get stream type and details
    const session = await strapi.documents("api::session.session").findOne({
      documentId: sessionId,
      populate: ["event"],
    });

    if (!session) {
      throw new Error("Session not found.");
    }

    // Dedup: if this session already has a Daily room, return existing info
    if (session.dailyRoomUrl && session.dailyRoomName) {
      strapi.log.info(
        `Session ${sessionId} already has a room: ${session.dailyRoomName}. Returning existing room.`
      );
      return {
        name: session.dailyRoomName,
        url: session.dailyRoomUrl,
        existing: true,
      };
    }

    // Room expires 2 hours after session EndDate, with a minimum of 24h from now
    const minExp = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
    const endDateExp = session.EndDate
      ? Math.floor(new Date(session.EndDate as string).getTime() / 1000) + 2 * 60 * 60
      : 0;
    const exp = Math.max(minExp, endDateExp);

    const roomProperties: Record<string, any> = {
      privacy: "private",
      properties: {
        exp,
        enable_chat: true,
        enable_screenshare: true,
        enable_knocking: false,
      },
    };

    // Configure based on stream type
    if (session.streamType === "livestream") {
      // Broadcasting is controlled per-participant via token permissions
      // (canSend: false for viewers). Do NOT set owner_only_broadcast —
      // it overrides updateParticipant() permission grants and breaks
      // the promote-viewer-to-speaker flow.
      roomProperties.properties.enable_recording = "cloud";
    } else if (session.streamType === "call") {
      roomProperties.properties.owner_only_broadcast = false;
      roomProperties.properties.max_participants = session.MaxAttendees || 50;
    }

    const response = await fetch(`${DAILY_API_BASE}/rooms`, {
      method: "POST",
      headers: getDailyHeaders(),
      body: JSON.stringify(roomProperties),
    });

    if (!response.ok) {
      const error = (await response.json()) as Record<string, unknown>;
      throw new Error(`Daily.co API error: ${error.info || response.statusText}`);
    }

    const room = (await response.json()) as Record<string, unknown>;

    // Update session with room details and publish
    await strapi.documents("api::session.session").update({
      documentId: sessionId,
      data: {
        dailyRoomName: room.name as string,
        dailyRoomUrl: room.url as string,
      },
    });
    await strapi.documents("api::session.session").publish({
      documentId: sessionId,
    });

    return room;
  },

  async generateMeetingToken(sessionId: string, userId?: number, userName?: string) {
    // Find the session with event populated
    const session = await strapi.documents("api::session.session").findOne({
      documentId: sessionId,
      populate: ["event"],
    });

    if (!session) {
      throw new Error("Session not found.");
    }

    if (!session.dailyRoomName) {
      throw new Error("No Daily.co room configured for this session.");
    }

    // Resolve effective access mode: session override > event default
    const eventAccessMode = (session.event as any)?.accessMode ?? "open";
    const effectiveAccess = (session as any).accessOverride ?? eventAccessMode;

    // Determine user role: admin, speaker, or attendee
    let isOwner = false;
    let isSpeaker = false;
    let user: any = null;
    if (userId) {
      user = await strapi
        .query("plugin::users-permissions.user")
        .findOne({ where: { id: userId } });
      isOwner = user?.isEventAdmin || false;

      // Check if user is a speaker for this session
      const sessionWithSpeakers = await strapi.documents("api::session.session").findOne({
        documentId: sessionId,
        populate: ["speakers"],
      });
      if (sessionWithSpeakers?.speakers) {
        const speakerEmails = (sessionWithSpeakers.speakers as { Email?: string }[]).map(
          (s) => s.Email?.toLowerCase()
        );
        isSpeaker = speakerEmails.includes(user?.email?.toLowerCase());
      }
    }

    // Enforce access control (admins and speakers always bypass)
    if (!isOwner && !isSpeaker) {
      if (effectiveAccess === "registration") {
        if (!userId) {
          throw new Error("You must be logged in to join this session.");
        }
        // User is authenticated — registration requirement satisfied
      }

      if (effectiveAccess === "ticketed") {
        if (!userId) {
          throw new Error("You must be logged in to join this ticketed session.");
        }
        // Check entitlement — must have a valid ticket
        const entitlement = await strapi
          .service("api::entitlement.custom-entitlement")
          .checkAccess(userId, (session.event as any)?.id, sessionId);
        if (!entitlement?.hasAccess) {
          throw new Error(
            "You need a valid ticket to access this session. Please purchase a ticket or check your entitlements."
          );
        }
      }
      // "open" mode: anyone can join, no checks needed

      // Block viewers from joining ended sessions
      if ((session as any).liveStatus === "ended") {
        throw new Error("This session has ended.");
      }
    }

    const isLivestream = session.streamType === "livestream";

    const tokenProperties: Record<string, any> = {
      properties: {
        room_name: session.dailyRoomName,
        is_owner: isOwner || isSpeaker,
        exp: Math.floor(Date.now() / 1000) + 4 * 60 * 60, // 4 hours
      },
    };

    // Livestream viewers can only receive, not send
    if (isLivestream && !isOwner && !isSpeaker) {
      tokenProperties.properties.enable_screenshare = false;
      tokenProperties.properties.start_video_off = true;
      tokenProperties.properties.start_audio_off = true;
      tokenProperties.properties.permissions = { canSend: false };
    }

    if (userName) {
      tokenProperties.properties.user_name = userName;
    }

    if (userId) {
      tokenProperties.properties.user_id = String(userId);
    }

    const response = await fetch(`${DAILY_API_BASE}/meeting-tokens`, {
      method: "POST",
      headers: getDailyHeaders(),
      body: JSON.stringify(tokenProperties),
    });

    if (!response.ok) {
      const error = (await response.json()) as Record<string, unknown>;
      throw new Error(`Daily.co API error: ${error.info || response.statusText}`);
    }

    const tokenData = (await response.json()) as Record<string, unknown>;
    return { token: tokenData.token, roomUrl: session.dailyRoomUrl };
  },

  async sendAction(roomName: string, action: Record<string, any>) {
    const response = await fetch(`${DAILY_API_BASE}/rooms/${roomName}/send-app-message`, {
      method: "POST",
      headers: getDailyHeaders(),
      body: JSON.stringify({ data: action }),
    });

    if (!response.ok) {
      const error = (await response.json()) as Record<string, unknown>;
      throw new Error(`Daily.co API error: ${error.info || response.statusText}`);
    }

    return await response.json();
  },

  async deleteRoom(roomName: string) {
    const response = await fetch(`${DAILY_API_BASE}/rooms/${roomName}`, {
      method: "DELETE",
      headers: getDailyHeaders(),
    });

    if (!response.ok) {
      const error = (await response.json()) as Record<string, unknown>;
      throw new Error(`Daily.co API error: ${error.info || response.statusText}`);
    }

    // Clean up session references
    const sessions = await strapi.documents("api::session.session").findMany({
      filters: { dailyRoomName: roomName },
    });

    for (const session of sessions) {
      await strapi.documents("api::session.session").update({
        documentId: session.documentId,
        data: {
          dailyRoomName: null,
          dailyRoomUrl: null,
        },
      });
      await strapi.documents("api::session.session").publish({
        documentId: session.documentId,
      });
    }

    return { deleted: true };
  },

  async goLive(sessionId: string, userId: number) {
    // Verify the user is an admin
    const user = await strapi
      .query("plugin::users-permissions.user")
      .findOne({ where: { id: userId } });

    if (!user?.isEventAdmin) {
      throw new Error("Only event admins can start a live session.");
    }

    // Find the session
    const session = await strapi.documents("api::session.session").findOne({
      documentId: sessionId,
    });

    if (!session) {
      throw new Error("Session not found.");
    }

    // Update liveStatus to "live"
    const updated = await strapi.documents("api::session.session").update({
      documentId: sessionId,
      data: {
        liveStatus: "live",
      },
    });

    // Publish the update
    await strapi.documents("api::session.session").publish({
      documentId: sessionId,
    });

    // Broadcast session status to room via Daily.co REST API
    if (session.dailyRoomName) {
      try {
        await fetch(`${DAILY_API_BASE}/rooms/${session.dailyRoomName}/send-app-message`, {
          method: "POST",
          headers: getDailyHeaders(),
          body: JSON.stringify({ data: { type: "session-status", status: "live" } }),
        });
      } catch (err) {
        strapi.log.warn("Failed to broadcast go-live status:", err);
      }
    }

    // Audit log
    this.auditLog(sessionId, String(userId), "go-live");

    return updated;
  },

  async endSession(sessionId: string, userId: number) {
    // Verify the user is an admin
    const user = await strapi
      .query("plugin::users-permissions.user")
      .findOne({ where: { id: userId } });

    if (!user?.isEventAdmin) {
      throw new Error("Only event admins can end a session.");
    }

    // Find the session
    const session = await strapi.documents("api::session.session").findOne({
      documentId: sessionId,
    });

    if (!session) {
      throw new Error("Session not found.");
    }

    // Update liveStatus to "ended"
    const updated = await strapi.documents("api::session.session").update({
      documentId: sessionId,
      data: {
        liveStatus: "ended",
      },
    });

    // Publish the update
    await strapi.documents("api::session.session").publish({
      documentId: sessionId,
    });

    // Broadcast session status to room via Daily.co REST API
    if (session.dailyRoomName) {
      try {
        await fetch(`${DAILY_API_BASE}/rooms/${session.dailyRoomName}/send-app-message`, {
          method: "POST",
          headers: getDailyHeaders(),
          body: JSON.stringify({ data: { type: "session-status", status: "ended" } }),
        });
      } catch (err) {
        strapi.log.warn("Failed to broadcast end-session status:", err);
      }

      // Clean up in-memory actions for this session
      activeActionsStore.delete(sessionId);
    }

    // Audit log
    this.auditLog(sessionId, String(userId), "end-session");

    return updated;
  },

  async handleWebhook(event: Record<string, any>) {
    strapi.log.info(`[Daily Webhook] Received event: ${event.type}`, JSON.stringify(event));

    if (event.type === "recording.ready-to-download") {
      const payload = event.payload || event;
      const roomName = payload.room_name;
      const recordingId = payload.recording_id;
      const downloadLink = payload.download_link;

      strapi.log.info(
        `[Daily Webhook] Recording ready — room: ${roomName}, recording_id: ${recordingId}`
      );

      if (!roomName) {
        strapi.log.warn("[Daily Webhook] No room_name in recording event, skipping.");
        return { ok: true, skipped: true };
      }

      // Find session by dailyRoomName
      const sessions = await strapi.documents("api::session.session").findMany({
        filters: { dailyRoomName: roomName },
      });

      if (!sessions || sessions.length === 0) {
        strapi.log.warn(
          `[Daily Webhook] No session found for room: ${roomName}`
        );
        return { ok: true, skipped: true };
      }

      const session = sessions[0];

      // Update recording URL on the session
      await strapi.documents("api::session.session").update({
        documentId: session.documentId,
        data: {
          recordingUrl: downloadLink,
        },
      });
      await strapi.documents("api::session.session").publish({
        documentId: session.documentId,
      });

      strapi.log.info(
        `[Daily Webhook] Updated session ${session.documentId} with recording URL.`
      );

      return { ok: true, sessionId: session.documentId, recordingId };
    }

    // Unhandled event type — acknowledge but do nothing
    strapi.log.info(`[Daily Webhook] Unhandled event type: ${event.type}`);
    return { ok: true, unhandled: true };
  },

  // -- Audit logging --

  async auditLog(sessionId: string, userId: string | null, action: string, details?: any) {
    try {
      await strapi.documents("api::session-audit-log.session-audit-log").create({
        data: {
          sessionId,
          userId: userId ? String(userId) : null,
          action,
          details: details || null,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err) {
      strapi.log.warn(`[Audit] Failed to log: ${action}`, err);
    }
  },

  // -- Chat persistence --

  async saveChatMessage(data: {
    sessionId: string;
    senderName: string;
    message: string;
    timestamp: string;
    senderId: string | null;
    messageId: string;
  }) {
    return strapi.documents("api::chat-message.chat-message").create({ data });
  },

  async getChatMessages(sessionId: string) {
    return strapi.documents("api::chat-message.chat-message").findMany({
      filters: { sessionId },
      sort: { timestamp: "asc" },
    });
  },

  async deleteChatMessage(messageId: string) {
    const entries = await strapi.documents("api::chat-message.chat-message").findMany({
      filters: { messageId },
    });
    for (const entry of entries) {
      await strapi.documents("api::chat-message.chat-message").delete({
        documentId: entry.documentId,
      });
    }
    return { deleted: true, messageId };
  },

  // -- Actions persistence (late joiners) --

  saveAction(sessionId: string, type: string, payload: any) {
    const id = `action-${++actionCounter}-${Date.now()}`;
    const actions = activeActionsStore.get(sessionId) || [];
    const entry = { id, type, payload, createdAt: new Date().toISOString() };
    actions.push(entry);
    activeActionsStore.set(sessionId, actions);
    return entry;
  },

  getActions(sessionId: string) {
    return activeActionsStore.get(sessionId) || [];
  },

  removeAction(actionId: string) {
    for (const [sessionId, actions] of activeActionsStore.entries()) {
      const filtered = actions.filter((a) => a.id !== actionId);
      if (filtered.length !== actions.length) {
        activeActionsStore.set(sessionId, filtered);
        return { deleted: true, actionId };
      }
    }
    return { deleted: false, actionId };
  },

  // -- Attendance tracking --

  async recordJoin(sessionId: string, userId?: string, userName?: string) {
    const entry = await strapi.documents("api::session-attendance.session-attendance").create({
      data: {
        sessionId,
        userId: userId ? String(userId) : null,
        userName: userName || "Guest",
        joinedAt: new Date().toISOString(),
      },
    });
    return { attendanceId: entry.documentId };
  },

  async recordLeave(attendanceId: string) {
    await strapi.documents("api::session-attendance.session-attendance").update({
      documentId: attendanceId,
      data: { leftAt: new Date().toISOString() },
    });
    return { updated: true };
  },

  // -- Room management --

  async updateRoomProperties(roomName: string, properties: Record<string, any>) {
    const response = await fetch(`${DAILY_API_BASE}/rooms/${roomName}`, {
      method: "POST",
      headers: getDailyHeaders(),
      body: JSON.stringify({ properties }),
    });

    if (!response.ok) {
      const error = (await response.json()) as Record<string, unknown>;
      throw new Error(`Daily.co API error: ${error.info || response.statusText}`);
    }

    return response.json();
  },
});

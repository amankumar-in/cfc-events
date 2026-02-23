const DAILY_API_BASE = "https://api.daily.co/v1";

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

    const roomProperties: Record<string, any> = {
      privacy: "private",
      properties: {
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
        enable_chat: true,
        enable_screenshare: true,
        enable_knocking: false,
      },
    };

    // Configure based on stream type
    if (session.streamType === "livestream") {
      roomProperties.properties.owner_only_broadcast = true;
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

    // Update session with room details
    await strapi.documents("api::session.session").update({
      documentId: sessionId,
      data: {
        dailyRoomName: room.name as string,
        dailyRoomUrl: room.url as string,
      },
    });

    return room;
  },

  async generateMeetingToken(sessionId: string, userId?: number, userName?: string) {
    // Find the session
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

    // Determine user role: admin, speaker, or attendee
    let isOwner = false;
    let isSpeaker = false;
    if (userId) {
      const user = await strapi
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
    }

    return { deleted: true };
  },
});

export default {
  routes: [
    {
      method: "POST",
      path: "/daily/create-room",
      handler: "daily.createRoom",
      config: {
        auth: false,
        policies: [],
      },
    },
    {
      method: "POST",
      path: "/daily/meeting-token",
      handler: "daily.meetingToken",
      config: {
        auth: false,
        policies: [],
      },
    },
    {
      method: "POST",
      path: "/daily/send-action",
      handler: "daily.sendAction",
      config: {
        auth: false,
        policies: [],
      },
    },
    {
      method: "DELETE",
      path: "/daily/rooms/:roomName",
      handler: "daily.deleteRoom",
      config: {
        auth: false,
        policies: [],
      },
    },
    {
      method: "POST",
      path: "/daily/go-live",
      handler: "daily.goLive",
      config: {
        auth: false,
        policies: [],
      },
    },
    {
      method: "POST",
      path: "/daily/end-session",
      handler: "daily.endSession",
      config: {
        auth: false,
        policies: [],
      },
    },
    {
      method: "POST",
      path: "/daily/webhook",
      handler: "daily.webhook",
      config: {
        auth: false,
        policies: [],
      },
    },
    // Chat persistence
    {
      method: "POST",
      path: "/daily/chat-message",
      handler: "daily.saveChatMessage",
      config: { auth: false, policies: [] },
    },
    {
      method: "GET",
      path: "/daily/chat-messages/:sessionId",
      handler: "daily.getChatMessages",
      config: { auth: false, policies: [] },
    },
    {
      method: "DELETE",
      path: "/daily/chat-message/:messageId",
      handler: "daily.deleteChatMessage",
      config: { auth: false, policies: [] },
    },
    // Actions persistence (late joiners)
    {
      method: "POST",
      path: "/daily/actions",
      handler: "daily.saveAction",
      config: { auth: false, policies: [] },
    },
    {
      method: "GET",
      path: "/daily/actions/:sessionId",
      handler: "daily.getActions",
      config: { auth: false, policies: [] },
    },
    {
      method: "DELETE",
      path: "/daily/actions/:actionId",
      handler: "daily.removeAction",
      config: { auth: false, policies: [] },
    },
    // Attendance tracking
    {
      method: "POST",
      path: "/daily/attendance/join",
      handler: "daily.recordJoin",
      config: { auth: false, policies: [] },
    },
    {
      method: "POST",
      path: "/daily/attendance/leave",
      handler: "daily.recordLeave",
      config: { auth: false, policies: [] },
    },
    // Room management
    {
      method: "POST",
      path: "/daily/update-room",
      handler: "daily.updateRoom",
      config: { auth: false, policies: [] },
    },
  ],
};

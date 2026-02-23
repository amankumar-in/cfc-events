export default {
  routes: [
    {
      method: "POST",
      path: "/daily/create-room",
      handler: "daily.createRoom",
      config: {
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
        policies: [],
      },
    },
    {
      method: "DELETE",
      path: "/daily/rooms/:roomName",
      handler: "daily.deleteRoom",
      config: {
        policies: [],
      },
    },
  ],
};

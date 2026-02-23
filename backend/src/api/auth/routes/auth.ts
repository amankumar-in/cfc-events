export default {
  routes: [
    {
      method: "POST",
      path: "/auth/send-otp",
      handler: "auth.sendOtp",
      config: {
        auth: false,
        policies: [],
      },
    },
    {
      method: "POST",
      path: "/auth/verify-otp",
      handler: "auth.verifyOtp",
      config: {
        auth: false,
        policies: [],
      },
    },
    {
      method: "GET",
      path: "/auth/me",
      handler: "auth.me",
      config: {
        policies: [],
      },
    },
  ],
};

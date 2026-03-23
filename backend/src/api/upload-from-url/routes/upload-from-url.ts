export default {
  routes: [
    {
      method: "POST",
      path: "/upload-from-url",
      handler: "upload-from-url.create",
      config: {
        auth: false,
      },
    },
  ],
};

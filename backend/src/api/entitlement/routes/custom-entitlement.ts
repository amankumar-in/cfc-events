export default {
  routes: [
    {
      method: "GET",
      path: "/entitlements/check",
      handler: "custom-entitlement.check",
      config: {
        policies: [],
      },
    },
    {
      method: "POST",
      path: "/entitlements/grant",
      handler: "custom-entitlement.grant",
      config: {
        policies: [],
      },
    },
  ],
};

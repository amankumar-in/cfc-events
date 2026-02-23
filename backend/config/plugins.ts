export default ({ env }) => ({
  email: {
    config: {
      provider: "@strapi/provider-email-nodemailer",
      providerOptions: {
        host: env("EMAIL_HOST", "smtp.zeptomail.com"),
        port: env.int("EMAIL_PORT", 587),
        secure: env.bool("EMAIL_SECURE", false),
        auth: {
          user: env("EMAIL_USER"),
          pass: env("EMAIL_PASSWORD"),
        },
      },
      settings: {
        defaultFrom: env(
          "EMAIL_FROM",
          "UNITE Expo <tickets@rewardsforeducation.com>"
        ),
        defaultReplyTo: env(
          "EMAIL_FROM",
          "UNITE Expo <tickets@rewardsforeducation.com>"
        ),
      },
    },
  },
});

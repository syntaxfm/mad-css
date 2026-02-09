import * as Sentry from "@sentry/tanstackstart-react";
Sentry.init({
  dsn: "https://43666a9f711885c4eb9074799595bd79@o4505358925561856.ingest.us.sentry.io/4510857579003904",
  // Adds request headers and IP for users, for more info visit:
  // https://docs.sentry.io/platforms/javascript/guides/tanstackstart-react/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
  enableLogs: true,
});


import * as Sentry from "@sentry/tanstackstart-react";
Sentry.init({
  dsn: "https://43666a9f711885c4eb9074799595bd79@o4505358925561856.ingest.us.sentry.io/4510857579003904",
  sendDefaultPii: true,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.2,
  enableLogs: true,
});


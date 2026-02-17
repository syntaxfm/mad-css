import * as Sentry from "@sentry/tanstackstart-react";
import { createRouter } from "@tanstack/react-router";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a new router instance
export const getRouter = () => {
	const router = createRouter({
		routeTree,
		context: {},

		scrollRestoration: true,
		defaultPreloadStaleTime: 0,
	});

	if (!router.isServer) {
		Sentry.init({
			dsn: "https://43666a9f711885c4eb9074799595bd79@o4505358925561856.ingest.us.sentry.io/4510857579003904",
			// https://docs.sentry.io/platforms/javascript/guides/tanstackstart-react/configuration/options/#sendDefaultPii
			sendDefaultPii: true,
			integrations: [Sentry.tanstackRouterBrowserTracingIntegration(router)],
			tracesSampleRate: import.meta.env.DEV ? 1.0 : 0.2,
			enableLogs: true,
		});
	}
	return router;
};

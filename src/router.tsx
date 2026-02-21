import * as Sentry from "@sentry/tanstackstart-react";
import { createRouter } from "@tanstack/react-router";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

const EXTENSION_ERROR_PATTERNS = [
	/runtime\.sendMessage\(\)/i,
	/extension context invalidated/i,
	/message port closed/i,
	/could not establish connection/i,
	/receiving end does not exist/i,
	/tab not found/i,
];

const EXTENSION_STACK_PATTERNS = [
	/chrome-extension:\/\//,
	/moz-extension:\/\//,
	/safari-web-extension:\/\//,
	/webkit-masked-url:\/\//,
];

function isThirdPartyExtensionError(event: Sentry.ErrorEvent): boolean {
	const message = event.message || event.exception?.values?.[0]?.value || "";

	if (EXTENSION_ERROR_PATTERNS.some((pattern) => pattern.test(message))) {
		return true;
	}

	const frames = event.exception?.values?.[0]?.stacktrace?.frames;
	if (
		frames?.some((frame) =>
			EXTENSION_STACK_PATTERNS.some((pattern) =>
				pattern.test(frame.filename ?? ""),
			),
		)
	) {
		return true;
	}

	return false;
}

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
			// Adds request headers and IP for users, for more info visit:
			// https://docs.sentry.io/platforms/javascript/guides/tanstackstart-react/configuration/options/#sendDefaultPii
			sendDefaultPii: true,
			integrations: [],
			enableLogs: true,
			beforeSend(event) {
				if (isThirdPartyExtensionError(event)) {
					return null;
				}
				return event;
			},
		});
	}
	return router;
};

// This is the TanStack Start server entry point. We use this to instrument the server with Sentry.
import "../instrument.server.mjs";
import * as Sentry from "@sentry/tanstackstart-react";
import handler, { createServerEntry } from "@tanstack/react-start/server-entry";

addEventListener("error", (event) => {
	if (event.error instanceof Error) {
		Sentry.captureException(event.error);
	}
});

addEventListener("unhandledrejection", (event: any) => {
	if (event.reason instanceof Error && "statusCode" in event.reason) return;
	if (event.reason instanceof Error) {
		Sentry.captureException(event.reason);
	}
});

export default createServerEntry({
	async fetch(request) {
		try {
			return await handler.fetch(request);
		} catch (error) {
			Sentry.captureException(error);
			await Sentry.flush(2000);
			throw error;
		}
	},
});

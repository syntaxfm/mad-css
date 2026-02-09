// This is the TanStack Start server entry point. We use this to instrument the server with Sentry.
import "../instrument.server.mjs";
import * as Sentry from "@sentry/tanstackstart-react";
import handler, { createServerEntry } from "@tanstack/react-start/server-entry";

// Global error handler to catch unhandled errors
addEventListener("error", (event) => {
	console.error("=== Global Error Handler ===");
	console.error("Error:", event.error);
	if (event.error instanceof Error) {
		Sentry.captureException(event.error);
		console.error("Message:", event.error.message);
		console.error("Stack:", event.error.stack);
	}
	console.error("===========================");
});

addEventListener("unhandledrejection", (event: any) => {
	if (event.reason instanceof Error && "statusCode" in event.reason) return;
	console.error("=== Unhandled Promise Rejection ===");
	console.error("Reason:", event.reason);
	if (event.reason instanceof Error) {
		Sentry.captureException(event.reason);
		console.error("Message:", event.reason.message);
		console.error("Stack:", event.reason.stack);
	}
	console.error("===================================");
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

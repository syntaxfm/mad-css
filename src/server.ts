// This is the TanStack Start server entry point. We use this to instrument the server with Sentry.
import "../instrument.server.mjs";
import * as Sentry from "@sentry/tanstackstart-react";
import handler, { createServerEntry } from "@tanstack/react-start/server-entry";

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

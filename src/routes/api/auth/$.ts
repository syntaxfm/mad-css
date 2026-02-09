import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";
import { createAuth } from "@/lib/auth";

export const Route = createFileRoute("/api/auth/$")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const auth = createAuth(env);
				return auth.handler(request);
			},
			POST: async ({ request }) => {
				const auth = createAuth(env);
				return auth.handler(request);
			},
		},
	},
});

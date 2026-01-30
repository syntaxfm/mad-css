import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";
import { createDb } from "@/db";
import { isAdminUser } from "@/lib/admin";
import { createAuth } from "@/lib/auth";

export const Route = createFileRoute("/api/admin/check")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const auth = createAuth(env.DB);
				const session = await auth.api.getSession({ headers: request.headers });

				if (!session?.user) {
					return new Response(JSON.stringify({ isAdmin: false }), {
						status: 200,
						headers: { "Content-Type": "application/json" },
					});
				}

				const db = createDb(env.DB);
				const isAdmin = await isAdminUser(db, session.user.id);

				return new Response(JSON.stringify({ isAdmin }), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				});
			},
		},
	},
});

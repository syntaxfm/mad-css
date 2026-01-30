import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";
import { createDb } from "@/db";
import { isAdminUser } from "@/lib/admin";
import { requireAuth } from "@/lib/middleware/auth";
import { recalculateAllUserScores } from "@/lib/scoring";

export const Route = createFileRoute("/api/leaderboard/calculate")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const authResult = await requireAuth(request, env.DB);
				if (!authResult.success) return authResult.response;

				const db = createDb(env.DB);
				const userId = authResult.user.id;

				// Server-side admin validation
				const isAdmin = await isAdminUser(db, userId);
				if (!isAdmin) {
					return new Response(JSON.stringify({ error: "Forbidden" }), {
						status: 403,
						headers: { "Content-Type": "application/json" },
					});
				}

				const result = await recalculateAllUserScores(env.DB);

				return new Response(
					JSON.stringify({
						success: true,
						updated: result.updated,
					}),
					{
						status: 200,
						headers: { "Content-Type": "application/json" },
					},
				);
			},
		},
	},
});

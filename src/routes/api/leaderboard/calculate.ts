import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";
import { recalculateAllUserScores } from "@/lib/scoring";

export const Route = createFileRoute("/api/leaderboard/calculate")({
	server: {
		handlers: {
			POST: async () => {
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

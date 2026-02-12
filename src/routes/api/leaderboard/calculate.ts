import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";
import { createDb } from "@/db";
import { isAdminUser } from "@/lib/admin";
import { requireAuth } from "@/lib/middleware/auth";
import { recalculateAllUserScores } from "@/lib/scoring";
import {
	SIMULATION_STAGES,
	type SimulationStage,
} from "@/lib/simulation";

export const Route = createFileRoute("/api/leaderboard/calculate")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const authResult = await requireAuth(request, env.DB);
				if (!authResult.success) return authResult.response;

				const db = createDb(env.DB);
				const userId = authResult.user.id;

				const isAdmin = await isAdminUser(db, userId);
				if (!isAdmin) {
					return new Response(JSON.stringify({ error: "Forbidden" }), {
						status: 403,
						headers: { "Content-Type": "application/json" },
					});
				}

				let simulationStage: SimulationStage | undefined;
				try {
					const body = (await request.json()) as {
						simulationStage?: string;
					};
					if (
						body.simulationStage &&
						SIMULATION_STAGES.includes(
							body.simulationStage as SimulationStage,
						)
					) {
						simulationStage =
							body.simulationStage as SimulationStage;
					}
				} catch {
					// No body or invalid JSON — use real results
				}

				const result = await recalculateAllUserScores(
					env.DB,
					simulationStage,
				);

				return new Response(
					JSON.stringify({
						success: true,
						updated: result.updated,
						simulated: !!simulationStage,
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

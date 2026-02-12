import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { BRACKET_DEADLINE } from "@/data/players";
import { createDb } from "@/db";
import * as schema from "@/db/schema";
import { requireAuth } from "@/lib/middleware/auth";
import { predictionsArraySchema } from "@/lib/schemas/prediction";

export const Route = createFileRoute("/api/predictions/")({
	server: {
		handlers: {
			// GET: Fetch user's predictions
			GET: async ({ request }) => {
				const authResult = await requireAuth(request, env.DB);
				if (!authResult.success) return authResult.response;

				const db = createDb(env.DB);
				const userId = authResult.user.id;

				// Fetch predictions
				const predictions = await db
					.select({
						gameId: schema.userPrediction.gameId,
						predictedWinnerId: schema.userPrediction.predictedWinnerId,
					})
					.from(schema.userPrediction)
					.where(eq(schema.userPrediction.userId, userId));

				return new Response(
					JSON.stringify({
						predictions,
						deadline: BRACKET_DEADLINE,
					}),
					{
						status: 200,
						headers: { "Content-Type": "application/json" },
					},
				);
			},

			// POST: Save predictions (reject if past deadline)
			POST: async ({ request }) => {
				const authResult = await requireAuth(request, env.DB);
				if (!authResult.success) return authResult.response;

				const db = createDb(env.DB);
				const userId = authResult.user.id;

				// Check deadline
				const now = new Date();
				if (now > new Date(BRACKET_DEADLINE)) {
					return new Response(
						JSON.stringify({ error: "Deadline has passed" }),
						{
							status: 400,
							headers: { "Content-Type": "application/json" },
						},
					);
				}

				// Parse and validate request body
				let body: unknown;
				try {
					body = await request.json();
				} catch {
					return new Response(
						JSON.stringify({ error: "Invalid JSON in request body" }),
						{
							status: 400,
							headers: { "Content-Type": "application/json" },
						},
					);
				}

				const result = predictionsArraySchema.safeParse(
					(body as { predictions?: unknown })?.predictions,
				);

				if (!result.success) {
					return new Response(
						JSON.stringify({ error: "Invalid predictions format" }),
						{
							status: 400,
							headers: { "Content-Type": "application/json" },
						},
					);
				}

				const predictions = result.data;

				// Delete all existing predictions for this user, then insert new ones
				await db
					.delete(schema.userPrediction)
					.where(eq(schema.userPrediction.userId, userId));

				// Batch insert all predictions
				if (predictions.length > 0) {
					await db.insert(schema.userPrediction).values(
						predictions.map((prediction) => ({
							id: crypto.randomUUID(),
							userId,
							gameId: prediction.gameId,
							predictedWinnerId: prediction.predictedWinnerId,
						})),
					);
				}

				return new Response(JSON.stringify({ success: true }), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				});
			},
		},
	},
});

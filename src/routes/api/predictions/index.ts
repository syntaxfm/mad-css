import { env } from "cloudflare:workers";
import * as Sentry from "@sentry/tanstackstart-react";
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
			GET: async ({ request }) => {
				const authResult = await requireAuth(request, env.DB);
				if (!authResult.success) return authResult.response;

				const db = createDb(env.DB);
				const userId = authResult.user.id;

				const predictions = await Sentry.startSpan(
					{ name: "predictions.fetch", op: "db" },
					() =>
						db
							.select({
								gameId: schema.userPrediction.gameId,
								predictedWinnerId: schema.userPrediction.predictedWinnerId,
							})
							.from(schema.userPrediction)
							.where(eq(schema.userPrediction.userId, userId)),
				);

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

			POST: async ({ request }) => {
				const authResult = await requireAuth(request, env.DB);
				if (!authResult.success) return authResult.response;

				const db = createDb(env.DB);
				const userId = authResult.user.id;

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

				await Sentry.startSpan(
					{ name: "predictions.save", op: "db" },
					async () => {
						await db
							.delete(schema.userPrediction)
							.where(eq(schema.userPrediction.userId, userId));

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
					},
				);

				return new Response(JSON.stringify({ success: true }), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				});
			},
		},
	},
});

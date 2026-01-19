import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { BRACKET_DEADLINE } from "@/data/players";
import { createDb } from "@/db";
import * as schema from "@/db/schema";
import { createAuth } from "@/lib/auth";

type Prediction = {
	gameId: string;
	predictedWinnerId: string;
};

export const Route = createFileRoute("/api/predictions/")({
	server: {
		handlers: {
			// GET: Fetch user's predictions and lock status
			GET: async ({ request }) => {
				const auth = createAuth(env.DB);
				const session = await auth.api.getSession({ headers: request.headers });

				if (!session?.user) {
					return new Response(JSON.stringify({ error: "Unauthorized" }), {
						status: 401,
						headers: { "Content-Type": "application/json" },
					});
				}

				const db = createDb(env.DB);

				// Fetch predictions
				const predictions = await db
					.select({
						gameId: schema.userPrediction.gameId,
						predictedWinnerId: schema.userPrediction.predictedWinnerId,
					})
					.from(schema.userPrediction)
					.where(eq(schema.userPrediction.userId, session.user.id));

				// Fetch bracket status
				const bracketStatus = await db
					.select()
					.from(schema.userBracketStatus)
					.where(eq(schema.userBracketStatus.userId, session.user.id))
					.limit(1);

				const isLocked = bracketStatus[0]?.isLocked ?? false;
				const lockedAt = bracketStatus[0]?.lockedAt ?? null;

				return new Response(
					JSON.stringify({
						predictions,
						isLocked,
						lockedAt,
						deadline: BRACKET_DEADLINE,
					}),
					{
						status: 200,
						headers: { "Content-Type": "application/json" },
					},
				);
			},

			// POST: Save predictions (reject if locked or past deadline)
			POST: async ({ request }) => {
				const auth = createAuth(env.DB);
				const session = await auth.api.getSession({ headers: request.headers });

				if (!session?.user) {
					return new Response(JSON.stringify({ error: "Unauthorized" }), {
						status: 401,
						headers: { "Content-Type": "application/json" },
					});
				}

				const db = createDb(env.DB);

				// Check if bracket is locked
				const bracketStatus = await db
					.select()
					.from(schema.userBracketStatus)
					.where(eq(schema.userBracketStatus.userId, session.user.id))
					.limit(1);

				if (bracketStatus[0]?.isLocked) {
					return new Response(
						JSON.stringify({ error: "Bracket is already locked" }),
						{
							status: 400,
							headers: { "Content-Type": "application/json" },
						},
					);
				}

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

				// Parse request body
				const body = (await request.json()) as { predictions: Prediction[] };
				const { predictions } = body;

				if (!Array.isArray(predictions)) {
					return new Response(
						JSON.stringify({ error: "Invalid predictions format" }),
						{
							status: 400,
							headers: { "Content-Type": "application/json" },
						},
					);
				}

				// Delete all existing predictions for this user, then insert new ones
				await db
					.delete(schema.userPrediction)
					.where(eq(schema.userPrediction.userId, session.user.id));

				// Insert all new predictions
				for (const prediction of predictions) {
					await db.insert(schema.userPrediction).values({
						id: crypto.randomUUID(),
						userId: session.user.id,
						gameId: prediction.gameId,
						predictedWinnerId: prediction.predictedWinnerId,
					});
				}

				return new Response(JSON.stringify({ success: true }), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				});
			},
		},
	},
});

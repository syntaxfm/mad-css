import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { BRACKET_DEADLINE, TOTAL_GAMES } from "@/data/players";
import { createDb } from "@/db";
import * as schema from "@/db/schema";
import { createAuth } from "@/lib/auth";

export const Route = createFileRoute("/api/predictions/lock")({
	server: {
		handlers: {
			// POST: Lock bracket (requires all 15 picks, checks deadline)
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

				// Check if already locked
				const existingStatus = await db
					.select()
					.from(schema.userBracketStatus)
					.where(eq(schema.userBracketStatus.userId, session.user.id))
					.limit(1);

				if (existingStatus[0]?.isLocked) {
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

				// Check if all 15 picks are made
				const predictions = await db
					.select()
					.from(schema.userPrediction)
					.where(eq(schema.userPrediction.userId, session.user.id));

				if (predictions.length < TOTAL_GAMES) {
					return new Response(
						JSON.stringify({
							error: `Need all ${TOTAL_GAMES} picks to lock bracket. You have ${predictions.length} picks.`,
						}),
						{
							status: 400,
							headers: { "Content-Type": "application/json" },
						},
					);
				}

				// Lock the bracket
				const lockedAt = new Date();

				if (existingStatus.length > 0) {
					// Update existing status
					await db
						.update(schema.userBracketStatus)
						.set({
							isLocked: true,
							lockedAt,
						})
						.where(eq(schema.userBracketStatus.userId, session.user.id));
				} else {
					// Insert new status
					await db.insert(schema.userBracketStatus).values({
						id: crypto.randomUUID(),
						userId: session.user.id,
						isLocked: true,
						lockedAt,
					});
				}

				return new Response(
					JSON.stringify({
						success: true,
						lockedAt: lockedAt.toISOString(),
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

import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";
import { eq, sql } from "drizzle-orm";
import { BRACKET_DEADLINE, TOTAL_GAMES } from "@/data/players";
import { createDb } from "@/db";
import * as schema from "@/db/schema";
import { requireAuth } from "@/lib/middleware/auth";

export const Route = createFileRoute("/api/predictions/lock")({
	server: {
		handlers: {
			// POST: Lock bracket (requires all 15 picks, checks deadline)
			POST: async ({ request }) => {
				const authResult = await requireAuth(request, env.DB);
				if (!authResult.success) return authResult.response;

				const db = createDb(env.DB);
				const userId = authResult.user.id;

				// Check deadline first (stateless check)
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
					.where(eq(schema.userPrediction.userId, userId));

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

				// Lock the bracket atomically using upsert
				const lockedAt = new Date();

				const result = await db
					.insert(schema.userBracketStatus)
					.values({
						id: crypto.randomUUID(),
						userId: userId,
						isLocked: true,
						lockedAt,
					})
					.onConflictDoUpdate({
						target: schema.userBracketStatus.userId,
						set: {
							isLocked: true,
							lockedAt,
						},
						where: sql`${schema.userBracketStatus.isLocked} = false`,
					})
					.returning();

				// If no rows returned, bracket was already locked
				if (result.length === 0) {
					return new Response(
						JSON.stringify({ error: "Bracket is already locked" }),
						{
							status: 400,
							headers: { "Content-Type": "application/json" },
						},
					);
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

import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { createDb } from "@/db";
import * as schema from "@/db/schema";

export type PublicBracketResponse = {
	user: {
		name: string;
		image: string | null;
		username: string;
	};
	predictions: Array<{
		gameId: string;
		predictedWinnerId: string;
	}>;
	isLocked: boolean;
	lockedAt: number | null;
};

export const Route = createFileRoute("/api/bracket/$username")({
	server: {
		handlers: {
			GET: async ({ params }) => {
				const { username } = params;
				const db = createDb(env.DB);

				// Find user by username
				const users = await db
					.select({
						id: schema.user.id,
						name: schema.user.name,
						image: schema.user.image,
						username: schema.user.username,
					})
					.from(schema.user)
					.where(eq(schema.user.username, username))
					.limit(1);

				if (users.length === 0 || !users[0].username) {
					return new Response(JSON.stringify({ error: "User not found" }), {
						status: 404,
						headers: { "Content-Type": "application/json" },
					});
				}

				const user = users[0];

				// Check if bracket is locked
				const bracketStatus = await db
					.select()
					.from(schema.userBracketStatus)
					.where(eq(schema.userBracketStatus.userId, user.id))
					.limit(1);

				const isLocked = bracketStatus[0]?.isLocked ?? false;
				const lockedAt = bracketStatus[0]?.lockedAt?.getTime() ?? null;

				// Only show predictions if bracket is locked
				if (!isLocked) {
					return new Response(
						JSON.stringify({ error: "Bracket not yet locked" }),
						{
							status: 403,
							headers: { "Content-Type": "application/json" },
						},
					);
				}

				// Fetch predictions
				const predictions = await db
					.select({
						gameId: schema.userPrediction.gameId,
						predictedWinnerId: schema.userPrediction.predictedWinnerId,
					})
					.from(schema.userPrediction)
					.where(eq(schema.userPrediction.userId, user.id));

				const response: PublicBracketResponse = {
					user: {
						name: user.name,
						image: user.image,
						username: user.username,
					},
					predictions,
					isLocked,
					lockedAt,
				};

				return new Response(JSON.stringify(response), {
					status: 200,
					headers: {
						"Content-Type": "application/json",
						"Cache-Control": "public, max-age=60",
					},
				});
			},
		},
	},
});

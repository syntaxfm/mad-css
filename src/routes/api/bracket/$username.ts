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

				// Fetch predictions
				const predictions = await db
					.select({
						gameId: schema.userPrediction.gameId,
						predictedWinnerId: schema.userPrediction.predictedWinnerId,
					})
					.from(schema.userPrediction)
					.where(eq(schema.userPrediction.userId, user.id));

				if (predictions.length === 0) {
					return new Response(
						JSON.stringify({ error: "No predictions found" }),
						{
							status: 404,
							headers: { "Content-Type": "application/json" },
						},
					);
				}

				const response: PublicBracketResponse = {
					user: {
						name: user.name,
						image: user.image,
						username: user.username as string,
					},
					predictions,
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

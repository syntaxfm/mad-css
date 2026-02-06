import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";
import { desc, eq } from "drizzle-orm";
import { createDb } from "@/db";
import * as schema from "@/db/schema";

export type LeaderboardEntry = {
	rank: number;
	userId: string;
	userName: string;
	userImage: string | null;
	username: string | null;
	round1Score: number;
	round2Score: number;
	round3Score: number;
	round4Score: number;
	totalScore: number;
};

export const Route = createFileRoute("/api/leaderboard/")({
	server: {
		handlers: {
			GET: async () => {
				const db = createDb(env.DB);

				const scores = await db
					.select({
						userId: schema.userScore.userId,
						round1Score: schema.userScore.round1Score,
						round2Score: schema.userScore.round2Score,
						round3Score: schema.userScore.round3Score,
						round4Score: schema.userScore.round4Score,
						totalScore: schema.userScore.totalScore,
						userName: schema.user.name,
						userImage: schema.user.image,
						username: schema.user.username,
					})
					.from(schema.userScore)
					.innerJoin(schema.user, eq(schema.userScore.userId, schema.user.id))
					.orderBy(desc(schema.userScore.totalScore))
					.limit(100);

				const leaderboard: LeaderboardEntry[] = scores.map((score, index) => ({
					rank: index + 1,
					userId: score.userId,
					userName: score.userName,
					userImage: score.userImage,
					username: score.username,
					round1Score: score.round1Score,
					round2Score: score.round2Score,
					round3Score: score.round3Score,
					round4Score: score.round4Score,
					totalScore: score.totalScore,
				}));

				return new Response(JSON.stringify({ leaderboard }), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				});
			},
		},
	},
});

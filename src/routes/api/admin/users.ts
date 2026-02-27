import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";
import { count, desc, sql } from "drizzle-orm";
import { players } from "@/data/players";
import { createDb } from "@/db";
import * as schema from "@/db/schema";
import { isAdminUser } from "@/lib/admin";
import { createAuth } from "@/lib/auth";

export type AdminUser = {
	id: string;
	name: string;
	username: string | null;
	image: string | null;
	predictionsCount: number;
	totalScore: number;
};

export type MostPickedPersonStat = {
	playerId: string;
	playerName: string;
	playerPhoto: string;
	pickCount: number;
	pickedByUsers: number;
	pickSharePct: number;
};

export type AdminStats = {
	totalUsers: number;
	usersWithPicks: number;
	totalPredictions: number;
	mostPickedPeople: MostPickedPersonStat[];
};

const TOP_PICKED_LIMIT = 5;

export const Route = createFileRoute("/api/admin/users")({
	server: {
		handlers: {
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

				// Server-side admin validation
				const isAdmin = await isAdminUser(db, session.user.id);
				if (!isAdmin) {
					return new Response(JSON.stringify({ error: "Forbidden" }), {
						status: 403,
						headers: { "Content-Type": "application/json" },
					});
				}

				// Fetch all users with their prediction counts and scores
				const users = await db
					.select({
						id: schema.user.id,
						name: schema.user.name,
						username: schema.user.username,
						image: schema.user.image,
					})
					.from(schema.user)
					.orderBy(desc(schema.user.createdAt));

				// Get prediction counts per user
				const predictionCounts = await db
					.select({
						userId: schema.userPrediction.userId,
						count: count(),
					})
					.from(schema.userPrediction)
					.groupBy(schema.userPrediction.userId);

				// Get scores
				const scores = await db.select().from(schema.userScore);

				// Map data
				const predictionMap = new Map(
					predictionCounts.map((p) => [p.userId, p.count]),
				);
				const scoreMap = new Map(scores.map((s) => [s.userId, s.totalScore]));

				const adminUsers: AdminUser[] = users.map((user) => ({
					id: user.id,
					name: user.name,
					username: user.username,
					image: user.image,
					predictionsCount: predictionMap.get(user.id) ?? 0,
					totalScore: scoreMap.get(user.id) ?? 0,
				}));

				// Calculate stats
				const usersWithPicks = predictionCounts.length;
				const playerMap = new Map(players.map((player) => [player.id, player]));
				const pickCountsByPerson = await db
					.select({
						predictedWinnerId: schema.userPrediction.predictedWinnerId,
						pickCount: count(),
						pickedByUsers: sql<number>`COUNT(DISTINCT ${schema.userPrediction.userId})`,
					})
					.from(schema.userPrediction)
					.groupBy(schema.userPrediction.predictedWinnerId);

				const totalPredictions = pickCountsByPerson.reduce(
					(sum, row) => sum + row.pickCount,
					0,
				);
				const mostPickedPeople: MostPickedPersonStat[] = pickCountsByPerson
					.flatMap((row) => {
						const player = playerMap.get(row.predictedWinnerId);
						if (!player) return [];
						return [
							{
								playerId: player.id,
								playerName: player.name,
								playerPhoto: player.photo,
								pickCount: row.pickCount,
								pickedByUsers: row.pickedByUsers,
								pickSharePct:
									totalPredictions > 0
										? (row.pickCount / totalPredictions) * 100
										: 0,
							},
						];
					})
					.sort((a, b) => {
						if (b.pickCount !== a.pickCount) {
							return b.pickCount - a.pickCount;
						}
						return a.playerName.localeCompare(b.playerName);
					})
					.slice(0, TOP_PICKED_LIMIT);

				const stats: AdminStats = {
					totalUsers: users.length,
					usersWithPicks,
					totalPredictions,
					mostPickedPeople,
				};

				return new Response(JSON.stringify({ users: adminUsers, stats }), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				});
			},
		},
	},
});

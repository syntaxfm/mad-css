import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";
import { count, desc } from "drizzle-orm";
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

export type AdminStats = {
	totalUsers: number;
	usersWithPicks: number;
};

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
				const stats: AdminStats = {
					totalUsers: users.length,
					usersWithPicks,
				};

				return new Response(JSON.stringify({ users: adminUsers, stats }), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				});
			},
		},
	},
});

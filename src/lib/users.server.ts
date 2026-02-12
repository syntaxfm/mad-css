import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { z } from "zod";

async function requireAdmin() {
	const { env } = await import("cloudflare:workers");
	const { createAuth } = await import("@/lib/auth");
	const { createDb } = await import("@/db");
	const { isAdminUser } = await import("@/lib/admin");

	const headers = getRequestHeaders();
	const auth = createAuth(env.DB);
	const session = await auth.api.getSession({
		headers: new Headers(headers),
	});

	if (!session?.user) {
		return null;
	}

	const db = createDb(env.DB);
	const isAdmin = await isAdminUser(db, session.user.id);
	if (!isAdmin) {
		return null;
	}

	return { db, env, session };
}

export const generateTestUserFn = createServerFn({ method: "POST" }).handler(
	async () => {
		const ctx = await requireAdmin();
		if (!ctx) return { success: false as const, error: "Unauthorized" };
		const { db } = ctx;

		const { like } = await import("drizzle-orm");
		const schema = await import("@/db/schema");
		const { bracket } = await import("@/data/players");

		function pickRandom<T>(arr: T[]): T {
			return arr[Math.floor(Math.random() * arr.length)];
		}

		const predictions: Record<string, string> = {};

		for (const game of bracket.round1) {
			if (!game.player1 || !game.player2) continue;
			predictions[game.id] = pickRandom([game.player1, game.player2]).id;
		}

		const qfPairs = [
			["r1-0", "r1-1"],
			["r1-2", "r1-3"],
			["r1-4", "r1-5"],
			["r1-6", "r1-7"],
		];
		for (let i = 0; i < qfPairs.length; i++) {
			const [src1, src2] = qfPairs[i];
			const p1 = predictions[src1];
			const p2 = predictions[src2];
			if (p1 && p2) predictions[`qf-${i}`] = pickRandom([p1, p2]);
		}

		const sfPairs = [
			["qf-0", "qf-1"],
			["qf-2", "qf-3"],
		];
		for (let i = 0; i < sfPairs.length; i++) {
			const [src1, src2] = sfPairs[i];
			const p1 = predictions[src1];
			const p2 = predictions[src2];
			if (p1 && p2) predictions[`sf-${i}`] = pickRandom([p1, p2]);
		}

		const f1 = predictions["sf-0"];
		const f2 = predictions["sf-1"];
		if (f1 && f2) predictions.final = pickRandom([f1, f2]);

		const existingTestUsers = await db
			.select({ name: schema.user.name })
			.from(schema.user)
			.where(like(schema.user.name, "Test Account #%"));

		let maxNum = 0;
		for (const u of existingTestUsers) {
			const match = u.name.match(/^Test Account #(\d+)$/);
			if (match) {
				const num = Number.parseInt(match[1], 10);
				if (num > maxNum) maxNum = num;
			}
		}
		const nextNum = maxNum + 1;

		const userId = crypto.randomUUID();
		const username = `test-account-${nextNum}`;
		const name = `Test Account #${nextNum}`;
		const email = `test-${nextNum}@madcss.test`;

		await db.insert(schema.user).values({
			id: userId,
			name,
			email,
			emailVerified: false,
			username,
			image: null,
		});

		const predictionEntries = Object.entries(predictions);
		if (predictionEntries.length > 0) {
			await db.insert(schema.userPrediction).values(
				predictionEntries.map(([gameId, predictedWinnerId]) => ({
					id: crypto.randomUUID(),
					userId,
					gameId,
					predictedWinnerId,
				})),
			);
		}

		return {
			success: true as const,
			name,
			predictionsCount: predictionEntries.length,
		};
	},
);

export const deleteUserFn = createServerFn({ method: "POST" })
	.inputValidator((data: unknown) =>
		z.object({ userId: z.string() }).parse(data),
	)
	.handler(async ({ data }) => {
		const ctx = await requireAdmin();
		if (!ctx) return { success: false as const, error: "Unauthorized" };
		const { db } = ctx;

		const { eq } = await import("drizzle-orm");
		const schema = await import("@/db/schema");

		// Verify the user exists
		const [user] = await db
			.select({ id: schema.user.id, name: schema.user.name })
			.from(schema.user)
			.where(eq(schema.user.id, data.userId));

		if (!user) {
			return { success: false as const, error: "User not found" };
		}

		// Delete leaderboard scores
		await db
			.delete(schema.userScore)
			.where(eq(schema.userScore.userId, data.userId));

		// Delete bracket predictions
		await db
			.delete(schema.userPrediction)
			.where(eq(schema.userPrediction.userId, data.userId));

		// Delete auth sessions
		await db
			.delete(schema.session)
			.where(eq(schema.session.userId, data.userId));

		// Delete auth accounts
		await db
			.delete(schema.account)
			.where(eq(schema.account.userId, data.userId));

		// Delete the user record
		await db.delete(schema.user).where(eq(schema.user.id, data.userId));

		return { success: true as const, name: user.name };
	});

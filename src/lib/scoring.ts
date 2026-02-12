import type { D1Database } from "@cloudflare/workers-types";
import { eq, sql } from "drizzle-orm";
import {
	FINAL_GAME_IDS,
	getResultsFromBracket,
	QUARTER_GAME_IDS,
	ROUND_1_GAME_IDS,
	SEMI_GAME_IDS,
} from "@/data/players";
import { createDb } from "@/db";
import * as schema from "@/db/schema";

// Points per correct pick in each round
const ROUND_1_POINTS = 10;
const QUARTER_POINTS = 20;
const SEMI_POINTS = 40;
const FINAL_POINTS = 80;

type RoundScores = {
	round1Score: number;
	round2Score: number;
	round3Score: number;
	round4Score: number;
	totalScore: number;
};

export function calculateScoresForUser(
	predictions: Array<{ gameId: string; predictedWinnerId: string }>,
	results: Array<{ gameId: string; winnerId: string }>,
): RoundScores {
	const resultsMap = new Map(results.map((r) => [r.gameId, r.winnerId]));

	let round1Score = 0;
	let round2Score = 0;
	let round3Score = 0;
	let round4Score = 0;

	for (const prediction of predictions) {
		const actualWinner = resultsMap.get(prediction.gameId);
		if (!actualWinner) continue; // Game not played yet

		const isCorrect = prediction.predictedWinnerId === actualWinner;
		if (!isCorrect) continue;

		if (ROUND_1_GAME_IDS.includes(prediction.gameId)) {
			round1Score += ROUND_1_POINTS;
		} else if (QUARTER_GAME_IDS.includes(prediction.gameId)) {
			round2Score += QUARTER_POINTS;
		} else if (SEMI_GAME_IDS.includes(prediction.gameId)) {
			round3Score += SEMI_POINTS;
		} else if (FINAL_GAME_IDS.includes(prediction.gameId)) {
			round4Score += FINAL_POINTS;
		}
	}

	return {
		round1Score,
		round2Score,
		round3Score,
		round4Score,
		totalScore: round1Score + round2Score + round3Score + round4Score,
	};
}

export async function recalculateAllUserScores(database: D1Database) {
	const db = createDb(database);

	// Get results from players.ts (single source of truth)
	const bracketResults = getResultsFromBracket();
	const results = bracketResults.map((r) => ({
		gameId: r.gameId,
		winnerId: r.winnerId,
	}));

	if (results.length === 0) {
		return { updated: 0 };
	}

	// Get all distinct user IDs that have predictions
	const usersWithPredictions = await db
		.selectDistinct({ userId: schema.userPrediction.userId })
		.from(schema.userPrediction);

	if (usersWithPredictions.length === 0) {
		return { updated: 0 };
	}

	const userIds = usersWithPredictions.map((u) => u.userId);

	// Get all predictions for these users
	const allPredictions = await db
		.select({
			userId: schema.userPrediction.userId,
			gameId: schema.userPrediction.gameId,
			predictedWinnerId: schema.userPrediction.predictedWinnerId,
		})
		.from(schema.userPrediction)
		.where(
			sql`${schema.userPrediction.userId} IN (${sql.join(
				userIds.map((id) => sql`${id}`),
				sql`, `,
			)})`,
		);

	// Group predictions by user
	const predictionsByUser = new Map<
		string,
		Array<{ gameId: string; predictedWinnerId: string }>
	>();
	for (const p of allPredictions) {
		const existing = predictionsByUser.get(p.userId) || [];
		existing.push({ gameId: p.gameId, predictedWinnerId: p.predictedWinnerId });
		predictionsByUser.set(p.userId, existing);
	}

	// Calculate and upsert scores for each user
	let updated = 0;
	for (const userId of userIds) {
		const userPredictions = predictionsByUser.get(userId) || [];
		const scores = calculateScoresForUser(userPredictions, results);

		// Check if score record exists
		const existing = await db
			.select()
			.from(schema.userScore)
			.where(eq(schema.userScore.userId, userId))
			.limit(1);

		if (existing.length > 0) {
			await db
				.update(schema.userScore)
				.set({
					round1Score: scores.round1Score,
					round2Score: scores.round2Score,
					round3Score: scores.round3Score,
					round4Score: scores.round4Score,
					totalScore: scores.totalScore,
				})
				.where(eq(schema.userScore.userId, userId));
		} else {
			await db.insert(schema.userScore).values({
				id: crypto.randomUUID(),
				userId,
				round1Score: scores.round1Score,
				round2Score: scores.round2Score,
				round3Score: scores.round3Score,
				round4Score: scores.round4Score,
				totalScore: scores.totalScore,
			});
		}
		updated++;
	}

	return { updated };
}

import type { D1Database } from "@cloudflare/workers-types";
import { eq, inArray } from "drizzle-orm";
import { createDb } from "@/db";
import * as schema from "@/db/schema";

// Game IDs organized by round
const ROUND_1_GAMES = [
	"r1-0",
	"r1-1",
	"r1-2",
	"r1-3",
	"r1-4",
	"r1-5",
	"r1-6",
	"r1-7",
];
const QUARTER_GAMES = ["qf-0", "qf-1", "qf-2", "qf-3"];
const SEMI_GAMES = ["sf-0", "sf-1"];
const FINAL_GAMES = ["final"];

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

		if (ROUND_1_GAMES.includes(prediction.gameId)) {
			round1Score += ROUND_1_POINTS;
		} else if (QUARTER_GAMES.includes(prediction.gameId)) {
			round2Score += QUARTER_POINTS;
		} else if (SEMI_GAMES.includes(prediction.gameId)) {
			round3Score += SEMI_POINTS;
		} else if (FINAL_GAMES.includes(prediction.gameId)) {
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

	// Get all tournament results
	const results = await db
		.select({
			gameId: schema.tournamentResult.gameId,
			winnerId: schema.tournamentResult.winnerId,
		})
		.from(schema.tournamentResult);

	if (results.length === 0) {
		return { updated: 0 };
	}

	// Get all users with locked brackets
	const lockedUsers = await db
		.select({ userId: schema.userBracketStatus.userId })
		.from(schema.userBracketStatus)
		.where(eq(schema.userBracketStatus.isLocked, true));

	if (lockedUsers.length === 0) {
		return { updated: 0 };
	}

	const userIds = lockedUsers.map((u) => u.userId);

	// Get all predictions for locked users
	const allPredictions = await db
		.select({
			userId: schema.userPrediction.userId,
			gameId: schema.userPrediction.gameId,
			predictedWinnerId: schema.userPrediction.predictedWinnerId,
		})
		.from(schema.userPrediction)
		.where(inArray(schema.userPrediction.userId, userIds));

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

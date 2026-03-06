import type { D1Database } from "@cloudflare/workers-types";
import * as Sentry from "@sentry/tanstackstart-react";
import { sql } from "drizzle-orm";
import {
	FINAL_GAME_IDS,
	getResultsFromBracket,
	QUARTER_GAME_IDS,
	ROUND_1_GAME_IDS,
	SEMI_GAME_IDS,
} from "@/data/players";
import { createDb, type Database } from "@/db";
import * as schema from "@/db/schema";
import { buildResultsUpToStage, type SimulationStage } from "@/lib/simulation";

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
		if (!actualWinner) continue;

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

function buildUpsertQuery(
	db: Database,
	values: {
		id: string;
		userId: string;
		round1Score: number;
		round2Score: number;
		round3Score: number;
		round4Score: number;
		totalScore: number;
	},
) {
	return db
		.insert(schema.userScore)
		.values(values)
		.onConflictDoUpdate({
			target: schema.userScore.userId,
			set: {
				round1Score: sql`excluded.round1_score`,
				round2Score: sql`excluded.round2_score`,
				round3Score: sql`excluded.round3_score`,
				round4Score: sql`excluded.round4_score`,
				totalScore: sql`excluded.total_score`,
			},
		});
}

export async function recalculateAllUserScores(
	database: D1Database,
	simulationStage?: SimulationStage,
) {
	return Sentry.startSpan(
		{ name: "scoring.recalculateAll", op: "function" },
		async () => {
			const db = createDb(database);

			let results: Array<{ gameId: string; winnerId: string }>;

			if (simulationStage) {
				const simulated = buildResultsUpToStage(simulationStage);
				results = Object.entries(simulated).map(([gameId, winnerId]) => ({
					gameId,
					winnerId,
				}));
			} else {
				results = getResultsFromBracket().map((r) => ({
					gameId: r.gameId,
					winnerId: r.winnerId,
				}));
			}

			if (results.length === 0) {
				return { updated: 0 };
			}

			const allPredictions = await db
				.select({
					userId: schema.userPrediction.userId,
					gameId: schema.userPrediction.gameId,
					predictedWinnerId: schema.userPrediction.predictedWinnerId,
				})
				.from(schema.userPrediction);

			if (allPredictions.length === 0) {
				return { updated: 0 };
			}

			const predictionsByUser = new Map<
				string,
				Array<{ gameId: string; predictedWinnerId: string }>
			>();
			for (const p of allPredictions) {
				const existing = predictionsByUser.get(p.userId) || [];
				existing.push({
					gameId: p.gameId,
					predictedWinnerId: p.predictedWinnerId,
				});
				predictionsByUser.set(p.userId, existing);
			}

			const queries: ReturnType<typeof buildUpsertQuery>[] = [];
			for (const [userId, userPredictions] of predictionsByUser) {
				const scores = calculateScoresForUser(userPredictions, results);
				queries.push(
					buildUpsertQuery(db, {
						id: crypto.randomUUID(),
						userId,
						...scores,
					}),
				);
			}

			// D1 batch sends all statements in a single round trip,
			// each with only ~7 bind params (well under D1's 100 limit)
			await Sentry.startSpan(
				{ name: "scoring.upsertBatch", op: "db" },
				() => db.batch(queries as [typeof queries[0], ...typeof queries]),
			);

			return { updated: queries.length };
		},
	);
}

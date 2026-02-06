import { z } from "zod";
import { ALL_GAME_IDS, players } from "@/data/players";

// Valid player IDs from tournament roster
const VALID_PLAYER_IDS = players.map((p) => p.id);

export const gameIdSchema = z.enum(ALL_GAME_IDS);

export const playerIdSchema = z
	.string()
	.refine((id) => VALID_PLAYER_IDS.includes(id), {
		message: "Invalid player ID",
	});

export const predictionSchema = z.object({
	gameId: gameIdSchema,
	predictedWinnerId: playerIdSchema,
});

export const predictionsArraySchema = z.array(predictionSchema);

export type Prediction = z.infer<typeof predictionSchema>;
export type PredictionsArray = z.infer<typeof predictionsArraySchema>;

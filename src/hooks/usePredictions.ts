import { useCallback, useEffect, useState } from "react";
import { BRACKET_DEADLINE, bracket, TOTAL_GAMES } from "@/data/players";

export type Prediction = {
	gameId: string;
	predictedWinnerId: string;
};

export type PredictionsState = {
	predictions: Record<string, string>; // gameId -> playerId
	isLocked: boolean;
	lockedAt: string | null;
	isLoading: boolean;
	isSaving: boolean;
	error: string | null;
	pickCount: number;
	deadline: string;
	isDeadlinePassed: boolean;
};

// Maps game IDs to the game they feed into and which player slot
// e.g., r1-0 winner goes to qf-0 as player1
const GAME_ADVANCEMENT_MAP: Record<
	string,
	{ nextGameId: string; slot: "player1" | "player2" }
> = {
	// Round 1 -> Quarterfinals
	"r1-0": { nextGameId: "qf-0", slot: "player1" },
	"r1-1": { nextGameId: "qf-0", slot: "player2" },
	"r1-2": { nextGameId: "qf-1", slot: "player1" },
	"r1-3": { nextGameId: "qf-1", slot: "player2" },
	"r1-4": { nextGameId: "qf-2", slot: "player1" },
	"r1-5": { nextGameId: "qf-2", slot: "player2" },
	"r1-6": { nextGameId: "qf-3", slot: "player1" },
	"r1-7": { nextGameId: "qf-3", slot: "player2" },
	// Quarterfinals -> Semifinals
	"qf-0": { nextGameId: "sf-0", slot: "player1" },
	"qf-1": { nextGameId: "sf-0", slot: "player2" },
	"qf-2": { nextGameId: "sf-1", slot: "player1" },
	"qf-3": { nextGameId: "sf-1", slot: "player2" },
	// Semifinals -> Finals
	"sf-0": { nextGameId: "final", slot: "player1" },
	"sf-1": { nextGameId: "final", slot: "player2" },
};

// Reverse map: for a given game, what are the source games for each player slot?
const GAME_SOURCE_MAP: Record<
	string,
	{ player1Source?: string; player2Source?: string }
> = {
	"qf-0": { player1Source: "r1-0", player2Source: "r1-1" },
	"qf-1": { player1Source: "r1-2", player2Source: "r1-3" },
	"qf-2": { player1Source: "r1-4", player2Source: "r1-5" },
	"qf-3": { player1Source: "r1-6", player2Source: "r1-7" },
	"sf-0": { player1Source: "qf-0", player2Source: "qf-1" },
	"sf-1": { player1Source: "qf-2", player2Source: "qf-3" },
	final: { player1Source: "sf-0", player2Source: "sf-1" },
};

// Get the two players who can be picked for a given game
// Returns [player1Id, player2Id] where each slot preserves its position
// (undefined if the source game has no prediction yet)
export function getPickablePlayersForGame(
	gameId: string,
	predictions: Record<string, string>,
): [string | undefined, string | undefined] {
	// Round 1 games have fixed players based on the bracket structure
	if (gameId.startsWith("r1-")) {
		const gameIndex = Number.parseInt(gameId.split("-")[1], 10);
		const game = bracket.round1[gameIndex];
		return [game?.player1?.id, game?.player2?.id];
	}

	// Later rounds: get winners from source games
	// Preserve slot positions - player1 always comes from player1Source, etc.
	const sources = GAME_SOURCE_MAP[gameId];
	if (!sources) return [undefined, undefined];

	const player1 = sources.player1Source
		? predictions[sources.player1Source]
		: undefined;
	const player2 = sources.player2Source
		? predictions[sources.player2Source]
		: undefined;

	return [player1, player2];
}

// Get games that need to be cleared when changing a pick
function getGamesToClear(
	gameId: string,
	oldPlayerId: string,
	currentPredictions: Record<string, string>,
): string[] {
	const gamesToClear: string[] = [];
	const advancement = GAME_ADVANCEMENT_MAP[gameId];

	if (!advancement || !oldPlayerId) return gamesToClear;

	const { nextGameId } = advancement;
	const currentPick = currentPredictions[nextGameId];

	// If the old player was picked in the next game, we need to clear it
	if (currentPick === oldPlayerId) {
		gamesToClear.push(nextGameId);
		// Recursively clear further games
		gamesToClear.push(
			...getGamesToClear(nextGameId, oldPlayerId, currentPredictions),
		);
	}

	return gamesToClear;
}

export function usePredictions(isAuthenticated: boolean) {
	const [predictions, setPredictions] = useState<Record<string, string>>({});
	const [isLocked, setIsLocked] = useState(false);
	const [lockedAt, setLockedAt] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [hasChanges, setHasChanges] = useState(false);

	// Calculate deadline status
	const isDeadlinePassed = new Date() > new Date(BRACKET_DEADLINE);

	// Fetch predictions on mount, clear on sign out
	useEffect(() => {
		if (!isAuthenticated) {
			setPredictions({});
			setIsLocked(false);
			setLockedAt(null);
			setIsLoading(false);
			setHasChanges(false);
			setError(null);
			return;
		}

		async function fetchPredictions() {
			try {
				const response = await fetch("/api/predictions/");
				if (!response.ok) {
					throw new Error("Failed to fetch predictions");
				}
				const data = await response.json();

				// Convert array to record
				const predictionsRecord: Record<string, string> = {};
				for (const pred of data.predictions) {
					predictionsRecord[pred.gameId] = pred.predictedWinnerId;
				}

				setPredictions(predictionsRecord);
				setIsLocked(data.isLocked);
				setLockedAt(data.lockedAt);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Failed to load predictions",
				);
			} finally {
				setIsLoading(false);
			}
		}

		fetchPredictions();
	}, [isAuthenticated]);

	// Set a prediction with cascading logic
	const setPrediction = useCallback(
		(gameId: string, playerId: string) => {
			if (isLocked || isDeadlinePassed) return;

			setPredictions((prev) => {
				const newPredictions = { ...prev };
				const oldPlayerId = prev[gameId];

				// If changing pick, clear any cascaded picks of the old player
				if (oldPlayerId && oldPlayerId !== playerId) {
					const gamesToClear = getGamesToClear(gameId, oldPlayerId, prev);
					for (const clearGameId of gamesToClear) {
						delete newPredictions[clearGameId];
					}
				}

				// Set the new prediction
				newPredictions[gameId] = playerId;

				return newPredictions;
			});

			setHasChanges(true);
			setError(null);
		},
		[isLocked, isDeadlinePassed],
	);

	// Save predictions to the server
	const savePredictions = useCallback(async () => {
		if (isLocked || isDeadlinePassed || !isAuthenticated) return;

		setIsSaving(true);
		setError(null);

		try {
			const predictionsArray = Object.entries(predictions).map(
				([gameId, predictedWinnerId]) => ({
					gameId,
					predictedWinnerId,
				}),
			);

			const response = await fetch("/api/predictions/", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ predictions: predictionsArray }),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Failed to save predictions");
			}

			setHasChanges(false);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to save predictions",
			);
		} finally {
			setIsSaving(false);
		}
	}, [predictions, isLocked, isDeadlinePassed, isAuthenticated]);

	// Reset all predictions
	const resetPredictions = useCallback(() => {
		if (isLocked || isDeadlinePassed) return;

		setPredictions({});
		setHasChanges(true);
		setError(null);
	}, [isLocked, isDeadlinePassed]);

	// Lock the bracket
	const lockBracket = useCallback(async () => {
		if (isLocked || isDeadlinePassed || !isAuthenticated) return;

		// First save any unsaved predictions
		if (hasChanges) {
			await savePredictions();
		}

		setIsSaving(true);
		setError(null);

		try {
			const response = await fetch("/api/predictions/lock", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Failed to lock bracket");
			}

			const data = await response.json();
			setIsLocked(true);
			setLockedAt(data.lockedAt);
			setHasChanges(false);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to lock bracket");
		} finally {
			setIsSaving(false);
		}
	}, [
		isLocked,
		isDeadlinePassed,
		isAuthenticated,
		hasChanges,
		savePredictions,
	]);

	const pickCount = Object.keys(predictions).length;

	return {
		predictions,
		isLocked,
		lockedAt,
		isLoading,
		isSaving,
		error,
		pickCount,
		deadline: BRACKET_DEADLINE,
		isDeadlinePassed,
		hasChanges,
		totalGames: TOTAL_GAMES,
		setPrediction,
		savePredictions,
		lockBracket,
		resetPredictions,
		getPickablePlayersForGame: (gameId: string) =>
			getPickablePlayersForGame(gameId, predictions),
	};
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { BRACKET_DEADLINE, bracket, TOTAL_GAMES } from "@/data/players";
import {
	useLockBracketMutation,
	usePredictionsQuery,
	useSavePredictionsMutation,
} from "./usePredictionsQuery";

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

export type UsePredictionsReturn = ReturnType<typeof usePredictions>;

export function usePredictions(isAuthenticated: boolean, userId?: string) {
	// TanStack Query for fetching predictions
	const {
		data: queryData,
		isLoading: queryIsLoading,
		error: queryError,
	} = usePredictionsQuery(isAuthenticated ? userId : undefined);

	// Mutations
	const saveMutation = useSavePredictionsMutation(userId);
	const lockMutation = useLockBracketMutation(userId);

	// Local state for optimistic updates while picking
	const [localPredictions, setLocalPredictions] = useState<Record<
		string,
		string
	> | null>(null);

	// Track if local state differs from server state
	const hasChanges = useMemo(() => {
		if (!localPredictions || !queryData) return false;
		const serverKeys = Object.keys(queryData.predictions);
		const localKeys = Object.keys(localPredictions);
		if (serverKeys.length !== localKeys.length) return true;
		return localKeys.some(
			(key) => localPredictions[key] !== queryData.predictions[key],
		);
	}, [localPredictions, queryData]);

	// Sync local state when query data changes (initial load or after mutation)
	useEffect(() => {
		if (queryData && !localPredictions) {
			setLocalPredictions(queryData.predictions);
		}
	}, [queryData, localPredictions]);

	// Reset local state when user logs out
	useEffect(() => {
		if (!isAuthenticated) {
			setLocalPredictions(null);
		}
	}, [isAuthenticated]);

	// The actual predictions to use (local if available, otherwise from query)
	const predictions = localPredictions ?? queryData?.predictions ?? {};
	const isLocked = queryData?.isLocked ?? false;
	const lockedAt = queryData?.lockedAt ?? null;

	// Calculate deadline status
	const isDeadlinePassed = new Date() > new Date(BRACKET_DEADLINE);

	// Determine loading state
	const isLoading = isAuthenticated && queryIsLoading;

	// Determine saving state
	const isSaving = saveMutation.isPending || lockMutation.isPending;

	// Determine error state
	const error =
		queryError?.message ||
		saveMutation.error?.message ||
		lockMutation.error?.message ||
		null;

	// Set a prediction with cascading logic
	const setPrediction = useCallback(
		(gameId: string, playerId: string) => {
			if (isLocked || isDeadlinePassed) return;

			setLocalPredictions((prev) => {
				const current = prev ?? queryData?.predictions ?? {};
				const newPredictions = { ...current };
				const oldPlayerId = current[gameId];

				// If changing pick, clear any cascaded picks of the old player
				if (oldPlayerId && oldPlayerId !== playerId) {
					const gamesToClear = getGamesToClear(gameId, oldPlayerId, current);
					for (const clearGameId of gamesToClear) {
						delete newPredictions[clearGameId];
					}
				}

				// Set the new prediction
				newPredictions[gameId] = playerId;

				return newPredictions;
			});
		},
		[isLocked, isDeadlinePassed, queryData?.predictions],
	);

	// Save predictions to the server
	const savePredictions = useCallback(async () => {
		if (isLocked || isDeadlinePassed || !isAuthenticated || !localPredictions)
			return;

		await saveMutation.mutateAsync(localPredictions);
	}, [
		localPredictions,
		isLocked,
		isDeadlinePassed,
		isAuthenticated,
		saveMutation,
	]);

	// Reset all predictions
	const resetPredictions = useCallback(() => {
		if (isLocked || isDeadlinePassed) return;

		setLocalPredictions({});
	}, [isLocked, isDeadlinePassed]);

	// Lock the bracket
	const lockBracket = useCallback(async () => {
		if (isLocked || isDeadlinePassed || !isAuthenticated) return;

		// First save any unsaved predictions
		if (hasChanges && localPredictions) {
			await saveMutation.mutateAsync(localPredictions);
		}

		await lockMutation.mutateAsync();
	}, [
		isLocked,
		isDeadlinePassed,
		isAuthenticated,
		hasChanges,
		localPredictions,
		saveMutation,
		lockMutation,
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

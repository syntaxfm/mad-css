import {
	bracket,
	FINAL_GAME_IDS,
	type Player,
	players,
	QUARTER_GAME_IDS,
	ROUND_1_GAME_IDS,
	SEMI_GAME_IDS,
} from "@/data/players";

// =============================================================================
// SIMULATION STAGES
// =============================================================================

export type SimulationStage =
	| "r1-left"
	| "r1-right"
	| "quarterfinals"
	| "semifinals"
	| "finals";

export const SIMULATION_STAGES: SimulationStage[] = [
	"r1-left",
	"r1-right",
	"quarterfinals",
	"semifinals",
	"finals",
];

export const STAGE_CONFIG: Record<
	SimulationStage,
	{ label: string; gameIds: readonly string[] }
> = {
	"r1-left": {
		label: "Round 1 - Left",
		gameIds: ROUND_1_GAME_IDS.slice(0, 4),
	},
	"r1-right": {
		label: "Round 1 - Right",
		gameIds: ROUND_1_GAME_IDS.slice(4),
	},
	quarterfinals: {
		label: "Quarterfinals",
		gameIds: QUARTER_GAME_IDS,
	},
	semifinals: {
		label: "Semifinals",
		gameIds: SEMI_GAME_IDS,
	},
	finals: {
		label: "Finals",
		gameIds: FINAL_GAME_IDS,
	},
};

// =============================================================================
// ACTIVE ROUND CALCULATION
// =============================================================================

export type ActiveRound =
	| "round1"
	| "quarters"
	| "semis"
	| "finals"
	| "complete";

export function getActiveRound(results: Record<string, string>): ActiveRound {
	const r1LeftComplete = ROUND_1_GAME_IDS.slice(0, 4).every((g) => results[g]);
	const r1RightComplete = ROUND_1_GAME_IDS.slice(4).every((g) => results[g]);
	const qfComplete = QUARTER_GAME_IDS.every((g) => results[g]);
	const sfComplete = SEMI_GAME_IDS.every((g) => results[g]);
	const finalsComplete = FINAL_GAME_IDS.every((g) => results[g]);

	if (!r1LeftComplete || !r1RightComplete) return "round1";
	if (!qfComplete) return "quarters";
	if (!sfComplete) return "semis";
	if (!finalsComplete) return "finals";
	return "complete";
}

export function getRoundForGame(
	gameId: string,
): "round1" | "quarters" | "semis" | "finals" {
	if (gameId.startsWith("r1-")) return "round1";
	if (gameId.startsWith("qf-")) return "quarters";
	if (gameId.startsWith("sf-")) return "semis";
	return "finals";
}

export function isGameInActiveRound(
	gameId: string,
	activeRound: ActiveRound,
): boolean {
	if (activeRound === "complete") return false;
	return getRoundForGame(gameId) === activeRound;
}

// =============================================================================
// PLAYER ADVANCEMENT LOGIC
// =============================================================================

export function getPlayersForGame(
	gameId: string,
	results: Record<string, string>,
): [string | undefined, string | undefined] {
	// Round 1 games have fixed players from bracket data
	if (gameId.startsWith("r1-")) {
		const game = bracket.round1.find((g) => g.id === gameId);
		return [game?.player1?.id, game?.player2?.id];
	}

	// Quarterfinals: winners from R1
	if (gameId === "qf-0") {
		return [results["r1-0"], results["r1-1"]];
	}
	if (gameId === "qf-1") {
		return [results["r1-2"], results["r1-3"]];
	}
	if (gameId === "qf-2") {
		return [results["r1-4"], results["r1-5"]];
	}
	if (gameId === "qf-3") {
		return [results["r1-6"], results["r1-7"]];
	}

	// Semifinals: winners from QF
	if (gameId === "sf-0") {
		return [results["qf-0"], results["qf-1"]];
	}
	if (gameId === "sf-1") {
		return [results["qf-2"], results["qf-3"]];
	}

	// Finals: winners from SF
	if (gameId === "final") {
		return [results["sf-0"], results["sf-1"]];
	}

	return [undefined, undefined];
}

export function getPlayerById(playerId: string): Player | undefined {
	return players.find((p) => p.id === playerId);
}

// =============================================================================
// RANDOM SIMULATION
// =============================================================================

export function simulateStage(
	stage: SimulationStage,
	currentResults: Record<string, string>,
): Record<string, string> {
	const newResults = { ...currentResults };
	const gameIds = STAGE_CONFIG[stage].gameIds;

	for (const gameId of gameIds) {
		const [p1, p2] = getPlayersForGame(gameId, newResults);
		if (p1 && p2) {
			// Always pick player 1 (top player) for deterministic simulation
			newResults[gameId] = p1;
		}
	}

	return newResults;
}

export function getCurrentStage(
	results: Record<string, string>,
): SimulationStage | null {
	// Find the first incomplete stage
	for (const stage of SIMULATION_STAGES) {
		const gameIds = STAGE_CONFIG[stage].gameIds;
		const allComplete = gameIds.every((id) => results[id]);
		if (!allComplete) {
			return stage;
		}
	}
	return null;
}

export function getPreviousStage(
	stage: SimulationStage,
): SimulationStage | null {
	const idx = SIMULATION_STAGES.indexOf(stage);
	return idx > 0 ? SIMULATION_STAGES[idx - 1] : null;
}

export function getNextStage(stage: SimulationStage): SimulationStage | null {
	const idx = SIMULATION_STAGES.indexOf(stage);
	return idx < SIMULATION_STAGES.length - 1 ? SIMULATION_STAGES[idx + 1] : null;
}

// Get all game IDs up to and including a stage
export function getGameIdsUpToStage(stage: SimulationStage): string[] {
	const gameIds: string[] = [];
	for (const s of SIMULATION_STAGES) {
		gameIds.push(...STAGE_CONFIG[s].gameIds);
		if (s === stage) break;
	}
	return gameIds;
}

// Build complete results up to and including a stage (simulating all stages)
export function buildResultsUpToStage(
	stage: SimulationStage,
): Record<string, string> {
	let results: Record<string, string> = {};
	for (const s of SIMULATION_STAGES) {
		results = simulateStage(s, results);
		if (s === stage) break;
	}
	return results;
}

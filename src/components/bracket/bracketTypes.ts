export interface NodeContext {
	hasResults: boolean;
	tournamentResults: Record<string, string>;
	predictions: Record<string, string>;
	pickablePlayersCache: Record<
		string,
		[string | undefined, string | undefined]
	>;
	isInteractive: boolean;
	isPickingEnabled: boolean;
	showPicks: boolean;
	onPick?: (gameId: string, playerId: string) => void;
}

export interface RoundGeneratorOptions {
	side: "left" | "right";
	ctx: NodeContext;
}

// Layout constants
export const NODE_HEIGHT = 70;
export const VERTICAL_GAP = 76;
export const MATCH_GAP = NODE_HEIGHT + VERTICAL_GAP; // 146
export const ROUND_GAP = 220;
export const RIGHT_START_X = ROUND_GAP * 7; // 2380

export const LEFT_RING_COLOR = "#f3370e";
export const RIGHT_RING_COLOR = "#5CE1E6";

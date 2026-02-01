import type { Node } from "@xyflow/react";
import {
	bracket,
	FEEDER_GAMES,
	type Game,
	isLoser,
	isWinner,
	type Player,
	players,
	splitForDisplay,
} from "@/data/players";
import { getPlayerById, getPlayersForGame } from "@/lib/simulation";
import type { NodeContext, RoundGeneratorOptions } from "./bracketTypes";
import {
	LEFT_RING_COLOR,
	MATCH_GAP,
	RIGHT_RING_COLOR,
	RIGHT_START_X,
	ROUND_GAP,
} from "./bracketTypes";
import type { InteractionMode, PickState, PredictionState } from "./PlayerNode";

// Node is large if its feeder is decided AND the current game is not decided
function isNodeLarge(
	gameId: string,
	slot: "p1" | "p2",
	hasResults: boolean,
	tournamentResults: Record<string, string>,
): boolean {
	if (!hasResults) {
		return gameId.startsWith("r1-"); // Initial state: only R1 is large
	}

	if (gameId.startsWith("r1-")) {
		return !tournamentResults[gameId]; // R1: large if game not decided
	}

	const feeders = FEEDER_GAMES[gameId];
	if (!feeders) return false;

	const feederGame = slot === "p1" ? feeders[0] : feeders[1];
	if (!tournamentResults[feederGame]) return false; // Small if feeder not decided
	return !tournamentResults[gameId]; // Large if feeder decided AND game not decided
}

function getRingColor(side: "left" | "right"): string {
	return side === "left" ? LEFT_RING_COLOR : RIGHT_RING_COLOR;
}

function getPhotoPath(player: Player, isEliminated: boolean): string {
	const filename = player.photo.replace("/avatars/", "");
	return isEliminated
		? `/avatars/bw/${filename}`
		: `/avatars/color/${filename}`;
}

function playerToNodeData(
	player: Player,
	game: Game,
	ringColor: string,
	side: "left" | "right",
	round: "round1" | "later" = "later",
	options?: {
		prediction?: PredictionState;
		isLoser?: boolean;
		showBio?: boolean;
	},
): {
	photo: string;
	name: string;
	byline: string;
	ringColor: string;
	isWinner: boolean;
	isEliminated: boolean;
	isLoser: boolean;
	showBio: boolean;
	side: "left" | "right";
	round: "round1" | "later";
	prediction?: PredictionState;
	playerId?: string;
	gameId?: string;
} {
	const isEliminated =
		options?.isLoser !== undefined ? options.isLoser : isLoser(game, player);
	return {
		photo: getPhotoPath(player, isEliminated),
		name: player.name,
		byline: player.byline,
		ringColor,
		isWinner: isWinner(game, player),
		isEliminated,
		isLoser: isEliminated,
		showBio: options?.showBio ?? true,
		side,
		round,
		prediction: options?.prediction,
		playerId: player.id,
		gameId: game.id,
	};
}

function createNode(
	id: string,
	player: Player | undefined,
	game: Game,
	ringColor: string,
	position: { x: number; y: number },
	side: "left" | "right",
	round: "round1" | "later" = "later",
	emptyText?: string,
	nodeOptions?: {
		prediction?: PredictionState;
		isLoser?: boolean;
		showBio?: boolean;
	},
): Node {
	if (player) {
		return {
			id,
			type: "playerNode",
			position,
			data: playerToNodeData(player, game, ringColor, side, round, nodeOptions),
		};
	}
	return {
		id,
		type: "emptySlot",
		position,
		data: { text: emptyText, side, ringColor, round },
	};
}

function getPredictionOptions(
	game: Game,
	player: Player | undefined,
	ctx: NodeContext,
): PredictionState | undefined {
	// If not showing picks, don't return any pick state
	if (!ctx.showPicks) {
		return undefined;
	}

	const userPick = ctx.predictions[game.id];
	const actualWinner = ctx.tournamentResults[game.id];

	const defaults: PredictionState = {
		pickState: { status: "noPick" },
		interactionMode: "view",
	};

	if (!player) {
		return defaults;
	}

	// Determine if this player can be picked
	const pickablePlayers = ctx.pickablePlayersCache[game.id];
	const bothPlayersDetermined =
		pickablePlayers[0] !== undefined && pickablePlayers[1] !== undefined;
	const canPick =
		ctx.isInteractive &&
		ctx.isPickingEnabled &&
		bothPlayersDetermined &&
		(player.id === pickablePlayers[0] || player.id === pickablePlayers[1]);
	const interactionMode: InteractionMode = canPick ? "pickable" : "view";
	const onPick = canPick ? ctx.onPick : undefined;

	// Game has a result - determine correct/incorrect
	if (actualWinner) {
		if (ctx.isLocked && !ctx.showPicks) {
			return defaults;
		}
		const isWinnerPlayer = actualWinner === player.id;
		const wasPickedForThisGame = userPick === player.id;

		let pickState: PickState;
		if (wasPickedForThisGame) {
			pickState = isWinnerPlayer
				? { status: "correct" }
				: { status: "incorrect" };
		} else {
			pickState = { status: "none" };
		}

		return { pickState, interactionMode: "view" };
	}

	// No result yet - determine pending/none pick state
	if (userPick) {
		if (ctx.isLocked && !ctx.showPicks) {
			return { pickState: { status: "noPick" }, interactionMode, onPick };
		}
		const isPickedForThisGame = userPick === player.id;
		const pickState: PickState = isPickedForThisGame
			? { status: "pending" }
			: { status: "none" };
		return { pickState, interactionMode, onPick };
	}

	return { pickState: { status: "noPick" }, interactionMode, onPick };
}

function isPlayerLoser(
	gameId: string,
	playerId: string,
	ctx: NodeContext,
): boolean {
	if (!ctx.hasResults || ctx.showPicks) return false;
	const winner = ctx.tournamentResults[gameId];
	if (!winner) return false;
	return winner !== playerId;
}

export function generateRound1Nodes({
	side,
	ctx,
}: RoundGeneratorOptions): Node[] {
	const nodes: Node[] = [];
	const round1 = splitForDisplay(bracket.round1);
	const games = side === "left" ? round1.left : round1.right;
	const ringColor = getRingColor(side);
	const xPos = side === "left" ? 0 : RIGHT_START_X;

	games.forEach((game, gameIndex) => {
		const baseY = gameIndex * 2 * MATCH_GAP;
		const player1 = game.player1;
		const player2 = game.player2;
		// For R1, slot doesn't matter - both check if game is decided
		const gameLarge = isNodeLarge(
			game.id,
			"p1",
			ctx.hasResults,
			ctx.tournamentResults,
		);

		const p1Options = getPredictionOptions(game, player1, ctx);
		const p1Loser = player1 ? isPlayerLoser(game.id, player1.id, ctx) : false;
		nodes.push(
			createNode(
				`${game.id}-p1`,
				player1,
				game,
				ringColor,
				{ x: xPos, y: baseY },
				side,
				gameLarge ? "round1" : "later",
				undefined,
				{ prediction: p1Options, showBio: true, isLoser: p1Loser },
			),
		);

		const p2Options = getPredictionOptions(game, player2, ctx);
		const p2Loser = player2 ? isPlayerLoser(game.id, player2.id, ctx) : false;
		nodes.push(
			createNode(
				`${game.id}-p2`,
				player2,
				game,
				ringColor,
				{ x: xPos, y: baseY + MATCH_GAP },
				side,
				gameLarge ? "round1" : "later",
				undefined,
				{ prediction: p2Options, showBio: true, isLoser: p2Loser },
			),
		);
	});

	return nodes;
}

export function generateQuarterNodes({
	side,
	ctx,
}: RoundGeneratorOptions): Node[] {
	const nodes: Node[] = [];
	const quarters = splitForDisplay(bracket.quarters);
	const games = side === "left" ? quarters.left : quarters.right;
	const ringColor = getRingColor(side);
	const xPos = side === "left" ? ROUND_GAP : RIGHT_START_X - ROUND_GAP;

	games.forEach((game, gameIndex) => {
		const p1Large = isNodeLarge(
			game.id,
			"p1",
			ctx.hasResults,
			ctx.tournamentResults,
		);
		const p2Large = isNodeLarge(
			game.id,
			"p2",
			ctx.hasResults,
			ctx.tournamentResults,
		);
		const qfOffset = p1Large || p2Large ? MATCH_GAP * 0.5 : MATCH_GAP * 0.637;
		const baseY = gameIndex * 4 * MATCH_GAP + qfOffset;

		let player1: Player | undefined;
		let player2: Player | undefined;
		if (ctx.showPicks || (ctx.isInteractive && !ctx.isLocked)) {
			const pickablePlayers = ctx.pickablePlayersCache[game.id];
			player1 = pickablePlayers[0]
				? players.find((p) => p.id === pickablePlayers[0])
				: undefined;
			player2 = pickablePlayers[1]
				? players.find((p) => p.id === pickablePlayers[1])
				: undefined;
		} else if (ctx.hasResults) {
			const [p1Id, p2Id] = getPlayersForGame(game.id, ctx.tournamentResults);
			player1 = p1Id ? getPlayerById(p1Id) : undefined;
			player2 = p2Id ? getPlayerById(p2Id) : undefined;
		} else {
			player1 = game.player1;
			player2 = game.player2;
		}

		const p1Options = getPredictionOptions(game, player1, ctx);
		const p1Loser = player1 ? isPlayerLoser(game.id, player1.id, ctx) : false;
		nodes.push(
			createNode(
				`${game.id}-p1`,
				player1,
				game,
				ringColor,
				{ x: xPos, y: baseY },
				side,
				p1Large ? "round1" : "later",
				"TBD",
				{ prediction: p1Options, showBio: false, isLoser: p1Loser },
			),
		);

		const p2Options = getPredictionOptions(game, player2, ctx);
		const p2Loser = player2 ? isPlayerLoser(game.id, player2.id, ctx) : false;
		nodes.push(
			createNode(
				`${game.id}-p2`,
				player2,
				game,
				ringColor,
				{ x: xPos, y: baseY + 2 * MATCH_GAP },
				side,
				p2Large ? "round1" : "later",
				"TBD",
				{ prediction: p2Options, showBio: false, isLoser: p2Loser },
			),
		);
	});

	return nodes;
}

export function generateSemiNodes({
	side,
	ctx,
}: RoundGeneratorOptions): Node[] {
	const nodes: Node[] = [];
	const semis = splitForDisplay(bracket.semis);
	const games = side === "left" ? semis.left : semis.right;
	const ringColor = getRingColor(side);
	const xPos = side === "left" ? ROUND_GAP * 2 : RIGHT_START_X - ROUND_GAP * 2;

	games.forEach((game) => {
		const p1Large = isNodeLarge(
			game.id,
			"p1",
			ctx.hasResults,
			ctx.tournamentResults,
		);
		const p2Large = isNodeLarge(
			game.id,
			"p2",
			ctx.hasResults,
			ctx.tournamentResults,
		);
		const sfOffset = p1Large || p2Large ? 1.35 : 1.5;
		const baseY = sfOffset * MATCH_GAP;

		let player1: Player | undefined;
		let player2: Player | undefined;
		if (ctx.showPicks || (ctx.isInteractive && !ctx.isLocked)) {
			const pickablePlayers = ctx.pickablePlayersCache[game.id];
			player1 = pickablePlayers[0]
				? players.find((p) => p.id === pickablePlayers[0])
				: undefined;
			player2 = pickablePlayers[1]
				? players.find((p) => p.id === pickablePlayers[1])
				: undefined;
		} else if (ctx.hasResults) {
			const [p1Id, p2Id] = getPlayersForGame(game.id, ctx.tournamentResults);
			player1 = p1Id ? getPlayerById(p1Id) : undefined;
			player2 = p2Id ? getPlayerById(p2Id) : undefined;
		} else {
			player1 = game.player1;
			player2 = game.player2;
		}

		const p1Options = getPredictionOptions(game, player1, ctx);
		const p1Loser = player1 ? isPlayerLoser(game.id, player1.id, ctx) : false;
		nodes.push(
			createNode(
				`${game.id}-p1`,
				player1,
				game,
				ringColor,
				{ x: xPos, y: baseY },
				side,
				p1Large ? "round1" : "later",
				"TBD",
				{ prediction: p1Options, showBio: false, isLoser: p1Loser },
			),
		);

		const p2Options = getPredictionOptions(game, player2, ctx);
		const p2Loser = player2 ? isPlayerLoser(game.id, player2.id, ctx) : false;
		nodes.push(
			createNode(
				`${game.id}-p2`,
				player2,
				game,
				ringColor,
				{ x: xPos, y: baseY + 4 * MATCH_GAP },
				side,
				p2Large ? "round1" : "later",
				"TBD",
				{ prediction: p2Options, showBio: false, isLoser: p2Loser },
			),
		);
	});

	return nodes;
}

export function generateFinalistNode({
	side,
	ctx,
}: RoundGeneratorOptions): Node {
	const finalGame = bracket.finals[0];
	const ringColor = getRingColor(side);
	// Left finalist is p1 (fed from sf-0), right finalist is p2 (fed from sf-1)
	const finalistLarge = isNodeLarge(
		"final",
		side === "left" ? "p1" : "p2",
		ctx.hasResults,
		ctx.tournamentResults,
	);

	let finalist: Player | undefined;
	const sfGameId = side === "left" ? "sf-0" : "sf-1";

	if (ctx.showPicks || (ctx.isInteractive && !ctx.isLocked)) {
		const finalistId = ctx.predictions[sfGameId];
		finalist = finalistId
			? players.find((p) => p.id === finalistId)
			: undefined;
	} else if (ctx.hasResults) {
		const [p1Id, p2Id] = getPlayersForGame("final", ctx.tournamentResults);
		finalist =
			side === "left"
				? p1Id
					? getPlayerById(p1Id)
					: undefined
				: p2Id
					? getPlayerById(p2Id)
					: undefined;
	} else {
		finalist = side === "left" ? finalGame.player1 : finalGame.player2;
	}

	const finalistOptions = getPredictionOptions(finalGame, finalist, ctx);
	const finalistLoser = finalist
		? isPlayerLoser("final", finalist.id, ctx)
		: false;

	const xPos =
		side === "left" ? ROUND_GAP * 3 + 23 : RIGHT_START_X - ROUND_GAP * 2.5 - 23;

	return createNode(
		`${side}-finalist`,
		finalist,
		finalGame,
		ringColor,
		{ x: xPos, y: (finalistLarge ? 3.35 : 3.5) * MATCH_GAP },
		side,
		finalistLarge ? "round1" : "later",
		"Finalist TBD",
		{ prediction: finalistOptions, showBio: false, isLoser: finalistLoser },
	);
}

export function generateChampionshipNode(ctx: NodeContext): Node {
	const finalGame = bracket.finals[0];

	let champion: Player | undefined;
	if (ctx.showPicks || (ctx.isInteractive && !ctx.isLocked)) {
		const championId = ctx.predictions.final;
		champion = championId
			? players.find((p) => p.id === championId)
			: undefined;
	} else if (ctx.hasResults && ctx.tournamentResults.final) {
		champion = getPlayerById(ctx.tournamentResults.final);
	} else {
		champion = finalGame.winner;
	}

	return {
		id: "championship",
		type: champion ? "playerNode" : "emptySlot",
		position: {
			x: ROUND_GAP * 3.75,
			y: 0,
		},
		data: champion
			? playerToNodeData(champion, finalGame, "#FFD700", "left", "later", {
					isLoser: false,
					showBio: false,
				})
			: { text: "CHAMPION", side: "left", ringColor: "#FFD700" },
	};
}

import type { Node } from "@xyflow/react";
import {
	bracket,
	FEEDER_GAMES,
	GAME_LINKS,
	type Game,
	getAirDateForGame,
	isLoser,
	isWinner,
	type Player,
	players,
	splitForDisplay,
	YOUTUBE_CHANNEL,
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

function getRingColor(side: "left" | "right"): string {
	return side === "left" ? LEFT_RING_COLOR : RIGHT_RING_COLOR;
}

function getPhotoPath(player: Player): string {
	const filename = player.photo.replace("/avatars/", "");
	return `/avatars/color/${filename}`;
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
		tournamentResults?: Record<string, string>;
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
	youtubeUrl?: string;
} {
	const isEliminated =
		options?.isLoser !== undefined ? options.isLoser : isLoser(game, player);
	const results = options?.tournamentResults ?? {};
	const playerIsWinner =
		isWinner(game, player) || results[game.id] === player.id;

	let youtubeUrl: string | undefined;
	if (!game.id.startsWith("r1-")) {
		const feederGameId = getFeederGameForPlayer(game.id, player.id, results);
		if (feederGameId) {
			youtubeUrl = getYoutubeUrl(feederGameId);
		}
	}

	return {
		photo: getPhotoPath(player),
		name: player.name,
		byline: player.byline,
		ringColor,
		isWinner: playerIsWinner,
		isEliminated,
		isLoser: isEliminated,
		showBio: options?.showBio ?? true,
		side,
		round,
		prediction: options?.prediction,
		playerId: player.id,
		gameId: game.id,
		youtubeUrl,
	};
}

function getYoutubeUrl(gameId: string): string {
	const videoId = GAME_LINKS[gameId];
	if (videoId) return `https://www.youtube.com/watch?v=${videoId}`;
	return YOUTUBE_CHANNEL;
}

function getFeederGameForPlayer(
	gameId: string,
	playerId: string,
	tournamentResults: Record<string, string>,
): string | undefined {
	const feeders = FEEDER_GAMES[gameId];
	if (!feeders) return undefined;
	return feeders.find((fId) => tournamentResults[fId] === playerId);
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
	tournamentResults?: Record<string, string>,
): Node {
	if (player) {
		return {
			id,
			type: "playerNode",
			position,
			data: playerToNodeData(player, game, ringColor, side, round, {
				...nodeOptions,
				tournamentResults,
			}),
		};
	}
	const airDate = getAirDateForGame(game.id);
	return {
		id,
		type: "emptySlot",
		position,
		data: {
			text: emptyText,
			side,
			ringColor,
			round,
			airDate,
			youtubeUrl: getYoutubeUrl(game.id),
		},
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
				"round1",
				undefined,
				{ prediction: p1Options, showBio: true, isLoser: p1Loser },
				ctx.tournamentResults,
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
				"round1",
				undefined,
				{ prediction: p2Options, showBio: true, isLoser: p2Loser },
				ctx.tournamentResults,
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
		const qfOffset = MATCH_GAP * 0.637;
		const baseY = gameIndex * 4 * MATCH_GAP + qfOffset;

		let player1: Player | undefined;
		let player2: Player | undefined;
		if (ctx.showPicks) {
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
				"later",
				"Quarter Finalist",
				{ prediction: p1Options, showBio: false, isLoser: p1Loser },
				ctx.tournamentResults,
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
				"later",
				"Quarter Finalist",
				{ prediction: p2Options, showBio: false, isLoser: p2Loser },
				ctx.tournamentResults,
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
		const baseY = 1.5 * MATCH_GAP;

		let player1: Player | undefined;
		let player2: Player | undefined;
		if (ctx.showPicks) {
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
				"later",
				"Semi Finalist",
				{ prediction: p1Options, showBio: false, isLoser: p1Loser },
				ctx.tournamentResults,
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
				"later",
				"Semi Finalist",
				{ prediction: p2Options, showBio: false, isLoser: p2Loser },
				ctx.tournamentResults,
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

	let finalist: Player | undefined;
	const sfGameId = side === "left" ? "sf-0" : "sf-1";

	if (ctx.showPicks) {
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
		{ x: xPos, y: 3.5 * MATCH_GAP },
		side,
		"later",
		"Finalist",
		{ prediction: finalistOptions, showBio: false, isLoser: finalistLoser },
		ctx.tournamentResults,
	);
}

export function generateChampionshipNode(ctx: NodeContext): Node {
	const finalGame = bracket.finals[0];

	let champion: Player | undefined;
	if (ctx.showPicks) {
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
			? {
					...playerToNodeData(champion, finalGame, "#FFD700", "left", "later", {
						isLoser: false,
						showBio: false,
						tournamentResults: ctx.tournamentResults,
					}),
					youtubeUrl: getYoutubeUrl("final"),
				}
			: {
					text: "CHAMPION",
					side: "left",
					ringColor: "#FFD700",
					airDate: getAirDateForGame("final"),
					youtubeUrl: getYoutubeUrl("final"),
				},
	};
}

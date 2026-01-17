import {
	Controls,
	type Edge,
	type EdgeProps,
	getNodesBounds,
	getSmoothStepPath,
	type Node,
	ReactFlow,
	type ReactFlowInstance,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "@xyflow/react/dist/style.css";
import {
	emptyBracket as bracket,
	type Game,
	isLoser,
	isWinner,
	type Player,
	players,
	splitForDisplay,
} from "@/data/players";
import { getPickablePlayersForGame } from "@/hooks/usePredictions";
import { EmptySlotFlow, PlayerNodeFlow } from "./PlayerNode";
import "./bracket.css";

export interface BracketProps {
	predictions?: Record<string, string>;
	onPick?: (gameId: string, playerId: string) => void;
	isLocked?: boolean;
	isAuthenticated?: boolean;
	getPickablePlayers?: (gameId: string) => string[];
}

const LEFT_RING_COLOR = "#f3370e";
const RIGHT_RING_COLOR = "#5CE1E6";

function BracketEdge({
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
}: EdgeProps) {
	const [edgePath] = getSmoothStepPath({
		sourceX,
		sourceY,
		targetX,
		targetY,
		sourcePosition,
		targetPosition,
		borderRadius: 0,
	});

	return <path d={edgePath} fill="none" stroke="#FFFFFF" strokeWidth={3} />;
}

const nodeTypes = {
	playerNode: PlayerNodeFlow,
	emptySlot: EmptySlotFlow,
};

const edgeTypes = {
	bracket: BracketEdge,
};

const NODE_HEIGHT = 70;
const VERTICAL_GAP = 76;
const MATCH_GAP = NODE_HEIGHT + VERTICAL_GAP;
const ROUND_GAP = 220;
const RIGHT_START_X = ROUND_GAP * 7;

function playerToNodeData(
	player: Player,
	game: Game,
	ringColor: string,
	options?: {
		isSelected?: boolean;
		isPickable?: boolean;
		onPick?: (gameId: string, playerId: string) => void;
	},
): {
	photo: string;
	name: string;
	byline: string;
	ringColor: string;
	isWinner: boolean;
	isEliminated: boolean;
	isSelected?: boolean;
	isPickable?: boolean;
	playerId?: string;
	gameId?: string;
	onPick?: (gameId: string, playerId: string) => void;
} {
	return {
		photo: player.photo,
		name: player.name,
		byline: player.byline,
		ringColor,
		isWinner: isWinner(game, player),
		isEliminated: isLoser(game, player),
		isSelected: options?.isSelected,
		isPickable: options?.isPickable,
		playerId: player.id,
		gameId: game.id,
		onPick: options?.onPick,
	};
}

function createNode(
	id: string,
	player: Player | undefined,
	game: Game,
	ringColor: string,
	position: { x: number; y: number },
	emptyText?: string,
	predictionOptions?: {
		isSelected?: boolean;
		isPickable?: boolean;
		onPick?: (gameId: string, playerId: string) => void;
	},
): Node {
	if (player) {
		return {
			id,
			type: "playerNode",
			position,
			data: playerToNodeData(player, game, ringColor, predictionOptions),
		};
	}
	return {
		id,
		type: "emptySlot",
		position,
		data: { text: emptyText },
	};
}

function generateNodes(
	predictions: Record<string, string> = {},
	onPick?: (gameId: string, playerId: string) => void,
	isPickingEnabled = false,
): Node[] {
	const nodes: Node[] = [];

	const getPredictionOptions = (
		game: Game,
		player: Player | undefined,
	): {
		isSelected: boolean;
		isPickable: boolean;
		onPick?: (gameId: string, playerId: string) => void;
	} => {
		if (!player) {
			return { isSelected: false, isPickable: false };
		}

		const pickablePlayers = getPickablePlayersForGame(game.id, predictions);
		// Both players must be determined before picks can be made
		const bothPlayersDetermined =
			pickablePlayers[0] !== undefined && pickablePlayers[1] !== undefined;
		const isPickable =
			isPickingEnabled &&
			bothPlayersDetermined &&
			(player.id === pickablePlayers[0] || player.id === pickablePlayers[1]);
		const isSelected = predictions[game.id] === player.id;

		return {
			isSelected,
			isPickable,
			onPick: isPickable ? onPick : undefined,
		};
	};

	const round1 = splitForDisplay(bracket.round1);
	const quarters = splitForDisplay(bracket.quarters);
	const semis = splitForDisplay(bracket.semis);

	// LEFT SIDE
	round1.left.forEach((game, gameIndex) => {
		const baseY = gameIndex * 2 * MATCH_GAP;
		const globalGameIndex = gameIndex; // 0, 1, 2, 3 for left side
		const player1 = players[globalGameIndex * 2];
		const player2 = players[globalGameIndex * 2 + 1];

		const p1Options = getPredictionOptions(game, player1);
		nodes.push(
			createNode(
				`${game.id}-p1`,
				player1,
				game,
				LEFT_RING_COLOR,
				{ x: 0, y: baseY },
				undefined,
				p1Options,
			),
		);

		const p2Options = getPredictionOptions(game, player2);
		nodes.push(
			createNode(
				`${game.id}-p2`,
				player2,
				game,
				LEFT_RING_COLOR,
				{ x: 0, y: baseY + MATCH_GAP },
				undefined,
				p2Options,
			),
		);
	});

	quarters.left.forEach((game, gameIndex) => {
		const baseY = gameIndex * 4 * MATCH_GAP + MATCH_GAP / 2;
		const pickablePlayers = getPickablePlayersForGame(game.id, predictions);
		const player1 = pickablePlayers[0]
			? players.find((p) => p.id === pickablePlayers[0])
			: undefined;
		const player2 = pickablePlayers[1]
			? players.find((p) => p.id === pickablePlayers[1])
			: undefined;

		const p1Options = getPredictionOptions(game, player1);
		nodes.push(
			createNode(
				`${game.id}-p1`,
				player1,
				game,
				LEFT_RING_COLOR,
				{ x: ROUND_GAP, y: baseY },
				"TBD",
				p1Options,
			),
		);

		const p2Options = getPredictionOptions(game, player2);
		nodes.push(
			createNode(
				`${game.id}-p2`,
				player2,
				game,
				LEFT_RING_COLOR,
				{ x: ROUND_GAP, y: baseY + 2 * MATCH_GAP },
				"TBD",
				p2Options,
			),
		);
	});

	semis.left.forEach((game) => {
		const baseY = 1.5 * MATCH_GAP;
		const pickablePlayers = getPickablePlayersForGame(game.id, predictions);
		const player1 = pickablePlayers[0]
			? players.find((p) => p.id === pickablePlayers[0])
			: undefined;
		const player2 = pickablePlayers[1]
			? players.find((p) => p.id === pickablePlayers[1])
			: undefined;

		const p1Options = getPredictionOptions(game, player1);
		nodes.push(
			createNode(
				`${game.id}-p1`,
				player1,
				game,
				LEFT_RING_COLOR,
				{ x: ROUND_GAP * 2, y: baseY },
				"TBD",
				p1Options,
			),
		);

		const p2Options = getPredictionOptions(game, player2);
		nodes.push(
			createNode(
				`${game.id}-p2`,
				player2,
				game,
				LEFT_RING_COLOR,
				{ x: ROUND_GAP * 2, y: baseY + 4 * MATCH_GAP },
				"TBD",
				p2Options,
			),
		);
	});

	const finalGame = bracket.finals[0];
	const leftFinalistId = predictions["sf-0"];
	const leftFinalist = leftFinalistId
		? players.find((p) => p.id === leftFinalistId)
		: undefined;
	const leftFinalistOptions = getPredictionOptions(finalGame, leftFinalist);
	nodes.push(
		createNode(
			`left-finalist`,
			leftFinalist,
			finalGame,
			LEFT_RING_COLOR,
			{ x: ROUND_GAP * 3, y: 3.5 * MATCH_GAP },
			"Left Finalist",
			leftFinalistOptions,
		),
	);

	// RIGHT SIDE
	round1.right.forEach((game, gameIndex) => {
		const baseY = gameIndex * 2 * MATCH_GAP;
		const globalGameIndex = gameIndex + 4; // 4, 5, 6, 7 for right side
		const player1 = players[globalGameIndex * 2];
		const player2 = players[globalGameIndex * 2 + 1];

		const p1Options = getPredictionOptions(game, player1);
		nodes.push(
			createNode(
				`${game.id}-p1`,
				player1,
				game,
				RIGHT_RING_COLOR,
				{ x: RIGHT_START_X, y: baseY },
				undefined,
				p1Options,
			),
		);

		const p2Options = getPredictionOptions(game, player2);
		nodes.push(
			createNode(
				`${game.id}-p2`,
				player2,
				game,
				RIGHT_RING_COLOR,
				{ x: RIGHT_START_X, y: baseY + MATCH_GAP },
				undefined,
				p2Options,
			),
		);
	});

	quarters.right.forEach((game, gameIndex) => {
		const baseY = gameIndex * 4 * MATCH_GAP + MATCH_GAP / 2;
		const pickablePlayers = getPickablePlayersForGame(game.id, predictions);
		const player1 = pickablePlayers[0]
			? players.find((p) => p.id === pickablePlayers[0])
			: undefined;
		const player2 = pickablePlayers[1]
			? players.find((p) => p.id === pickablePlayers[1])
			: undefined;

		const p1Options = getPredictionOptions(game, player1);
		nodes.push(
			createNode(
				`${game.id}-p1`,
				player1,
				game,
				RIGHT_RING_COLOR,
				{ x: RIGHT_START_X - ROUND_GAP, y: baseY },
				"TBD",
				p1Options,
			),
		);

		const p2Options = getPredictionOptions(game, player2);
		nodes.push(
			createNode(
				`${game.id}-p2`,
				player2,
				game,
				RIGHT_RING_COLOR,
				{ x: RIGHT_START_X - ROUND_GAP, y: baseY + 2 * MATCH_GAP },
				"TBD",
				p2Options,
			),
		);
	});

	semis.right.forEach((game) => {
		const baseY = 1.5 * MATCH_GAP;
		const pickablePlayers = getPickablePlayersForGame(game.id, predictions);
		const player1 = pickablePlayers[0]
			? players.find((p) => p.id === pickablePlayers[0])
			: undefined;
		const player2 = pickablePlayers[1]
			? players.find((p) => p.id === pickablePlayers[1])
			: undefined;

		const p1Options = getPredictionOptions(game, player1);
		nodes.push(
			createNode(
				`${game.id}-p1`,
				player1,
				game,
				RIGHT_RING_COLOR,
				{ x: RIGHT_START_X - ROUND_GAP * 2, y: baseY },
				"TBD",
				p1Options,
			),
		);

		const p2Options = getPredictionOptions(game, player2);
		nodes.push(
			createNode(
				`${game.id}-p2`,
				player2,
				game,
				RIGHT_RING_COLOR,
				{ x: RIGHT_START_X - ROUND_GAP * 2, y: baseY + 4 * MATCH_GAP },
				"TBD",
				p2Options,
			),
		);
	});

	const rightFinalistId = predictions["sf-1"];
	const rightFinalist = rightFinalistId
		? players.find((p) => p.id === rightFinalistId)
		: undefined;
	const rightFinalistOptions = getPredictionOptions(finalGame, rightFinalist);
	nodes.push(
		createNode(
			`right-finalist`,
			rightFinalist,
			finalGame,
			RIGHT_RING_COLOR,
			{ x: RIGHT_START_X - ROUND_GAP * 3, y: 3.5 * MATCH_GAP },
			"Right Finalist",
			rightFinalistOptions,
		),
	);

	// CHAMPIONSHIP
	const championId = predictions.final;
	const champion = championId
		? players.find((p) => p.id === championId)
		: undefined;

	// ===========================================================================
	// CHAMPIONSHIP (center)
	// ===========================================================================
	const finalGame = bracket.finals[0];
	// Center between left finalist (x=3) and right finalist (x=4.5)
	nodes.push({
		id: "championship",
		type: champion ? "playerNode" : "emptySlot",
		position: {
			x: ROUND_GAP * 3.75,
			y: 0,
		},
		data: champion
			? playerToNodeData(champion, finalGame, "#FFD700")
			: { text: "CHAMPION" },
	});

	return nodes;
}

const edgeStyle: React.CSSProperties = {
	stroke: "#ffffff",
	strokeWidth: 3,
	filter: "drop-shadow(0px 0px 7px black)",
};

function generateEdges(): Edge[] {
	const edges: Edge[] = [];
	const round1 = splitForDisplay(bracket.round1);
	const quarters = splitForDisplay(bracket.quarters);
	const semis = splitForDisplay(bracket.semis);

	// LEFT SIDE EDGES
	round1.left.forEach((game, gameIndex) => {
		const quarterGame = quarters.left[Math.floor(gameIndex / 2)];

		edges.push({
			id: `${game.id}-p1-to-${quarterGame.id}`,
			source: `${game.id}-p1`,
			target: `${quarterGame.id}-p${(gameIndex % 2) + 1}`,
			type: "bracket",
			style: edgeStyle,
			sourceHandle: "out-right",
			targetHandle: "in-top",
		});

		edges.push({
			id: `${game.id}-p2-to-${quarterGame.id}`,
			source: `${game.id}-p2`,
			target: `${quarterGame.id}-p${(gameIndex % 2) + 1}`,
			type: "bracket",
			style: edgeStyle,
			targetHandle: "in-bottom",
		});
	});

	quarters.left.forEach((game, gameIndex) => {
		const semiGame = semis.left[0];

		edges.push({
			id: `${game.id}-p1-to-${semiGame.id}`,
			source: `${game.id}-p1`,
			target: `${semiGame.id}-p${gameIndex + 1}`,
			type: "bracket",
			style: edgeStyle,
			sourceHandle: "out-right",
			targetHandle: "in-top",
		});

		edges.push({
			id: `${game.id}-p2-to-${semiGame.id}`,
			source: `${game.id}-p2`,
			target: `${semiGame.id}-p${gameIndex + 1}`,
			type: "bracket",
			style: edgeStyle,
			sourceHandle: "out-right",
			targetHandle: "in-bottom",
		});
	});

	semis.left.forEach((game) => {
		edges.push({
			id: `${game.id}-p1-to-left-finalist`,
			source: `${game.id}-p1`,
			target: `left-finalist`,
			type: "bracket",
			style: edgeStyle,
			sourceHandle: "out-right",
			targetHandle: "in-top",
		});

		edges.push({
			id: `${game.id}-p2-to-left-finalist`,
			source: `${game.id}-p2`,
			target: `left-finalist`,
			type: "bracket",
			style: edgeStyle,
			sourceHandle: "out-right",
			targetHandle: "in-bottom",
		});
	});

	edges.push({
		id: "left-finalist-to-champ",
		source: `left-finalist`,
		target: "championship",
		type: "bracket",
		style: edgeStyle,
		sourceHandle: "out-right",
		targetHandle: "in-bottom",
	});

	// RIGHT SIDE EDGES
	round1.right.forEach((game, gameIndex) => {
		const quarterGame = quarters.right[Math.floor(gameIndex / 2)];

		edges.push({
			id: `${game.id}-p1-to-${quarterGame.id}`,
			source: `${game.id}-p1`,
			target: `${quarterGame.id}-p${(gameIndex % 2) + 1}`,
			type: "bracket",
			style: edgeStyle,
			sourceHandle: "out-left",
			targetHandle: "in-top",
		});

		edges.push({
			id: `${game.id}-p2-to-${quarterGame.id}`,
			source: `${game.id}-p2`,
			target: `${quarterGame.id}-p${(gameIndex % 2) + 1}`,
			type: "bracket",
			style: edgeStyle,
			sourceHandle: "out-left",
			targetHandle: "in-bottom",
		});
	});

	quarters.right.forEach((game, gameIndex) => {
		const semiGame = semis.right[0];

		edges.push({
			id: `${game.id}-p1-to-${semiGame.id}`,
			source: `${game.id}-p1`,
			target: `${semiGame.id}-p${gameIndex + 1}`,
			type: "bracket",
			style: edgeStyle,
			sourceHandle: "out-left",
			targetHandle: "in-top",
		});

		edges.push({
			id: `${game.id}-p2-to-${semiGame.id}`,
			source: `${game.id}-p2`,
			target: `${semiGame.id}-p${gameIndex + 1}`,
			type: "bracket",
			style: edgeStyle,
			sourceHandle: "out-left",
			targetHandle: "in-bottom",
		});
	});

	semis.right.forEach((game) => {
		edges.push({
			id: `${game.id}-p1-to-right-finalist`,
			source: `${game.id}-p1`,
			target: `right-finalist`,
			type: "bracket",
			style: edgeStyle,
			sourceHandle: "out-left",
			targetHandle: "in-top",
		});

		edges.push({
			id: `${game.id}-p2-to-right-finalist`,
			source: `${game.id}-p2`,
			target: `right-finalist`,
			type: "bracket",
			style: edgeStyle,
			sourceHandle: "out-left",
			targetHandle: "in-bottom",
		});
	});

	edges.push({
		id: "right-finalist-to-champ",
		source: `right-finalist`,
		target: "championship",
		type: "bracket",
		style: edgeStyle,
		sourceHandle: "out-left",
		targetHandle: "in-bottom",
	});

	return edges;
}

const defaultEdgeOptions = {
	type: "bracket",
	style: edgeStyle,
};

const FIT_VIEW_PADDING = 0;

function BracketContent({
	predictions = {},
	onPick,
	isLocked = false,
	isAuthenticated = false,
}: BracketProps) {
	const nodes = useMemo(
		() => generateNodes(predictions, onPick, isAuthenticated && !isLocked),
		[predictions, onPick, isAuthenticated, isLocked],
	);
	const edges = useMemo(() => generateEdges(), []);
	const containerRef = useRef<HTMLDivElement>(null);
	const [containerHeight, setContainerHeight] = useState<number | null>(null);
	const rfInstanceRef = useRef<ReactFlowInstance | null>(null);
	const boundsRef = useRef<{ width: number; height: number } | null>(null);
	const [scrollZoomLocked, setScrollZoomLocked] = useState(true);
	const unlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const clearUnlockTimer = useCallback(() => {
		if (unlockTimerRef.current) {
			clearTimeout(unlockTimerRef.current);
			unlockTimerRef.current = null;
		}
	}, []);

	const handleMouseEnter = useCallback(() => {
		clearUnlockTimer();
		unlockTimerRef.current = setTimeout(() => {
			setScrollZoomLocked(false);
		}, 1500);
	}, [clearUnlockTimer]);

	const handleMouseLeave = useCallback(() => {
		clearUnlockTimer();
		setScrollZoomLocked(true);
	}, [clearUnlockTimer]);

	const handleClick = useCallback(() => {
		clearUnlockTimer();
		setScrollZoomLocked(false);
	}, [clearUnlockTimer]);

	useEffect(() => {
		return () => clearUnlockTimer();
	}, [clearUnlockTimer]);

	const calculateHeight = useCallback(() => {
		if (!containerRef.current || !boundsRef.current) return;

		const containerWidth = containerRef.current.clientWidth;
		if (containerWidth === 0) return;

		const { width: contentWidth, height: contentHeight } = boundsRef.current;
		const aspectRatio = contentHeight / contentWidth;
		const paddingMultiplier = 1 + FIT_VIEW_PADDING * 2;
		const scaledHeight = containerWidth * aspectRatio * paddingMultiplier;

		setContainerHeight(scaledHeight);
	}, []);

	const handleInit = (instance: ReactFlowInstance) => {
		rfInstanceRef.current = instance;
		const nodes = instance.getNodes();
		const bounds = getNodesBounds(nodes);
		boundsRef.current = { width: bounds.width, height: bounds.height };
		calculateHeight();

		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				instance.fitView({ padding: FIT_VIEW_PADDING });
			});
		});
	};

	useEffect(() => {
		const handleResize = () => {
			calculateHeight();
			rfInstanceRef.current?.fitView({ padding: FIT_VIEW_PADDING });
		};
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [calculateHeight]);

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: this is a enhancement for mouse users. Feature still fully accessible.
		// biome-ignore lint/a11y/noStaticElementInteractions: see above
		<div
			ref={containerRef}
			className="bracket-container"
			style={containerHeight ? { height: containerHeight } : undefined}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onClick={handleClick}
		>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				nodeTypes={nodeTypes}
				edgeTypes={edgeTypes}
				defaultEdgeOptions={defaultEdgeOptions}
				minZoom={0.05}
				maxZoom={1.5}
				nodesDraggable={false}
				nodesConnectable={false}
				elementsSelectable={false}
				zoomOnScroll={!scrollZoomLocked}
				zoomOnPinch={true}
				panOnDrag={true}
				preventScrolling={!scrollZoomLocked}
				translateExtent={[
					[-500, -500],
					[2500, 1500],
				]}
				onNodeClick={(event, node) => {
					const data = node.data as {
						isPickable?: boolean;
						gameId?: string;
						playerId?: string;
						onPick?: (gameId: string, playerId: string) => void;
					};
					if (data.isPickable && data.onPick && data.gameId && data.playerId) {
						data.onPick(data.gameId, data.playerId);
					}
				}}
				onInit={handleInit}
			>
				<Controls
					className="bracket-controls"
					orientation="horizontal"
					showInteractive={false}
				/>
			</ReactFlow>
		</div>
	);
}

export function Bracket(props: BracketProps) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return <div className="bracket-container" />;
	}

	return <BracketContent {...props} />;
}

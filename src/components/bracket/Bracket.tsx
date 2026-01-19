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
import { useCallback, useEffect, useRef, useState } from "react";
import "@xyflow/react/dist/style.css";
import {
	// bracket,
	emptyBracket as bracket,
	type Game,
	isLoser,
	isWinner,
	type Player,
	splitForDisplay,
} from "@/data/players";
import { EmptySlotFlow, PlayerNodeFlow } from "./PlayerNode";
import "./bracket.css";

// Ring colors for each side
const LEFT_RING_COLOR = "#f3370e";
const RIGHT_RING_COLOR = "#5CE1E6";

// Custom edge component
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

// Register custom node types
const nodeTypes = {
	playerNode: PlayerNodeFlow,
	emptySlot: EmptySlotFlow,
};

// Register custom edge types
const edgeTypes = {
	bracket: BracketEdge,
};

// Node dimensions for positioning
const NODE_HEIGHT = 70;
const VERTICAL_GAP = 76;
const MATCH_GAP = NODE_HEIGHT + VERTICAL_GAP;
const ROUND_GAP = 220;

// Convert a Player to PlayerData for the node
function playerToNodeData(
	player: Player,
	game: Game,
	ringColor: string,
): {
	photo: string;
	name: string;
	byline: string;
	ringColor: string;
	isWinner: boolean;
	isEliminated: boolean;
} {
	return {
		photo: player.photo,
		name: player.name,
		byline: player.byline,
		ringColor,
		isWinner: isWinner(game, player),
		isEliminated: isLoser(game, player),
	};
}

// Create a node for either a player or an empty slot
function createNode(
	id: string,
	player: Player | undefined,
	game: Game,
	ringColor: string,
	position: { x: number; y: number },
	emptyText?: string,
): Node {
	if (player) {
		return {
			id,
			type: "playerNode",
			position,
			data: playerToNodeData(player, game, ringColor),
		};
	}
	return {
		id,
		type: "emptySlot",
		position,
		data: { text: emptyText },
	};
}

// Generate nodes from bracket data
function generateNodes(): Node[] {
	const nodes: Node[] = [];

	// Split each round into left/right halves
	const round1 = splitForDisplay(bracket.round1);
	const quarters = splitForDisplay(bracket.quarters);
	const semis = splitForDisplay(bracket.semis);

	// ===========================================================================
	// LEFT SIDE (first half of each round)
	// ===========================================================================

	// Round 1 - Left side (games 0-3)
	round1.left.forEach((game, gameIndex) => {
		const baseY = gameIndex * 2 * MATCH_GAP;

		// Player 1
		nodes.push(
			createNode(`${game.id}-p1`, game.player1, game, LEFT_RING_COLOR, {
				x: 0,
				y: baseY,
			}),
		);

		// Player 2
		nodes.push(
			createNode(`${game.id}-p2`, game.player2, game, LEFT_RING_COLOR, {
				x: 0,
				y: baseY + MATCH_GAP,
			}),
		);
	});

	// Quarterfinals - Left side (games 0-1)
	quarters.left.forEach((game, gameIndex) => {
		const baseY = gameIndex * 4 * MATCH_GAP + MATCH_GAP / 2;

		// Player 1
		nodes.push(
			createNode(`${game.id}-p1`, game.player1, game, LEFT_RING_COLOR, {
				x: ROUND_GAP,
				y: baseY,
			}),
		);

		// Player 2
		nodes.push(
			createNode(`${game.id}-p2`, game.player2, game, LEFT_RING_COLOR, {
				x: ROUND_GAP,
				y: baseY + 2 * MATCH_GAP,
			}),
		);
	});

	// Semifinals - Left side (game 0)
	semis.left.forEach((game) => {
		const baseY = 1.5 * MATCH_GAP;

		// Player 1
		nodes.push(
			createNode(`${game.id}-p1`, game.player1, game, LEFT_RING_COLOR, {
				x: ROUND_GAP * 2,
				y: baseY,
			}),
		);

		// Player 2
		nodes.push(
			createNode(`${game.id}-p2`, game.player2, game, LEFT_RING_COLOR, {
				x: ROUND_GAP * 2,
				y: baseY + 4 * MATCH_GAP,
			}),
		);
	});

	// Left finalist slot
	nodes.push({
		id: `left-finalist`,
		type: "emptySlot",
		position: { x: ROUND_GAP * 3, y: 3.5 * MATCH_GAP },
		data: { text: "Left Finalist" },
	});

	// ===========================================================================
	// RIGHT SIDE (second half of each round)
	// ===========================================================================
	const rightStartX = ROUND_GAP * 7;

	// Round 1 - Right side (games 4-7)
	round1.right.forEach((game, gameIndex) => {
		const baseY = gameIndex * 2 * MATCH_GAP;

		// Player 1
		nodes.push(
			createNode(`${game.id}-p1`, game.player1, game, RIGHT_RING_COLOR, {
				x: rightStartX,
				y: baseY,
			}),
		);

		// Player 2
		nodes.push(
			createNode(`${game.id}-p2`, game.player2, game, RIGHT_RING_COLOR, {
				x: rightStartX,
				y: baseY + MATCH_GAP,
			}),
		);
	});

	// Quarterfinals - Right side (games 2-3) ROUND 2
	quarters.right.forEach((game, gameIndex) => {
		const baseY = gameIndex * 4 * MATCH_GAP + MATCH_GAP / 2;

		// Player 1
		nodes.push(
			createNode(`${game.id}-p1`, game.player1, game, RIGHT_RING_COLOR, {
				x: rightStartX - ROUND_GAP,
				y: baseY,
			}),
		);

		// Player 2
		nodes.push(
			createNode(`${game.id}-p2`, game.player2, game, RIGHT_RING_COLOR, {
				x: rightStartX - ROUND_GAP,
				y: baseY + 2 * MATCH_GAP,
			}),
		);
	});

	// Semifinals - Right side (game 1) ROUND 3
	semis.right.forEach((game) => {
		const baseY = 1.5 * MATCH_GAP;

		// Player 1
		nodes.push(
			createNode(`${game.id}-p1`, game.player1, game, RIGHT_RING_COLOR, {
				x: rightStartX - ROUND_GAP * 2,
				y: baseY,
			}),
		);

		// Player 2
		nodes.push(
			createNode(`${game.id}-p2`, game.player2, game, RIGHT_RING_COLOR, {
				x: rightStartX - ROUND_GAP * 2,
				y: baseY + 4 * MATCH_GAP,
			}),
		);
	});

	// Right finalist slot
	nodes.push({
		id: `right-finalist`,
		type: "emptySlot",
		position: { x: rightStartX - ROUND_GAP * 2.5, y: 3.5 * MATCH_GAP },
		// position: { x: ROUND_GAP * 3, y: 3.5 * MATCH_GAP },
		data: {
			text: "Right Finalist",
		},
	});

	// ===========================================================================
	// CHAMPIONSHIP (center)
	// ===========================================================================
	const finalGame = bracket.finals[0];
	// Center between left finalist (x=3) and right finalist (x=4.5)
	nodes.push({
		id: "championship",
		type: finalGame?.winner ? "playerNode" : "emptySlot",
		position: {
			x: ROUND_GAP * 3.75,
			y: 0,
		},
		data: finalGame?.winner
			? playerToNodeData(finalGame.winner, finalGame, "#FFD700")
			: { text: "CHAMPION" },
	});

	return nodes;
}

// Edge style
const edgeStyle: React.CSSProperties = {
	stroke: "#ffffff",
	strokeWidth: 3,
	filter: "drop-shadow(0px 0px 7px black)",
};

// Generate edges connecting the bracket
function generateEdges(): Edge[] {
	const edges: Edge[] = [];

	// Split each round into left/right halves
	const round1 = splitForDisplay(bracket.round1);
	const quarters = splitForDisplay(bracket.quarters);
	const semis = splitForDisplay(bracket.semis);

	// ===========================================================================
	// LEFT SIDE EDGES
	// ===========================================================================

	// Round 1 to Quarters (left)
	round1.left.forEach((game, gameIndex) => {
		const quarterGame = quarters.left[Math.floor(gameIndex / 2)];

		// Player 1 to quarter game
		edges.push({
			id: `${game.id}-p1-to-${quarterGame.id}`,
			source: `${game.id}-p1`,
			target: `${quarterGame.id}-p${(gameIndex % 2) + 1}`,
			type: "bracket",
			style: edgeStyle,
			sourceHandle: "out-right",
			targetHandle: "in-top",
		});

		// Player 2 to quarter game
		edges.push({
			id: `${game.id}-p2-to-${quarterGame.id}`,
			source: `${game.id}-p2`,
			target: `${quarterGame.id}-p${(gameIndex % 2) + 1}`,
			type: "bracket",
			style: edgeStyle,
			targetHandle: "in-bottom",
		});
	});

	// Quarters to Semis (left)
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

	// Semis to Left Finalist
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

	// Left finalist to Championship
	edges.push({
		id: "left-finalist-to-champ",
		source: `left-finalist`,
		target: "championship",
		type: "bracket",
		style: edgeStyle,
		sourceHandle: "out-right",
		targetHandle: "in-bottom",
	});

	// ===========================================================================
	// RIGHT SIDE EDGES
	// ===========================================================================

	// Round 1 to Quarters (right)
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

	// Quarters to Semis (right)
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

	// Semis to Right Finalist
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

	// Right finalist to Championship
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

const initialNodes = generateNodes();
const initialEdges = generateEdges();

const defaultEdgeOptions = {
	type: "bracket",
	style: edgeStyle,
};

// Padding used for fitView
const FIT_VIEW_PADDING = 0.05;

function BracketContent() {
	const containerRef = useRef<HTMLDivElement>(null);
	const [containerHeight, setContainerHeight] = useState<number | null>(null);
	const rfInstanceRef = useRef<ReactFlowInstance | null>(null);
	const boundsRef = useRef<{ width: number; height: number } | null>(null);

	// Scroll zoom lock state - prevents scroll trap
	const [scrollZoomLocked, setScrollZoomLocked] = useState(true);
	const unlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const clearUnlockTimer = useCallback(() => {
		if (unlockTimerRef.current) {
			clearTimeout(unlockTimerRef.current);
			unlockTimerRef.current = null;
		}
	}, []);

	const handleMouseEnter = useCallback(() => {
		// Start 1.5s timer to unlock scroll zoom
		clearUnlockTimer();
		unlockTimerRef.current = setTimeout(() => {
			setScrollZoomLocked(false);
		}, 1500);
	}, [clearUnlockTimer]);

	const handleMouseLeave = useCallback(() => {
		// Lock scroll zoom and cancel any pending unlock
		clearUnlockTimer();
		setScrollZoomLocked(true);
	}, [clearUnlockTimer]);

	const handleClick = useCallback(() => {
		// Instantly unlock on click
		clearUnlockTimer();
		setScrollZoomLocked(false);
	}, [clearUnlockTimer]);

	// Cleanup timer on unmount
	useEffect(() => {
		return () => clearUnlockTimer();
	}, [clearUnlockTimer]);

	const calculateHeight = useCallback(() => {
		if (!containerRef.current || !boundsRef.current) return;

		const containerWidth = containerRef.current.clientWidth;
		if (containerWidth === 0) return;

		const { width: contentWidth, height: contentHeight } = boundsRef.current;

		// Calculate the aspect ratio of the bracket content
		const aspectRatio = contentHeight / contentWidth;

		// Account for fitView padding
		const paddingMultiplier = 1 + FIT_VIEW_PADDING * 2;

		// Calculate height based on width and aspect ratio
		const scaledHeight = containerWidth * aspectRatio * paddingMultiplier;

		setContainerHeight(scaledHeight);
	}, []);

	const handleInit = (instance: ReactFlowInstance) => {
		rfInstanceRef.current = instance;

		// Get the bounds of all nodes (includes node dimensions)
		const nodes = instance.getNodes();
		const bounds = getNodesBounds(nodes);

		// Store bounds for recalculation on resize
		boundsRef.current = { width: bounds.width, height: bounds.height };

		calculateHeight();
	};

	// Re-fit view when height changes
	useEffect(() => {
		if (containerHeight && rfInstanceRef.current) {
			// Small delay to let the DOM update with new height
			const timer = setTimeout(() => {
				rfInstanceRef.current?.fitView({ padding: FIT_VIEW_PADDING });
			}, 10);
			return () => clearTimeout(timer);
		}
	}, [containerHeight]);

	// Recalculate height on window resize
	useEffect(() => {
		const handleResize = () => {
			calculateHeight();
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
			{/* Debug indicator for scroll zoom lock state */}
			{/* <div
				style={{
					position: "relative",
					zIndex: 10,
					top: 10,
					left: 10,
					zIndex: 10,
					padding: "4px 8px",
					background: scrollZoomLocked ? "#ff4444" : "#44ff44",
					color: scrollZoomLocked ? "#fff" : "#000",
					fontFamily: "monospace",
					fontSize: 12,
					borderRadius: 4,
				}}
			>
				Scroll Zoom: {scrollZoomLocked ? "LOCKED" : "UNLOCKED"}
			</div> */}
			<ReactFlow
				nodes={initialNodes}
				edges={initialEdges}
				nodeTypes={nodeTypes}
				edgeTypes={edgeTypes}
				defaultEdgeOptions={defaultEdgeOptions}
				fitView
				fitViewOptions={{ padding: FIT_VIEW_PADDING }}
				minZoom={0.1}
				maxZoom={1.5}
				nodesDraggable={false}
				nodesConnectable={false}
				elementsSelectable={false}
				zoomOnScroll={!scrollZoomLocked}
				preventScrolling={!scrollZoomLocked}
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

export function Bracket() {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return <div className="bracket-container" />;
	}

	return <BracketContent />;
}

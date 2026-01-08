import {
	Controls,
	type Edge,
	type EdgeProps,
	getSmoothStepPath,
	type Node,
	ReactFlow,
} from "@xyflow/react";
import { useEffect, useState } from "react";
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

	return <path d={edgePath} fill="none" stroke="#000000" strokeWidth={3} />;
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
const VERTICAL_GAP = 100;
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
			createNode(
				`${game.id}-p1`,
				game.player1,
				game,
				LEFT_RING_COLOR,
				{ x: 0, y: baseY },
			),
		);

		// Player 2
		nodes.push(
			createNode(
				`${game.id}-p2`,
				game.player2,
				game,
				LEFT_RING_COLOR,
				{ x: 0, y: baseY + MATCH_GAP },
			),
		);
	});

	// Quarterfinals - Left side (games 0-1)
	quarters.left.forEach((game, gameIndex) => {
		const baseY = gameIndex * 4 * MATCH_GAP + MATCH_GAP / 2;

		// Player 1
		nodes.push(
			createNode(
				`${game.id}-p1`,
				game.player1,
				game,
				LEFT_RING_COLOR,
				{ x: ROUND_GAP, y: baseY },
			),
		);

		// Player 2
		nodes.push(
			createNode(
				`${game.id}-p2`,
				game.player2,
				game,
				LEFT_RING_COLOR,
				{ x: ROUND_GAP, y: baseY + 2 * MATCH_GAP },
			),
		);
	});

	// Semifinals - Left side (game 0)
	semis.left.forEach((game) => {
		const baseY = 1.5 * MATCH_GAP;

		// Player 1
		nodes.push(
			createNode(
				`${game.id}-p1`,
				game.player1,
				game,
				LEFT_RING_COLOR,
				{ x: ROUND_GAP * 2, y: baseY },
			),
		);

		// Player 2
		nodes.push(
			createNode(
				`${game.id}-p2`,
				game.player2,
				game,
				LEFT_RING_COLOR,
				{ x: ROUND_GAP * 2, y: baseY + 4 * MATCH_GAP },
			),
		);
	});

	// Left finalist slot
	nodes.push({
		id: `left-finalist`,
		type: "emptySlot",
		position: { x: ROUND_GAP * 3, y: 3.5 * MATCH_GAP },
		data: { text: 'Winner of Left Semi' },
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
			createNode(
				`${game.id}-p1`,
				game.player1,
				game,
				RIGHT_RING_COLOR,
				{ x: rightStartX, y: baseY },
			),
		);

		// Player 2
		nodes.push(
			createNode(
				`${game.id}-p2`,
				game.player2,
				game,
				RIGHT_RING_COLOR,
				{ x: rightStartX, y: baseY + MATCH_GAP },
			),
		);
	});

	// Quarterfinals - Right side (games 2-3) ROUND 2
	quarters.right.forEach((game, gameIndex) => {
		const baseY = gameIndex * 4 * MATCH_GAP + MATCH_GAP / 2;

		// Player 1
		nodes.push(
			createNode(
				`${game.id}-p1`,
				game.player1,
				game,
				RIGHT_RING_COLOR,
				{ x: rightStartX - ROUND_GAP, y: baseY },
			),
		);

		// Player 2
		nodes.push(
			createNode(
				`${game.id}-p2`,
				game.player2,
				game,
				RIGHT_RING_COLOR,
				{ x: rightStartX - ROUND_GAP, y: baseY + 2 * MATCH_GAP },
			),
		);
	});

	// Semifinals - Right side (game 1) ROUND 3
	semis.right.forEach((game) => {
		const baseY = 1.5 * MATCH_GAP;

		// Player 1
		nodes.push(
			createNode(
				`${game.id}-p1`,
				game.player1,
				game,
				RIGHT_RING_COLOR,
				{ x: rightStartX - ROUND_GAP * 2, y: baseY },
			),
		);

		// Player 2
		nodes.push(
			createNode(
				`${game.id}-p2`,
				game.player2,
				game,
				RIGHT_RING_COLOR,
				{ x: rightStartX - ROUND_GAP * 2, y: baseY + 4 * MATCH_GAP },
			),
		);
	});

	// Right finalist slot
	nodes.push({
		id: `right-finalist`,
		type: "emptySlot",
		position: { x: rightStartX - ROUND_GAP * 3, y: 3.5 * MATCH_GAP },
		// position: { x: ROUND_GAP * 3, y: 3.5 * MATCH_GAP },
		data: {
			text: "Winner of Right Semi",
		},
	});

	// ===========================================================================
	// CHAMPIONSHIP (center)
	// ===========================================================================
	const finalGame = bracket.finals[0];
	nodes.push({
		id: "championship",
		type: finalGame?.winner ? "playerNode" : "emptySlot",
		position: {
			x: ROUND_GAP * 3.5 ,
			y: 0,
		},
		data: finalGame?.winner
			? playerToNodeData(finalGame.winner, finalGame, "#FFD700")
			: { text: 'Winner of Championship' },
	});

	return nodes;
}

// Edge style
const edgeStyle: React.CSSProperties = {
	stroke: "#000000",
	strokeWidth: 3,
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
      targetHandle: "in-top",
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
      targetHandle: "in-top",
	});

	return edges;
}

const initialNodes = generateNodes();
const initialEdges = generateEdges();

const defaultEdgeOptions = {
	type: "bracket",
	style: edgeStyle,
};

function BracketContent() {
	return (
		<div className="bracket-container">
			<ReactFlow
				nodes={initialNodes}
				edges={initialEdges}
				nodeTypes={nodeTypes}
				edgeTypes={edgeTypes}
				defaultEdgeOptions={defaultEdgeOptions}
				fitView
				fitViewOptions={{ padding: 0.1 }}
				minZoom={0.1}
				maxZoom={1.5}
				nodesDraggable={false}
				nodesConnectable={false}
				elementsSelectable={false}
				panOnScroll
				zoomOnScroll
			>
				<Controls showInteractive={false} />
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

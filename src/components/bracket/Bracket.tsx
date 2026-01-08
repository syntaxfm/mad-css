import {
	Controls,
	type Edge,
	type EdgeProps,
	getSmoothStepPath,
	type Node,
	Position,
	ReactFlow,
} from '@xyflow/react';
import { useEffect, useState } from 'react';
import '@xyflow/react/dist/style.css';
import { EmptySlotFlow, type PlayerData, PlayerNodeFlow } from './PlayerNode';
import './bracket.css';

// Custom edge that's guaranteed to be visible
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

	return (
		<path
			d={edgePath}
			fill="none"
			stroke="#000000"
			strokeWidth={3}
		/>
	);
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

// Mock player data - West Side (orange/yellow themed)
const westPlayers: PlayerData[] = [
	{
		photo: '/cards/wes.jpg',
		name: 'Wes Bos',
		byline: 'Syntax.fm',
		ringColor: '#f3370e',
		isWinner: true,
	},
	{
		photo: '/cards/kevin.jpg',
		name: 'Kevin Powell',
		byline: 'CSS Evangelist',
		ringColor: '#f3370e',
		isEliminated: true,
	},
	{
		photo: '/cards/scott.jpg',
		name: 'Scott Tolinski',
		byline: 'Level Up Tuts',
		ringColor: '#ffae00',
		isWinner: true,
	},
	{
		photo: '/cards/wes.jpg',
		name: 'Adam Wathan',
		byline: 'Tailwind CSS',
		ringColor: '#ffae00',
		isEliminated: true,
	},
	{
		photo: '/cards/kevin.jpg',
		name: 'Jhey Tompkins',
		byline: 'CSS Wizard',
		ringColor: '#f3370e',
		isEliminated: true,
	},
	{
		photo: '/cards/scott.jpg',
		name: 'Una Kravets',
		byline: 'Google Chrome',
		ringColor: '#f3370e',
		isWinner: true,
	},
	{
		photo: '/cards/wes.jpg',
		name: 'Josh Comeau',
		byline: 'CSS for JS Devs',
		ringColor: '#ffae00',
		isWinner: true,
	},
	{
		photo: '/cards/kevin.jpg',
		name: 'Miriam Suzanne',
		byline: 'OddBird',
		ringColor: '#ffae00',
		isEliminated: true,
	},
];

// Mock player data - East Side (cyan/teal themed)
const eastPlayers: PlayerData[] = [
	{
		photo: '/cards/scott.jpg',
		name: 'Lea Verou',
		byline: 'CSS WG',
		ringColor: '#5CE1E6',
		isWinner: true,
	},
	{
		photo: '/cards/wes.jpg',
		name: 'Bramus',
		byline: 'Google Chrome',
		ringColor: '#5CE1E6',
		isEliminated: true,
	},
	{
		photo: '/cards/kevin.jpg',
		name: 'Adam Argyle',
		byline: 'Open UI',
		ringColor: '#00CED1',
		isEliminated: true,
	},
	{
		photo: '/cards/scott.jpg',
		name: 'Stephanie Eckles',
		byline: 'ModernCSS.dev',
		ringColor: '#00CED1',
		isWinner: true,
	},
	{
		photo: '/cards/wes.jpg',
		name: 'Rachel Andrew',
		byline: 'Google Chrome',
		ringColor: '#5CE1E6',
		isWinner: true,
	},
	{
		photo: '/cards/kevin.jpg',
		name: 'Chen Hui Jing',
		byline: 'Mozilla',
		ringColor: '#5CE1E6',
		isEliminated: true,
	},
	{
		photo: '/cards/scott.jpg',
		name: 'Sara Soueidan',
		byline: 'Accessibility',
		ringColor: '#00CED1',
		isEliminated: true,
	},
	{
		photo: '/cards/wes.jpg',
		name: 'Cassie Evans',
		byline: 'GSAP',
		ringColor: '#00CED1',
		isWinner: true,
	},
];

// Node dimensions for positioning
const NODE_HEIGHT = 70;
const VERTICAL_GAP = 15;
const ROUND_GAP = 320;

// Generate nodes for the bracket
function generateNodes(): Node[] {
	const nodes: Node[] = [];

	// West Side - Round 1 (8 players)
	westPlayers.forEach((player, index) => {
		nodes.push({
			id: `west-r1-${index}`,
			type: 'playerNode',
			position: { x: 0, y: index * (NODE_HEIGHT + VERTICAL_GAP) },
			data: player,
			sourcePosition: Position.Right,
			targetPosition: Position.Left,
		});
	});

	// West Side - Quarterfinals (4 winners)
	const westQFWinners = westPlayers.filter((p) => p.isWinner);
	westQFWinners.forEach((player, index) => {
		const yPos =
			index * 2 * (NODE_HEIGHT + VERTICAL_GAP) +
			(NODE_HEIGHT + VERTICAL_GAP) / 2;
		nodes.push({
			id: `west-qf-${index}`,
			type: 'playerNode',
			position: { x: ROUND_GAP, y: yPos },
			data: { ...player, isWinner: index < 2, isEliminated: index >= 2 },
			sourcePosition: Position.Right,
			targetPosition: Position.Left,
		});
	});

	// West Side - Semifinals (2 empty slots)
	for (let i = 0; i < 2; i++) {
		const yPos =
			i * 4 * (NODE_HEIGHT + VERTICAL_GAP) + 1.5 * (NODE_HEIGHT + VERTICAL_GAP);
		nodes.push({
			id: `west-sf-${i}`,
			type: 'emptySlot',
			position: { x: ROUND_GAP * 2, y: yPos },
			data: {},
			sourcePosition: Position.Right,
			targetPosition: Position.Left,
		});
	}

	// West Side - Finals (1 empty slot)
	nodes.push({
		id: 'west-final',
		type: 'emptySlot',
		position: {
			x: ROUND_GAP * 3,
			y: 3 * (NODE_HEIGHT + VERTICAL_GAP),
		},
		data: {},
		sourcePosition: Position.Right,
		targetPosition: Position.Left,
	});

	// East Side - positioned on the right, mirrored
	const eastStartX = ROUND_GAP * 6;

	// East Side - Round 1 (8 players)
	eastPlayers.forEach((player, index) => {
		nodes.push({
			id: `east-r1-${index}`,
			type: 'playerNode',
			position: { x: eastStartX, y: index * (NODE_HEIGHT + VERTICAL_GAP) },
			data: player,
			sourcePosition: Position.Left,
			targetPosition: Position.Right,
		});
	});

	// East Side - Quarterfinals (4 winners)
	const eastQFWinners = eastPlayers.filter((p) => p.isWinner);
	eastQFWinners.forEach((player, index) => {
		const yPos =
			index * 2 * (NODE_HEIGHT + VERTICAL_GAP) +
			(NODE_HEIGHT + VERTICAL_GAP) / 2;
		nodes.push({
			id: `east-qf-${index}`,
			type: 'playerNode',
			position: { x: eastStartX - ROUND_GAP, y: yPos },
			data: { ...player, isWinner: index < 2, isEliminated: index >= 2 },
			sourcePosition: Position.Left,
			targetPosition: Position.Right,
		});
	});

	// East Side - Semifinals (2 empty slots)
	for (let i = 0; i < 2; i++) {
		const yPos =
			i * 4 * (NODE_HEIGHT + VERTICAL_GAP) + 1.5 * (NODE_HEIGHT + VERTICAL_GAP);
		nodes.push({
			id: `east-sf-${i}`,
			type: 'emptySlot',
			position: { x: eastStartX - ROUND_GAP * 2, y: yPos },
			data: {},
			sourcePosition: Position.Left,
			targetPosition: Position.Right,
		});
	}

	// East Side - Finals (1 empty slot)
	nodes.push({
		id: 'east-final',
		type: 'emptySlot',
		position: {
			x: eastStartX - ROUND_GAP * 3,
			y: 3 * (NODE_HEIGHT + VERTICAL_GAP),
		},
		data: {},
		sourcePosition: Position.Left,
		targetPosition: Position.Right,
	});

	// Championship (center)
	nodes.push({
		id: 'championship',
		type: 'emptySlot',
		position: {
			x: ROUND_GAP * 4.5 - 190,
			y: 3 * (NODE_HEIGHT + VERTICAL_GAP),
		},
		data: {},
		sourcePosition: Position.Right,
		targetPosition: Position.Left,
	});

	return nodes;
}

// Edge style for bracket lines
const edgeStyle: React.CSSProperties = {
	stroke: '#000000',
	strokeWidth: 3,
};

// Generate edges for bracket connections
function generateEdges(): Edge[] {
	const edges: Edge[] = [];

	// West Side - Round 1 to Quarterfinals
	for (let i = 0; i < 4; i++) {
		edges.push({
			id: `west-r1-${i * 2}-to-qf-${i}`,
			source: `west-r1-${i * 2}`,
			target: `west-qf-${i}`,
			type: 'bracket',
			style: edgeStyle,
		});
		edges.push({
			id: `west-r1-${i * 2 + 1}-to-qf-${i}`,
			source: `west-r1-${i * 2 + 1}`,
			target: `west-qf-${i}`,
			type: 'bracket',
			style: edgeStyle,
		});
	}

	// West Side - Quarterfinals to Semifinals
	for (let i = 0; i < 2; i++) {
		edges.push({
			id: `west-qf-${i * 2}-to-sf-${i}`,
			source: `west-qf-${i * 2}`,
			target: `west-sf-${i}`,
			type: 'bracket',
			style: edgeStyle,
		});
		edges.push({
			id: `west-qf-${i * 2 + 1}-to-sf-${i}`,
			source: `west-qf-${i * 2 + 1}`,
			target: `west-sf-${i}`,
			type: 'bracket',
			style: edgeStyle,
		});
	}

	// West Side - Semifinals to Finals
	edges.push({
		id: 'west-sf-0-to-final',
		source: 'west-sf-0',
		target: 'west-final',
		type: 'bracket',
		style: edgeStyle,
	});
	edges.push({
		id: 'west-sf-1-to-final',
		source: 'west-sf-1',
		target: 'west-final',
		type: 'bracket',
		style: edgeStyle,
	});

	// West Final to Championship
	edges.push({
		id: 'west-final-to-champ',
		source: 'west-final',
		target: 'championship',
		type: 'bracket',
		style: edgeStyle,
	});

	// East Side - Round 1 to Quarterfinals
	for (let i = 0; i < 4; i++) {
		edges.push({
			id: `east-r1-${i * 2}-to-qf-${i}`,
			source: `east-r1-${i * 2}`,
			target: `east-qf-${i}`,
			type: 'bracket',
			style: edgeStyle,
		});
		edges.push({
			id: `east-r1-${i * 2 + 1}-to-qf-${i}`,
			source: `east-r1-${i * 2 + 1}`,
			target: `east-qf-${i}`,
			type: 'bracket',
			style: edgeStyle,
		});
	}

	// East Side - Quarterfinals to Semifinals
	for (let i = 0; i < 2; i++) {
		edges.push({
			id: `east-qf-${i * 2}-to-sf-${i}`,
			source: `east-qf-${i * 2}`,
			target: `east-sf-${i}`,
			type: 'bracket',
			style: edgeStyle,
		});
		edges.push({
			id: `east-qf-${i * 2 + 1}-to-sf-${i}`,
			source: `east-qf-${i * 2 + 1}`,
			target: `east-sf-${i}`,
			type: 'bracket',
			style: edgeStyle,
		});
	}

	// East Side - Semifinals to Finals
	edges.push({
		id: 'east-sf-0-to-final',
		source: 'east-sf-0',
		target: 'east-final',
		type: 'bracket',
		style: edgeStyle,
	});
	edges.push({
		id: 'east-sf-1-to-final',
		source: 'east-sf-1',
		target: 'east-final',
		type: 'bracket',
		style: edgeStyle,
	});

	// East Final to Championship
	edges.push({
		id: 'east-final-to-champ',
		source: 'east-final',
		target: 'championship',
		type: 'bracket',
		style: edgeStyle,
	});

	return edges;
}

const initialNodes = generateNodes();
const initialEdges = generateEdges();

const defaultEdgeOptions = {
	type: 'bracket',
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

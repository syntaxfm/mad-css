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
import { usePredictionsContext } from "@/context/PredictionsContext";
import { ALL_GAME_IDS, bracket, splitForDisplay } from "@/data/players";
import { getPickablePlayersForGame } from "@/hooks/usePredictions";
import type { NodeContext } from "./bracketTypes";
import {
	generateChampionshipNode,
	generateFinalistNode,
	generateQuarterNodes,
	generateRound1Nodes,
	generateSemiNodes,
} from "./nodeGenerators";
import { EmptySlotFlow, PlayerNodeFlow } from "./PlayerNode";
import "./bracket.css";

export interface BracketProps {
	isInteractive?: boolean;
	predictions?: Record<string, string>;
	onPick?: (gameId: string, playerId: string) => void;
	isLocked?: boolean;
	isAuthenticated?: boolean;
	getPickablePlayers?: (gameId: string) => string[];
	tournamentResults?: Record<string, string>;
	showPicks?: boolean;
}

function BracketEdge({
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
	target,
}: EdgeProps) {
	if (target === "championship") {
		const horizontalY = sourceY + 30;
		const edgePath = `M ${sourceX} ${sourceY} L ${sourceX} ${horizontalY} L ${targetX} ${horizontalY} L ${targetX} ${targetY - 35}`;
		return (
			<path
				d={edgePath}
				fill="none"
				stroke="#FFFFFF"
				strokeWidth={10}
				style={{ filter: "none" }}
			/>
		);
	}

	const [edgePath] = getSmoothStepPath({
		sourceX,
		sourceY,
		targetX,
		targetY,
		sourcePosition,
		targetPosition,
		borderRadius: 0,
	});
	return <path d={edgePath} fill="none" stroke="#FFFFFF" strokeWidth={10} />;
}

const nodeTypes = {
	playerNode: PlayerNodeFlow,
	emptySlot: EmptySlotFlow,
};

const edgeTypes = {
	bracket: BracketEdge,
};

function generateNodes(
	isInteractive: boolean,
	predictions: Record<string, string> = {},
	onPick?: (gameId: string, playerId: string) => void,
	isPickingEnabled = false,
	tournamentResults: Record<string, string> = {},
	showPicks = false,
	isLocked = false,
): Node[] {
	const hasResults = Object.keys(tournamentResults).length > 0;

	const pickablePlayersCache: Record<
		string,
		[string | undefined, string | undefined]
	> = {};
	for (const gameId of ALL_GAME_IDS) {
		pickablePlayersCache[gameId] = getPickablePlayersForGame(
			gameId,
			predictions,
		);
	}

	const ctx: NodeContext = {
		hasResults,
		tournamentResults,
		predictions,
		pickablePlayersCache,
		isInteractive,
		isPickingEnabled,
		showPicks,
		isLocked,
		onPick,
	};

	return [
		...generateRound1Nodes({ side: "left", ctx }),
		...generateRound1Nodes({ side: "right", ctx }),
		...generateQuarterNodes({ side: "left", ctx }),
		...generateQuarterNodes({ side: "right", ctx }),
		...generateSemiNodes({ side: "left", ctx }),
		...generateSemiNodes({ side: "right", ctx }),
		generateFinalistNode({ side: "left", ctx }),
		generateFinalistNode({ side: "right", ctx }),
		generateChampionshipNode(ctx),
	];
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

const FIT_VIEW_PADDING = 0.05;

function BracketContent({
	isInteractive = false,
	predictions: propsPredictions,
	onPick: propsOnPick,
	isLocked: propsIsLocked,
	isAuthenticated = false,
	tournamentResults = {},
	showPicks = false,
}: BracketProps) {
	const ctx = usePredictionsContext();

	// Use context if available, otherwise fall back to props
	const predictions = ctx?.predictions ?? propsPredictions ?? {};
	const onPick = ctx?.setPrediction ?? propsOnPick;
	const isLocked = ctx?.isLocked ?? propsIsLocked ?? false;

	const isPickingEnabled = isInteractive && isAuthenticated && !isLocked;
	const nodes = useMemo(
		() =>
			generateNodes(
				isInteractive,
				predictions,
				onPick,
				isPickingEnabled,
				tournamentResults,
				showPicks,
				isLocked,
			),
		[
			isInteractive,
			predictions,
			onPick,
			isPickingEnabled,
			tournamentResults,
			showPicks,
			isLocked,
		],
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
	};

	useEffect(() => {
		const handleResize = () => {
			calculateHeight();
			if (rfInstanceRef.current) {
				rfInstanceRef.current.fitView({ padding: FIT_VIEW_PADDING });
			}
		};
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [calculateHeight]);

	useEffect(() => {
		if (containerHeight && rfInstanceRef.current) {
			requestAnimationFrame(() => {
				rfInstanceRef.current?.fitView({ padding: FIT_VIEW_PADDING });
			});
		}
	}, [containerHeight]);

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: mouse events for scroll/zoom unlock UX
		<div
			ref={containerRef}
			className="bracket-container"
			style={containerHeight ? { height: containerHeight } : undefined}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
		>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				nodeTypes={nodeTypes}
				edgeTypes={edgeTypes}
				defaultEdgeOptions={defaultEdgeOptions}
				minZoom={0.1}
				maxZoom={1.5}
				nodesDraggable={false}
				nodesConnectable={false}
				elementsSelectable={false}
				zoomOnScroll={!scrollZoomLocked}
				preventScrolling={!scrollZoomLocked}
				fitView
				fitViewOptions={{ padding: FIT_VIEW_PADDING }}
				onInit={handleInit}
				onNodeClick={(_event, node) => {
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

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
	onToggleShowPicks?: () => void;
}

function BracketToggle({
	showPicks,
	onToggle,
}: {
	showPicks: boolean;
	onToggle: () => void;
}) {
	return (
		<div className="bracket-toggle">
			<button
				type="button"
				className={!showPicks ? "active" : undefined}
				onClick={showPicks ? onToggle : undefined}
				aria-pressed={!showPicks}
			>
				CURRENT STANDINGS
			</button>
			<button
				type="button"
				className={showPicks ? "active" : undefined}
				onClick={!showPicks ? onToggle : undefined}
				aria-pressed={showPicks}
			>
				MY PICKS
			</button>
		</div>
	);
}

export type EdgeState = "winner" | "loser" | "pending" | "pickable" | "default";

export type EdgeHoverState =
	| "none"
	| "hovered-pick"
	| "hovered-competitor"
	| "hovered-incoming";

function BracketEdge({
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
	target,
	data,
}: EdgeProps) {
	const edgeState = (data?.state as EdgeState) ?? "default";
	const hoverState = (data?.hoverState as EdgeHoverState) ?? "none";

	const STROKE_WIDTH = 3;

	let state: string = edgeState;
	if (hoverState === "hovered-pick") {
		state = "hover-pick";
	} else if (hoverState === "hovered-competitor") {
		state = "hover-competitor";
	} else if (hoverState === "hovered-incoming") {
		state = "pickable";
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

	return (
		<>
			<path
				className="bracket-edge track"
				data-state={state}
				d={edgePath}
				fill="none"
				strokeWidth={STROKE_WIDTH * 3}
				strokeLinecap="round"
			/>
			<path
				className="bracket-edge path"
				data-state={state}
				d={edgePath}
				fill="none"
				strokeWidth={STROKE_WIDTH}
				strokeLinecap="round"
			/>
		</>
	);
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

const EDGE_SOURCE_MAP: Map<string, string[]> = (() => {
	const map = new Map<string, string[]>();
	function add(source: string, target: string) {
		const existing = map.get(target);
		if (existing) {
			existing.push(source);
		} else {
			map.set(target, [source]);
		}
	}
	const r1 = splitForDisplay(bracket.round1);
	const qf = splitForDisplay(bracket.quarters);
	const sf = splitForDisplay(bracket.semis);

	for (const [side, r1Games, qfGames, sfGames] of [
		["left", r1.left, qf.left, sf.left],
		["right", r1.right, qf.right, sf.right],
	] as const) {
		r1Games.forEach((game, i) => {
			const qfGame = qfGames[Math.floor(i / 2)];
			const target = `${qfGame.id}-p${(i % 2) + 1}`;
			add(`${game.id}-p1`, target);
			add(`${game.id}-p2`, target);
		});
		qfGames.forEach((game, i) => {
			const semiGame = sfGames[0];
			const target = `${semiGame.id}-p${i + 1}`;
			add(`${game.id}-p1`, target);
			add(`${game.id}-p2`, target);
		});
		sfGames.forEach((game) => {
			const target = `${side}-finalist`;
			add(`${game.id}-p1`, target);
			add(`${game.id}-p2`, target);
		});
		add(`${side}-finalist`, "championship");
	}
	return map;
})();

function parseSourceNodeId(sourceNodeId: string): {
	gameId: string;
	slot: "p1" | "p2";
} {
	const lastDash = sourceNodeId.lastIndexOf("-");
	const slot = sourceNodeId.slice(lastDash + 1) as "p1" | "p2";
	const gameId = sourceNodeId.slice(0, lastDash);
	return { gameId, slot };
}

function getSourcePlayerId(
	sourceNodeId: string,
	nodes: Node[],
): string | undefined {
	const node = nodes.find((n) => n.id === sourceNodeId);
	if (!node) return undefined;
	return (node.data as { playerId?: string })?.playerId;
}

function computeEdgeState(
	sourceNodeId: string,
	targetNodeId: string,
	tournamentResults: Record<string, string>,
	predictions: Record<string, string>,
	showPicks: boolean,
	nodes: Node[],
	allEdges: Edge[],
): EdgeState {
	const { gameId } = parseSourceNodeId(sourceNodeId);
	const playerId = getSourcePlayerId(sourceNodeId, nodes);
	const results = showPicks ? predictions : tournamentResults;

	// Finalist-to-championship edges: check if the final game is decided
	if (sourceNodeId === "left-finalist" || sourceNodeId === "right-finalist") {
		const finalWinner = results.final;
		if (finalWinner && playerId) {
			return finalWinner === playerId ? "winner" : "loser";
		}
		const targetNode = nodes.find((n) => n.id === targetNodeId);
		const targetIsEmpty = targetNode?.type === "emptySlot";
		if (targetIsEmpty) {
			const feedingEdges = allEdges.filter((e) => e.target === targetNodeId);
			const allSourcesArePlayerNodes = feedingEdges.every((e) => {
				const srcNode = nodes.find((n) => n.id === e.source);
				return srcNode?.type === "playerNode";
			});
			if (feedingEdges.length >= 2 && allSourcesArePlayerNodes) {
				return "pickable";
			}
			return "pending";
		}
		return "default";
	}

	const winner = results[gameId];

	if (winner && playerId) {
		return winner === playerId ? "winner" : "loser";
	}

	// No result yet -- check if the target is an empty slot (pending/pickable)
	const targetNode = nodes.find((n) => n.id === targetNodeId);
	const targetIsEmpty = targetNode?.type === "emptySlot";

	if (targetIsEmpty) {
		const feedingEdges = allEdges.filter((e) => e.target === targetNodeId);
		const allSourcesArePlayerNodes = feedingEdges.every((e) => {
			const srcNode = nodes.find((n) => n.id === e.source);
			return srcNode?.type === "playerNode";
		});
		if (feedingEdges.length >= 2 && allSourcesArePlayerNodes) {
			return "pickable";
		}
		return "pending";
	}

	return "default";
}

function computeEdgeHoverState(
	edgeSource: string,
	edgeTarget: string,
	hoveredNodeId: string | null,
	hoveredNodeType: "player" | "empty" | null,
	edges: Edge[],
): EdgeHoverState {
	if (!hoveredNodeId || !hoveredNodeType) return "none";

	// Hovering an empty slot: highlight all edges flowing INTO it
	if (hoveredNodeType === "empty") {
		if (edgeTarget === hoveredNodeId) return "hovered-incoming";
		return "none";
	}

	// Hovering a player node: green ants on hovered player's edges, red ants on competitor
	const hoveredEdges = edges.filter((e) => e.source === hoveredNodeId);
	if (hoveredEdges.length === 0) return "none";

	if (edgeSource === hoveredNodeId) return "hovered-pick";

	for (const hoveredEdge of hoveredEdges) {
		const siblingEdges = edges.filter(
			(e) => e.target === hoveredEdge.target && e.source !== hoveredNodeId,
		);
		if (siblingEdges.some((e) => e.source === edgeSource)) {
			return "hovered-competitor";
		}
	}

	return "none";
}

interface EdgeGeneratorContext {
	tournamentResults: Record<string, string>;
	predictions: Record<string, string>;
	showPicks: boolean;
	nodes: Node[];
	hoveredNodeId: string | null;
	hoveredNodeType: "player" | "empty" | null;
}

function generateEdges(ctx: EdgeGeneratorContext): Edge[] {
	const edges: Edge[] = [];
	const round1 = splitForDisplay(bracket.round1);
	const quarters = splitForDisplay(bracket.quarters);
	const semis = splitForDisplay(bracket.semis);

	function pushEdge(edge: Omit<Edge, "data">) {
		edges.push({
			...edge,
			data: {
				state: "default" as EdgeState,
				hoverState: "none" as EdgeHoverState,
			},
		});
	}

	// LEFT SIDE EDGES
	round1.left.forEach((game, gameIndex) => {
		const quarterGame = quarters.left[Math.floor(gameIndex / 2)];

		pushEdge({
			id: `${game.id}-p1-to-${quarterGame.id}`,
			source: `${game.id}-p1`,
			target: `${quarterGame.id}-p${(gameIndex % 2) + 1}`,
			type: "bracket",
			sourceHandle: "out-right",
			targetHandle: "in-top",
		});

		pushEdge({
			id: `${game.id}-p2-to-${quarterGame.id}`,
			source: `${game.id}-p2`,
			target: `${quarterGame.id}-p${(gameIndex % 2) + 1}`,
			type: "bracket",
			targetHandle: "in-bottom",
		});
	});

	quarters.left.forEach((game, gameIndex) => {
		const semiGame = semis.left[0];

		pushEdge({
			id: `${game.id}-p1-to-${semiGame.id}`,
			source: `${game.id}-p1`,
			target: `${semiGame.id}-p${gameIndex + 1}`,
			type: "bracket",
			sourceHandle: "out-right",
			targetHandle: "in-top",
		});

		pushEdge({
			id: `${game.id}-p2-to-${semiGame.id}`,
			source: `${game.id}-p2`,
			target: `${semiGame.id}-p${gameIndex + 1}`,
			type: "bracket",
			sourceHandle: "out-right",
			targetHandle: "in-bottom",
		});
	});

	semis.left.forEach((game) => {
		pushEdge({
			id: `${game.id}-p1-to-left-finalist`,
			source: `${game.id}-p1`,
			target: `left-finalist`,
			type: "bracket",
			sourceHandle: "out-right",
			targetHandle: "in-top",
		});

		pushEdge({
			id: `${game.id}-p2-to-left-finalist`,
			source: `${game.id}-p2`,
			target: `left-finalist`,
			type: "bracket",
			sourceHandle: "out-right",
			targetHandle: "in-bottom",
		});
	});

	pushEdge({
		id: "left-finalist-to-champ",
		source: `left-finalist`,
		target: "championship",
		type: "bracket",
		sourceHandle: "out-right",
		targetHandle: "in-bottom",
	});

	// RIGHT SIDE EDGES
	round1.right.forEach((game, gameIndex) => {
		const quarterGame = quarters.right[Math.floor(gameIndex / 2)];

		pushEdge({
			id: `${game.id}-p1-to-${quarterGame.id}`,
			source: `${game.id}-p1`,
			target: `${quarterGame.id}-p${(gameIndex % 2) + 1}`,
			type: "bracket",
			sourceHandle: "out-left",
			targetHandle: "in-top",
		});

		pushEdge({
			id: `${game.id}-p2-to-${quarterGame.id}`,
			source: `${game.id}-p2`,
			target: `${quarterGame.id}-p${(gameIndex % 2) + 1}`,
			type: "bracket",
			sourceHandle: "out-left",
			targetHandle: "in-bottom",
		});
	});

	quarters.right.forEach((game, gameIndex) => {
		const semiGame = semis.right[0];

		pushEdge({
			id: `${game.id}-p1-to-${semiGame.id}`,
			source: `${game.id}-p1`,
			target: `${semiGame.id}-p${gameIndex + 1}`,
			type: "bracket",
			sourceHandle: "out-left",
			targetHandle: "in-top",
		});

		pushEdge({
			id: `${game.id}-p2-to-${semiGame.id}`,
			source: `${game.id}-p2`,
			target: `${semiGame.id}-p${gameIndex + 1}`,
			type: "bracket",
			sourceHandle: "out-left",
			targetHandle: "in-bottom",
		});
	});

	semis.right.forEach((game) => {
		pushEdge({
			id: `${game.id}-p1-to-right-finalist`,
			source: `${game.id}-p1`,
			target: `right-finalist`,
			type: "bracket",
			sourceHandle: "out-left",
			targetHandle: "in-top",
		});

		pushEdge({
			id: `${game.id}-p2-to-right-finalist`,
			source: `${game.id}-p2`,
			target: `right-finalist`,
			type: "bracket",
			sourceHandle: "out-left",
			targetHandle: "in-bottom",
		});
	});

	pushEdge({
		id: "right-finalist-to-champ",
		source: `right-finalist`,
		target: "championship",
		type: "bracket",
		sourceHandle: "out-left",
		targetHandle: "in-bottom",
	});

	// Pass 1: compute edge states (needs full edge list to check siblings)
	for (const edge of edges) {
		const state = computeEdgeState(
			edge.source,
			edge.target,
			ctx.tournamentResults,
			ctx.predictions,
			ctx.showPicks,
			ctx.nodes,
			edges,
		);
		(edge.data as { state: EdgeState }).state = state;
	}

	// Pass 2: apply hover states
	for (const edge of edges) {
		const hoverState = computeEdgeHoverState(
			edge.source,
			edge.target,
			ctx.hoveredNodeId,
			ctx.hoveredNodeType,
			edges,
		);
		(edge.data as { hoverState: EdgeHoverState }).hoverState = hoverState;
	}

	return edges;
}

const defaultEdgeOptions = {
	type: "bracket",
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
	onToggleShowPicks,
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

	const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
	const [hoveredNodeType, setHoveredNodeType] = useState<
		"player" | "empty" | null
	>(null);

	const edges = useMemo(
		() =>
			generateEdges({
				tournamentResults,
				predictions,
				showPicks,
				nodes,
				hoveredNodeId,
				hoveredNodeType,
			}),
		[
			tournamentResults,
			predictions,
			showPicks,
			nodes,
			hoveredNodeId,
			hoveredNodeType,
		],
	);

	const styledNodes = useMemo(() => {
		const nodeTypeMap = new Map(nodes.map((n) => [n.id, n.type]));
		const pickableSlots = new Set<string>();
		for (const [targetId, sourceIds] of EDGE_SOURCE_MAP) {
			if (
				nodeTypeMap.get(targetId) === "emptySlot" &&
				sourceIds.length >= 2 &&
				sourceIds.every((id) => nodeTypeMap.get(id) === "playerNode")
			) {
				pickableSlots.add(targetId);
			}
		}
		return nodes.map((node) => {
			if (node.type === "emptySlot" && !pickableSlots.has(node.id)) {
				return {
					...node,
					style: { ...node.style, filter: "brightness(0.5)" },
				};
			}
			return node;
		});
	}, [nodes]);
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
		<>
			{onToggleShowPicks && (
				<BracketToggle showPicks={showPicks} onToggle={onToggleShowPicks} />
			)}
			{/* biome-ignore lint/a11y/noStaticElementInteractions: mouse events for scroll/zoom unlock UX */}
			<div
				ref={containerRef}
				className={`bracket-container${!showPicks ? " bracket-container--standings" : ""}`}
				style={containerHeight ? { height: containerHeight } : undefined}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
			>
				<ReactFlow
					nodes={styledNodes}
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
				onNodeMouseEnter={
					isInteractive
						? (_event, node) => {
								if (node.type === "emptySlot") {
									setHoveredNodeId(node.id);
									setHoveredNodeType("empty");
									return;
								}
								const data = node.data as {
									prediction?: { interactionMode?: string };
								};
								if (data.prediction?.interactionMode === "pickable") {
									setHoveredNodeId(node.id);
									setHoveredNodeType("player");
								}
							}
						: undefined
				}
				onNodeMouseLeave={
					isInteractive
						? () => {
								setHoveredNodeId(null);
								setHoveredNodeType(null);
							}
						: undefined
				}
					onNodeClick={(_event, node) => {
						const data = node.data as {
							isPickable?: boolean;
							gameId?: string;
							playerId?: string;
							onPick?: (gameId: string, playerId: string) => void;
						};
						if (
							data.isPickable &&
							data.onPick &&
							data.gameId &&
							data.playerId
						) {
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
		</>
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

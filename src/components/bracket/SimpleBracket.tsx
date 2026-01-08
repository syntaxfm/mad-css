import {
	addEdge,
	applyEdgeChanges,
	applyNodeChanges,
	Position,
	ReactFlow,
} from "@xyflow/react";
import { useCallback, useState } from "react";
import "@xyflow/react/dist/style.css";


const handles = [
	{
		type: "source",
		position: Position.Right,
		id: "out",
	},
	{
		type: "target",
		position: Position.Top,
		id: "in",
	},
];
const initialNodes = [
	{
    id: "n1", position: { x: 0, y: 0 }, data: { label: "Node 1" },
    handles
  },

	{ id: "n2", position: { x: 0, y: 100 }, data: { label: "Node 2" }, handles },

	{ id: "n3", position: { x: 50, y: 50 }, data: { label: "Node 3" }, handles },
];
const initialEdges = [
	{ id: "n1-n3", source: "n1", target: "n3" },
	{ id: "n2-n3", source: "n2", target: "n3" },
];

export function SimpleBracket() {
	const [nodes, setNodes] = useState(initialNodes);
	const [edges, setEdges] = useState(initialEdges);

	const onNodesChange = useCallback(
		(changes) =>
			setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
		[],
	);
	const onEdgesChange = useCallback(
		(changes) =>
			setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
		[],
	);
	const onConnect = useCallback(
		(params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
		[],
	);

	return (
		<div style={{ width: "100vw", height: "100vh", background: "#efefef" }}>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				fitView
			/>
		</div>
	);
}

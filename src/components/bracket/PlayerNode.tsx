import { Handle, Position } from '@xyflow/react';
import './bracket.css';

export interface PlayerData {
	photo: string;
	name: string;
	byline: string;
	ringColor?: string;
	isWinner?: boolean;
	isEliminated?: boolean;
	[key: string]: unknown;
}

interface PlayerNodeProps {
	photo: string;
	name: string;
	byline: string;
	ringColor?: string;
	isWinner?: boolean;
	isEliminated?: boolean;
}

export function PlayerNode({
	photo,
	name,
	byline,
	ringColor = 'var(--orange)',
	isWinner = false,
	isEliminated = false,
}: PlayerNodeProps) {
	const classNames = [
		'player-node',
		isWinner && 'player-node--winner',
		isEliminated && 'player-node--eliminated',
	]
		.filter(Boolean)
		.join(' ');

	return (
		<div className={classNames}>
			<div
				className="player-photo-ring"
				style={{ '--ring-color': ringColor } as React.CSSProperties}
			>
				<img src={photo} alt={name} className="player-photo" />
			</div>
			<div className="player-info">
				<h3 className="player-name">{name}</h3>
				<p className="player-byline">{byline}</p>
			</div>
		</div>
	);
}

// React Flow wrapper for PlayerNode
export function PlayerNodeFlow({ data }: { data: PlayerData }) {
	return (
		<div style={{ position: 'relative' }}>
			<Handle
				type="target"
				position={Position.Left}
				className="bracket-handle"
				style={{ left: -5 }}
			/>
			<PlayerNode
				photo={data.photo}
				name={data.name}
				byline={data.byline}
				ringColor={data.ringColor}
				isWinner={data.isWinner}
				isEliminated={data.isEliminated}
			/>
			<Handle
				type="source"
				position={Position.Right}
				className="bracket-handle"
				style={{ right: -5 }}
			/>
		</div>
	);
}

// Empty slot for matches not yet played
export function EmptySlot() {
	return (
		<div className="empty-slot">
			<div className="empty-slot-info">
				<span className="empty-slot-text">TBD</span>
			</div>
		</div>
	);
}

// React Flow wrapper for EmptySlot
export function EmptySlotFlow() {
	return (
		<div style={{ position: 'relative' }}>
			<Handle
				type="target"
				position={Position.Left}
				className="bracket-handle"
				style={{ left: -5 }}
			/>
			<EmptySlot />
			<Handle
				type="source"
				position={Position.Right}
				className="bracket-handle"
				style={{ right: -5 }}
			/>
		</div>
	);
}

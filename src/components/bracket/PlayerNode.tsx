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

function Handles() {
  return (
			<>
				<Handle
					type="target"
					position={Position.Top}
					className="bracket-handle"
					style={{ top: 15 }}
          id="in-top"
				/>
				<Handle
					type="target"
					position={Position.Bottom}
					className="bracket-handle"
					style={{ bottom: 15 }}
          id="in-bottom"
				/>
				<Handle
					type="source"
					position={Position.Right}
					className="bracket-handle"
					style={{ right: -5 }}
					id="out-right"
				/>
				<Handle
					type="source"
					position={Position.Left}
					className="bracket-handle"
					style={{ right: -5 }}
					id="out-left"
				/>
			</>
		);
}

// React Flow wrapper for PlayerNode
export function PlayerNodeFlow({ data }: { data: PlayerData }) {
	return (
		<div style={{ position: 'relative' }}>
      <PlayerNode
        photo={data.photo}
        name={data.name}
        byline={data.byline}
        ringColor={data.ringColor}
        isWinner={data.isWinner}
        isEliminated={data.isEliminated}
      />
      <Handles />
		</div>
	);
}

// Empty slot for matches not yet played
export function EmptySlot({ text }: { text: string }) {
	return (
		<div className="empty-slot">
			<div className="empty-slot-info">
				{text || "TBD"}
				<span className="empty-slot-text"></span>
			</div>
		</div>
	);
}

// React Flow wrapper for EmptySlot
export function EmptySlotFlow({ data }: { data: { text: string } }) {
  console.log(data);
  const { text } = data;
	return (
		<div style={{ position: "relative" }}>
      <EmptySlot text={text} />
      <Handles />
		</div>
	);
}

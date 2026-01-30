import { Handle, Position } from "@xyflow/react";
import { memo } from "react";
import "./bracket.css";

export interface PlayerData {
	photo: string;
	name: string;
	byline: string;
	ringColor?: string;
	isWinner?: boolean;
	isEliminated?: boolean;
	isLoser?: boolean;
	side?: "left" | "right";
	round?: "round1" | "later";
	showBio?: boolean;
	isSelected?: boolean;
	isCorrect?: boolean;
	isIncorrect?: boolean;
	isPickable?: boolean;
	isUnpicked?: boolean;
	playerId?: string;
	gameId?: string;
	onPick?: (gameId: string, playerId: string) => void;
	[key: string]: unknown;
}

interface PlayerNodeProps {
	photo: string;
	name: string;
	byline: string;
	ringColor?: string;
	isWinner?: boolean;
	isEliminated?: boolean;
	isLoser?: boolean;
	side?: "left" | "right";
	round?: "round1" | "later";
	showBio?: boolean;
	isSelected?: boolean;
	isCorrect?: boolean;
	isIncorrect?: boolean;
	isPickable?: boolean;
	isUnpicked?: boolean;
	playerId?: string;
	gameId?: string;
	onPick?: (gameId: string, playerId: string) => void;
}

export function PlayerNode({
	photo,
	name,
	byline,
	ringColor = "var(--orange)",
	isWinner = false,
	isEliminated = false,
	isLoser = false,
	side = "left",
	round = "later",
	showBio = true,
	isSelected = false,
	isCorrect = false,
	isIncorrect = false,
	isPickable = false,
	isUnpicked = false,
	playerId,
	gameId,
	onPick,
}: PlayerNodeProps) {
	const classNames = [
		"player-node",
		isWinner && "player-node--winner",
		isEliminated && "player-node--eliminated",
		isLoser && "player-node--loser",
		side === "right" && "player-node--right",
		round === "round1" && "player-node--round1",
		isSelected && "player-node--selected",
		isCorrect && "player-node--correct",
		isIncorrect && "player-node--incorrect",
		isPickable && "player-node--pickable",
		isUnpicked && "player-node--unpicked",
	]
		.filter(Boolean)
		.join(" ");

	const handleClick = () => {
		if (isPickable && onPick && gameId && playerId) {
			onPick(gameId, playerId);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (
			(e.key === "Enter" || e.key === " ") &&
			isPickable &&
			onPick &&
			gameId &&
			playerId
		) {
			e.preventDefault();
			onPick(gameId, playerId);
		}
	};

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: role is dynamically set to "button" when isPickable
		// biome-ignore lint/a11y/useAriaPropsSupportedByRole: aria-label valid when role="button" is applied
		<div
			className={classNames}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			role={isPickable ? "button" : undefined}
			tabIndex={isPickable ? 0 : undefined}
			aria-label={isPickable ? `Pick ${name} as winner` : undefined}
		>
			<div
				className="player-photo-ring"
				style={{ "--ring-color": ringColor } as React.CSSProperties}
			>
				<img src={photo} alt={name} className="player-photo" />
				{isCorrect && (
					<div className="player-node__badge player-node__badge--correct">
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="3"
							strokeLinecap="round"
							strokeLinejoin="round"
							role="img"
							aria-label="Correct pick"
						>
							<title>Correct pick</title>
							<polyline points="20 6 9 17 4 12" />
						</svg>
					</div>
				)}
				{isIncorrect && (
					<div className="player-node__badge player-node__badge--incorrect">
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="3"
							strokeLinecap="round"
							strokeLinejoin="round"
							role="img"
							aria-label="Incorrect pick"
						>
							<title>Incorrect pick</title>
							<line x1="18" y1="6" x2="6" y2="18" />
							<line x1="6" y1="6" x2="18" y2="18" />
						</svg>
					</div>
				)}
				{isSelected && !isCorrect && !isIncorrect && (
					<div className="player-node__badge player-node__badge--pending">
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="3"
							strokeLinecap="round"
							strokeLinejoin="round"
							role="img"
							aria-label="Your pick"
						>
							<title>Your pick</title>
							<polyline points="20 6 9 17 4 12" />
						</svg>
					</div>
				)}
			</div>
			<div className="player-info">
				<h3 className="player-name">{name}</h3>
				{showBio && byline && <p className="player-byline">{byline}</p>}
			</div>
		</div>
	);
}

function Handles({ round = "later" }: { round?: "round1" | "later" }) {
	// Photo ring center: large=~47px, small=~30px from top
	const handleOffset = round === "round1" ? 47 : 30;

	return (
		<>
			<Handle
				type="target"
				position={Position.Top}
				className="bracket-handle"
				style={{ top: handleOffset }}
				id="in-top"
			/>
			<Handle
				type="target"
				position={Position.Bottom}
				className="bracket-handle"
				style={{ bottom: handleOffset }}
				id="in-bottom"
			/>
			<Handle
				type="source"
				position={Position.Right}
				className="bracket-handle"
				style={{ right: 10 }}
				id="out-right"
			/>
			<Handle
				type="source"
				position={Position.Left}
				className="bracket-handle"
				style={{ left: 10 }}
				id="out-left"
			/>
		</>
	);
}

// React Flow wrapper for PlayerNode
export const PlayerNodeFlow = memo(function PlayerNodeFlow({
	data,
}: {
	data: PlayerData;
}) {
	return (
		<div style={{ position: "relative" }}>
			<PlayerNode
				photo={data.photo}
				name={data.name}
				byline={data.byline}
				ringColor={data.ringColor}
				isWinner={data.isWinner}
				isEliminated={data.isEliminated}
				isLoser={data.isLoser}
				side={data.side}
				round={data.round}
				showBio={data.showBio}
				isSelected={data.isSelected}
				isCorrect={data.isCorrect}
				isIncorrect={data.isIncorrect}
				isPickable={data.isPickable}
				isUnpicked={data.isUnpicked}
				playerId={data.playerId}
				gameId={data.gameId}
				onPick={data.onPick}
			/>
			<Handles round={data.round} />
		</div>
	);
});

// Empty slot for matches not yet played
export function EmptySlot({
	text,
	side = "left",
	ringColor,
	round = "later",
}: {
	text?: string;
	side?: "left" | "right";
	ringColor?: string;
	round?: "round1" | "later";
}) {
	const classNames = [
		"player-node",
		"player-node--empty",
		side === "right" && "player-node--right",
		round === "round1" && "player-node--round1",
	]
		.filter(Boolean)
		.join(" ");

	return (
		<div className={classNames}>
			<div
				className="player-photo-ring"
				style={
					ringColor
						? ({ "--ring-color": ringColor } as React.CSSProperties)
						: undefined
				}
			>
				<img src="/avatars/tbd.png" alt="TBD" className="player-photo" />
			</div>
			<div className="player-info">
				<h3 className="player-name">{text || "TBD"}</h3>
			</div>
		</div>
	);
}

// React Flow wrapper for EmptySlot
export const EmptySlotFlow = memo(function EmptySlotFlow({
	data,
}: {
	data: {
		text?: string;
		side?: "left" | "right";
		ringColor?: string;
		round?: "round1" | "later";
	};
}) {
	return (
		<div style={{ position: "relative" }}>
			<EmptySlot
				text={data?.text}
				side={data?.side}
				ringColor={data?.ringColor}
				round={data?.round}
			/>
			<Handles round={data?.round} />
		</div>
	);
});

import { Handle, Position } from "@xyflow/react";
import { memo, useMemo } from "react";
import "./bracket.css";
import { useLocation } from "@tanstack/react-router";
import { cfImage } from "@/lib/cfImage";
import placeholder from "/avatars/placeholders.png";

export interface PlayerData {
	photo: string;
	name: string;
	byline: string;
	ringColor?: string;
	isWinner?: boolean;
	isEliminated?: boolean;
	isSelected?: boolean;
	isCorrect?: boolean;
	isIncorrect?: boolean;
	isPickable?: boolean;
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
	isSelected?: boolean;
	isCorrect?: boolean;
	isIncorrect?: boolean;
	isPickable?: boolean;
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
	isSelected = false,
	isCorrect = false,
	isIncorrect = false,
	isPickable = false,
	playerId,
	gameId,
	onPick,
}: PlayerNodeProps) {
	const classNames = [
		"player-node",
		isWinner && "player-node--winner",
		isEliminated && "player-node--eliminated",
		isSelected && "player-node--selected",
		isCorrect && "player-node--correct",
		isIncorrect && "player-node--incorrect",
		isPickable && "player-node--pickable",
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
				isSelected={data.isSelected}
				isCorrect={data.isCorrect}
				isIncorrect={data.isIncorrect}
				isPickable={data.isPickable}
				playerId={data.playerId}
				gameId={data.gameId}
				onPick={data.onPick}
			/>
			<Handles />
		</div>
	);
});

// Empty slot for matches not yet played
export function EmptySlot({ text }: { text?: string }) {
	const location = useLocation();
	const placeholderUrl = cfImage(placeholder, {
		width: 600,
		origin: location.url.origin,
	});

	// Memoize random positions to prevent re-renders from changing them
	const { randomX, randomY } = useMemo(() => {
		const xPositions = [0, 25, 50, 75, 100];
		const yPositions = [0, 50, 100];
		return {
			randomX: xPositions[Math.floor(Math.random() * xPositions.length)],
			randomY: yPositions[Math.floor(Math.random() * yPositions.length)],
		};
	}, []);

	return (
		<div className="player-node player-node--empty">
			<div className="player-photo-ring">
				<div
					className="player-photo-placeholder"
					style={
						{
							"--placeholder-url": `url(${placeholderUrl})`,
							"--x": `${randomX}%`,
							"--y": `${randomY}%`,
						} as React.CSSProperties
					}
				/>
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
	data: { text?: string };
}) {
	return (
		<div style={{ position: "relative" }}>
			<EmptySlot text={data?.text} />
			<Handles />
		</div>
	);
});

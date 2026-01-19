export function ScoreboardUnit({ value, label }: { value: number; label: string }) {
	const digits = String(value).padStart(2, "0");
	return (
		<div className="scoreboard-unit">
			<div className="scoreboard-digits">
				<span className="scoreboard-digit">{digits[0]}</span>
				<span className="scoreboard-digit">{digits[1]}</span>
			</div>
			<span className="scoreboard-label">{label}</span>
		</div>
	);
}

export function LeaderboardScore({
	value,
	isTotal,
}: {
	value: number;
	isTotal?: boolean;
}) {
	const digits = String(value).padStart(isTotal ? 3 : 2, "0");
	return (
		<div
			className={`leaderboard-digits ${isTotal ? "leaderboard-digits--total" : ""}`}
		>
			{digits.split("").map((d, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: Digits don't reorder and spans are stateless
				<span key={i} className="leaderboard-digit">
					{d}
				</span>
			))}
		</div>
	);
}

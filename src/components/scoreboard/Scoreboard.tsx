import type { CountdownTime } from "@/hooks/useCountdown";
import { ScoreboardSeparator } from "./ScoreboardSeparator";
import { ScoreboardUnit } from "./ScoreboardUnit";

export function Scoreboard({
	countdown,
	isUrgent,
}: {
	countdown: CountdownTime;
	isUrgent: boolean;
}) {
	return (
		<div className={`scoreboard ${isUrgent ? "scoreboard--urgent" : ""}`}>
			<div className="scoreboard-frame">
				<div className="scoreboard-rivet scoreboard-rivet--tl" />
				<div className="scoreboard-rivet scoreboard-rivet--tr" />
				<div className="scoreboard-rivet scoreboard-rivet--bl" />
				<div className="scoreboard-rivet scoreboard-rivet--br" />
				<div className="scoreboard-display">
					<ScoreboardUnit value={countdown.days} label="DAYS" />
					<ScoreboardSeparator />
					<ScoreboardUnit value={countdown.hours} label="HRS" />
					<ScoreboardSeparator />
					<ScoreboardUnit value={countdown.minutes} label="MIN" />
					<ScoreboardSeparator />
					<ScoreboardUnit value={countdown.seconds} label="SEC" />
				</div>
				<div className="scoreboard-scanlines" />
			</div>
		</div>
	);
}

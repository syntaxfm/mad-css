import { useQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { LeaderboardScore } from "./LeaderboardScore";
import "./leaderboard.css";

type LeaderboardEntry = {
	rank: number;
	showRank: boolean;
	userId: string;
	userName: string;
	userImage: string | null;
	username: string | null;
	round1Score: number;
	round2Score: number;
	round3Score: number;
	round4Score: number;
	totalScore: number;
};

const getLeaderboard = createServerFn({ method: "GET" }).handler(async () => {
	const { env } = await import("cloudflare:workers");
	const { createDb } = await import("@/db");
	const { desc, eq } = await import("drizzle-orm");
	const schema = await import("@/db/schema");

	const db = createDb(env.DB);

	const scores = await db
		.select({
			userId: schema.userScore.userId,
			round1Score: schema.userScore.round1Score,
			round2Score: schema.userScore.round2Score,
			round3Score: schema.userScore.round3Score,
			round4Score: schema.userScore.round4Score,
			totalScore: schema.userScore.totalScore,
			userName: schema.user.name,
			userImage: schema.user.image,
			username: schema.user.username,
		})
		.from(schema.userScore)
		.innerJoin(schema.user, eq(schema.userScore.userId, schema.user.id))
		.orderBy(desc(schema.userScore.totalScore))
		.limit(100);

	let currentRank = 1;
	return scores.map(
		(score, index): LeaderboardEntry => {
			const isTied =
				index > 0 && score.totalScore === scores[index - 1].totalScore;
			if (index > 0 && !isTied) {
				currentRank = index + 1;
			}
			return {
				rank: currentRank,
				showRank: !isTied,
				userId: score.userId,
				userName: score.userName,
				userImage: score.userImage,
				username: score.username,
				round1Score: score.round1Score,
				round2Score: score.round2Score,
				round3Score: score.round3Score,
				round4Score: score.round4Score,
				totalScore: score.totalScore,
			};
		},
	);
});

export function Leaderboard() {
	const { data, isLoading } = useQuery<LeaderboardEntry[]>({
		queryKey: ["leaderboard"],
		queryFn: () => getLeaderboard(),
		staleTime: 1000 * 60 * 5,
	});
	const entries = data ?? [];

	return (
		<section className="section leaderboard-section">
			<div className="section-content">
				<h2>The Leaderboard</h2>
				<div className="leaderboard-wrapper">
					<div className="leaderboard-frame">
						<div className="leaderboard-bolt leaderboard-bolt--tl" />
						<div className="leaderboard-bolt leaderboard-bolt--tr" />
						<div className="leaderboard-bolt leaderboard-bolt--bl" />
						<div className="leaderboard-bolt leaderboard-bolt--br" />

						<h3 className="leaderboard-title">Top Predictors</h3>

						{isLoading ? (
							<div className="leaderboard-empty">Loading...</div>
						) : entries.length === 0 ? (
							<div className="leaderboard-empty">
								<p>No scores yet. Make your picks and check back after Round 1!</p>
							</div>
						) : (
							<table className="leaderboard-table">
								<thead>
									<tr>
										<th>#</th>
										<th>Player</th>
										<th>Total</th>
									</tr>
								</thead>
								<tbody>
									{entries.map((entry) => (
										<tr key={entry.userId}>
											<td className="leaderboard-rank">
											{entry.showRank ? entry.rank : ""}
										</td>
											<td>
												{entry.username ? (
													<a
														href={`/bracket/${entry.username}`}
														className="leaderboard-player leaderboard-player--link"
													>
														{entry.userImage && (
															<img
																src={entry.userImage}
																alt=""
																className="leaderboard-avatar"
															/>
														)}
														<span className="leaderboard-name">
															{entry.userName}
														</span>
													</a>
												) : (
													<div className="leaderboard-player">
														{entry.userImage && (
															<img
																src={entry.userImage}
																alt=""
																className="leaderboard-avatar"
															/>
														)}
														<span className="leaderboard-name">
															{entry.userName}
														</span>
													</div>
												)}
											</td>
											<td className="leaderboard-total">
												<LeaderboardScore value={entry.totalScore} isTotal />
											</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}

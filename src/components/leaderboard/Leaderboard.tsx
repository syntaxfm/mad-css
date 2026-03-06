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

const VISIBLE_PER_RANK = 10;

const getLeaderboard = createServerFn({ method: "GET" }).handler(async () => {
	const Sentry = await import("@sentry/tanstackstart-react");
	const { env } = await import("cloudflare:workers");
	const { createDb } = await import("@/db");
	const { and, desc, eq, inArray, notInArray } = await import("drizzle-orm");
	const schema = await import("@/db/schema");
	const { ADMIN_GITHUB_IDS } = await import("@/lib/admin");

	return Sentry.startSpan({ name: "leaderboard.fetch", op: "db" }, async () => {
		const db = createDb(env.DB);

		const adminUserIds = db
			.select({ userId: schema.account.userId })
			.from(schema.account)
			.where(
				and(
					eq(schema.account.providerId, "github"),
					inArray(schema.account.accountId, [...ADMIN_GITHUB_IDS]),
				),
			);

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
			.where(notInArray(schema.userScore.userId, adminUserIds))
			.orderBy(desc(schema.userScore.totalScore))
			.limit(129);

		let currentRank = 1;
		return scores.map((score, index): LeaderboardEntry => {
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
		});
	});
});

function groupByRank(entries: LeaderboardEntry[]) {
	const groups: Map<number, LeaderboardEntry[]> = new Map();
	for (const entry of entries) {
		const group = groups.get(entry.rank) || [];
		group.push(entry);
		groups.set(entry.rank, group);
	}
	return groups;
}

function ordinal(n: number) {
	const s = ["th", "st", "nd", "rd"];
	const v = n % 100;
	return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

function OverflowAvatars({
	entries,
	rank,
}: {
	entries: LeaderboardEntry[];
	rank: number;
}) {
	return (
		<tr className="leaderboard-overflow-row">
			<td />
			<td colSpan={2}>
				<div className="leaderboard-overflow">
					<span className="leaderboard-overflow-label">
						+{entries.length} more tied for {ordinal(rank)}
					</span>
					<div className="leaderboard-overflow-avatars">
						{entries.map((entry) => (
							<a
								key={entry.userId}
								href={entry.username ? `/bracket/${entry.username}` : undefined}
								className="leaderboard-overflow-avatar-link"
								title={entry.userName}
							>
								{entry.userImage ? (
									<img
										src={entry.userImage}
										alt={entry.userName}
										className="leaderboard-avatar leaderboard-avatar--sm"
									/>
								) : (
									<span className="leaderboard-avatar leaderboard-avatar--sm leaderboard-avatar--placeholder" />
								)}
							</a>
						))}
					</div>
				</div>
			</td>
		</tr>
	);
}

export function Leaderboard() {
	const { data, isLoading } = useQuery<LeaderboardEntry[]>({
		queryKey: ["leaderboard"],
		queryFn: () => getLeaderboard(),
		staleTime: 1000 * 60 * 5,
	});
	const entries = data ?? [];
	const rankGroups = groupByRank(entries);
	const topRanks = [...rankGroups.entries()].filter(([rank]) => rank <= 10);

	return (
		<section id="leaderboard" className="section leaderboard-section">
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
								<p>
									No scores yet. Make your picks and check back after Round 1!
								</p>
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
									{topRanks.map(([rank, group]) => {
										const visible = group.slice(0, VISIBLE_PER_RANK);
										const overflow = group.slice(VISIBLE_PER_RANK);
										return (
											<>
												{visible.map((entry, i) => (
													<tr key={entry.userId}>
														<td className="leaderboard-rank">
															{i === 0 ? rank : ""}
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
															<LeaderboardScore
																value={entry.totalScore}
																isTotal
															/>
														</td>
													</tr>
												))}
												{overflow.length > 0 && (
													<OverflowAvatars entries={overflow} rank={rank} />
												)}
											</>
										);
									})}
								</tbody>
							</table>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}

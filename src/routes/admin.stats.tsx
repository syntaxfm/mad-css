import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { useState } from "react";
import { bracket, FEEDER_GAMES, players } from "@/data/players";
import "@/styles/admin.css";
import "@/styles/admin-stats.css";

type PlayerCountStat = {
	playerId: string;
	playerName: string;
	playerPhoto: string;
	pickCount: number;
	pickSharePct: number;
};

type RoundOneSplitStat = {
	gameId: string;
	matchLabel: string;
	player1Name: string;
	player1Photo: string;
	player1Count: number;
	player1Pct: number;
	player2Name: string;
	player2Photo: string;
	player2Count: number;
	player2Pct: number;
	totalPicks: number;
};

type ComboOptionStat = {
	player1Name: string;
	player1Photo: string;
	player2Name: string;
	player2Photo: string;
	count: number;
	sharePct: number;
};

type ComboGameStat = {
	gameId: string;
	gameLabel: string;
	totalEligiblePicks: number;
	mostCommonCombo: ComboOptionStat | null;
	topCombos: ComboOptionStat[];
};

type DailyPickStat = {
	date: string;
	userCount: number;
};

type AdminStatsDashboard = {
	totalUsers: number;
	usersWithPicks: number;
	totalPredictions: number;
	totalChampionPicks: number;
	championPicks: PlayerCountStat[];
	overallPlayerPicks: PlayerCountStat[];
	roundOneSplits: RoundOneSplitStat[];
	laterRoundCombos: ComboGameStat[];
	dailyPickCreation: DailyPickStat[];
};

function normalizeTimestamp(value: Date | number | null | undefined) {
	if (value instanceof Date) return value.getTime();
	if (typeof value === "number") return value;
	return null;
}

function getGameLabel(gameId: string) {
	if (gameId.startsWith("qf-")) {
		return `Quarterfinal ${Number.parseInt(gameId.split("-")[1], 10) + 1}`;
	}
	if (gameId.startsWith("sf-")) {
		return `Semifinal ${Number.parseInt(gameId.split("-")[1], 10) + 1}`;
	}
	return "Final";
}

function toColorAvatarPath(photoPath: string) {
	if (photoPath.startsWith("/avatars/color/")) return photoPath;
	if (photoPath.startsWith("/avatars/")) {
		return photoPath.replace("/avatars/", "/avatars/color/");
	}
	return photoPath;
}

const checkAdminStatsFn = createServerFn({ method: "GET" }).handler(
	async () => {
		const { env } = await import("cloudflare:workers");
		const { createAuth } = await import("@/lib/auth");
		const { createDb } = await import("@/db");
		const { isAdminUser } = await import("@/lib/admin");
		const schema = await import("@/db/schema");

		const headers = getRequestHeaders();
		const auth = createAuth(env.DB);
		const session = await auth.api.getSession({
			headers: new Headers(headers),
		});

		if (!session?.user) {
			return { authorized: false as const };
		}

		const db = createDb(env.DB);
		const isAdmin = await isAdminUser(db, session.user.id);
		if (!isAdmin) {
			return { authorized: false as const };
		}

		const [users, predictions] = await Promise.all([
			db
				.select({
					id: schema.user.id,
					createdAt: schema.user.createdAt,
				})
				.from(schema.user),
			db
				.select({
					userId: schema.userPrediction.userId,
					gameId: schema.userPrediction.gameId,
					predictedWinnerId: schema.userPrediction.predictedWinnerId,
					createdAt: schema.userPrediction.createdAt,
				})
				.from(schema.userPrediction),
		]);

		const userIdsWithPicks = new Set<string>();
		const overallPickCounts = new Map<string, number>();
		const championPickCounts = new Map<string, number>();
		const roundOneCounts = new Map<string, Map<string, number>>();
		const userPredictionByGame = new Map<string, Map<string, string>>();
		const firstPickAtByUser = new Map<string, number>();

		for (const prediction of predictions) {
			userIdsWithPicks.add(prediction.userId);

			overallPickCounts.set(
				prediction.predictedWinnerId,
				(overallPickCounts.get(prediction.predictedWinnerId) ?? 0) + 1,
			);

			if (prediction.gameId === "final") {
				championPickCounts.set(
					prediction.predictedWinnerId,
					(championPickCounts.get(prediction.predictedWinnerId) ?? 0) + 1,
				);
			}

			if (prediction.gameId.startsWith("r1-")) {
				const gameMap =
					roundOneCounts.get(prediction.gameId) ?? new Map<string, number>();
				gameMap.set(
					prediction.predictedWinnerId,
					(gameMap.get(prediction.predictedWinnerId) ?? 0) + 1,
				);
				roundOneCounts.set(prediction.gameId, gameMap);
			}

			const gamePicks =
				userPredictionByGame.get(prediction.userId) ?? new Map();
			gamePicks.set(prediction.gameId, prediction.predictedWinnerId);
			userPredictionByGame.set(prediction.userId, gamePicks);

			const createdAt = normalizeTimestamp(prediction.createdAt);
			if (createdAt !== null) {
				const currentMin = firstPickAtByUser.get(prediction.userId);
				if (currentMin === undefined || createdAt < currentMin) {
					firstPickAtByUser.set(prediction.userId, createdAt);
				}
			}
		}

		const totalPredictions = predictions.length;
		const totalChampionPicks = Array.from(championPickCounts.values()).reduce(
			(total, count) => total + count,
			0,
		);

		const toPlayerStats = (
			counts: Map<string, number>,
			denominator: number,
		): PlayerCountStat[] => {
			return players
				.map((player) => {
					const pickCount = counts.get(player.id) ?? 0;
					return {
						playerId: player.id,
						playerName: player.name,
						playerPhoto: toColorAvatarPath(player.photo),
						pickCount,
						pickSharePct: denominator > 0 ? (pickCount / denominator) * 100 : 0,
					};
				})
				.sort((a, b) => {
					if (b.pickCount !== a.pickCount) return b.pickCount - a.pickCount;
					return a.playerName.localeCompare(b.playerName);
				});
		};

		const championPicks = toPlayerStats(championPickCounts, totalChampionPicks);
		const overallPlayerPicks = toPlayerStats(
			overallPickCounts,
			totalPredictions,
		);

		const roundOneSplits: RoundOneSplitStat[] = bracket.round1.flatMap(
			(game) => {
				if (!game.player1 || !game.player2) return [];

				const { player1, player2 } = game;
				const gameCounts =
					roundOneCounts.get(game.id) ?? new Map<string, number>();
				const player1Count = gameCounts.get(player1.id) ?? 0;
				const player2Count = gameCounts.get(player2.id) ?? 0;
				const totalPicks = player1Count + player2Count;
				const player1Pct =
					totalPicks > 0 ? (player1Count / totalPicks) * 100 : 0;
				const player2Pct =
					totalPicks > 0 ? (player2Count / totalPicks) * 100 : 0;

				return [
					{
						gameId: game.id,
						matchLabel: `${player1.name} vs ${player2.name}`,
						player1Name: player1.name,
						player1Photo: toColorAvatarPath(player1.photo),
						player1Count,
						player1Pct,
						player2Name: player2.name,
						player2Photo: toColorAvatarPath(player2.photo),
						player2Count,
						player2Pct,
						totalPicks,
					},
				];
			},
		);

		const playerById = new Map(players.map((player) => [player.id, player]));
		const laterRoundCombos: ComboGameStat[] = Object.entries(FEEDER_GAMES).map(
			([gameId, [sourceA, sourceB]]) => {
				const comboCounts = new Map<string, number>();
				let totalEligiblePicks = 0;

				for (const userPicks of userPredictionByGame.values()) {
					const playerAId = userPicks.get(sourceA);
					const playerBId = userPicks.get(sourceB);
					if (!playerAId || !playerBId) continue;

					const comboKey = `${playerAId}|${playerBId}`;
					comboCounts.set(comboKey, (comboCounts.get(comboKey) ?? 0) + 1);
					totalEligiblePicks += 1;
				}

				const topCombos = Array.from(comboCounts.entries())
					.map(([comboKey, count]) => {
						const [playerAId, playerBId] = comboKey.split("|");
						const playerA = playerById.get(playerAId);
						const playerB = playerById.get(playerBId);
						return {
							player1Name: playerA?.name ?? playerAId,
							player1Photo: toColorAvatarPath(
								playerA?.photo ?? `/avatars/${playerAId}.png`,
							),
							player2Name: playerB?.name ?? playerBId,
							player2Photo: toColorAvatarPath(
								playerB?.photo ?? `/avatars/${playerBId}.png`,
							),
							count,
							sharePct:
								totalEligiblePicks > 0 ? (count / totalEligiblePicks) * 100 : 0,
						};
					})
					.sort((a, b) => {
						if (b.count !== a.count) return b.count - a.count;
						return `${a.player1Name} ${a.player2Name}`.localeCompare(
							`${b.player1Name} ${b.player2Name}`,
						);
					})
					.slice(0, 3);

				return {
					gameId,
					gameLabel: getGameLabel(gameId),
					totalEligiblePicks,
					mostCommonCombo: topCombos[0] ?? null,
					topCombos,
				};
			},
		);

		const dailyMap = new Map<string, number>();
		for (const user of users) {
			const firstPickAt = firstPickAtByUser.get(user.id);
			const signupAt = normalizeTimestamp(user.createdAt);
			const sourceTime = firstPickAt ?? signupAt;
			if (sourceTime === null) continue;

			const date = new Date(sourceTime).toISOString().slice(0, 10);
			dailyMap.set(date, (dailyMap.get(date) ?? 0) + 1);
		}

		const dailyPickCreation = Array.from(dailyMap.entries())
			.sort((a, b) => a[0].localeCompare(b[0]))
			.map(([date, userCount]) => ({
				date,
				userCount,
			}));

		const data: AdminStatsDashboard = {
			totalUsers: users.length,
			usersWithPicks: userIdsWithPicks.size,
			totalPredictions,
			totalChampionPicks,
			championPicks,
			overallPlayerPicks,
			roundOneSplits,
			laterRoundCombos,
			dailyPickCreation,
		};

		return { authorized: true as const, data };
	},
);

export const Route = createFileRoute("/admin/stats" as never)({
	beforeLoad: async () => {
		const result = await checkAdminStatsFn();
		if (!result.authorized) {
			throw redirect({ to: "/" });
		}
		return { statsData: result.data };
	},
	loader: ({ context }) => {
		return (context as { statsData: AdminStatsDashboard }).statsData;
	},
	component: AdminStatsPage,
});

function formatPct(value: number) {
	return `${value.toFixed(1)}%`;
}

function formatWholePct(value: number) {
	return `${Math.round(value)}%`;
}

function AdminStatsPage() {
	const stats = Route.useLoaderData() as AdminStatsDashboard;
	const [displayMode, setDisplayMode] = useState<"count" | "percent">("count");
	const showPercent = displayMode === "percent";

	const totalUsers = stats?.totalUsers ?? 0;
	const usersWithPicks = stats?.usersWithPicks ?? 0;
	const totalPredictions = stats?.totalPredictions ?? 0;
	const totalChampionPicks = stats?.totalChampionPicks ?? 0;
	const championPicks = stats?.championPicks ?? [];
	const overallPlayerPicks = stats?.overallPlayerPicks ?? [];
	const roundOneSplits = stats?.roundOneSplits ?? [];
	const laterRoundCombos = stats?.laterRoundCombos ?? [];
	const dailyPickCreation = stats?.dailyPickCreation ?? [];

	const maxDailyUsers = Math.max(
		1,
		...dailyPickCreation.map((row) => row.userCount),
	);

	return (
		<div className="admin-page admin-stats-page">
			<div className="admin-header">
				<h1>Admin Stats Dashboard</h1>
				<div className="admin-stats-links">
					<div className="stats-toggle">
						<button
							type="button"
							className={`stats-toggle-btn ${displayMode === "count" ? "active" : ""}`}
							onClick={() => setDisplayMode("count")}
						>
							Counts
						</button>
						<button
							type="button"
							className={`stats-toggle-btn ${displayMode === "percent" ? "active" : ""}`}
							onClick={() => setDisplayMode("percent")}
						>
							Percent
						</button>
					</div>
					<Link to="/admin" className="admin-btn">
						User Admin
					</Link>
					<Link to="/" className="admin-btn">
						Back to Site
					</Link>
				</div>
			</div>

			<section className="admin-stats-grid">
				<article className="stat-card">
					<h3>Total Users</h3>
					<div className="stat-readout">{totalUsers}</div>
				</article>
				<article className="stat-card">
					<h3>Users With Picks</h3>
					<div className="stat-readout">{usersWithPicks}</div>
				</article>
				<article className="stat-card">
					<h3>Total Picks Logged</h3>
					<div className="stat-readout">{totalPredictions}</div>
				</article>
				<article className="stat-card">
					<h3>Champion Picks</h3>
					<div className="stat-readout">{totalChampionPicks}</div>
				</article>
			</section>

			<section className="stats-panel">
				<div className="stats-panel-header">
					<h2>Picked To Win It All</h2>
					<span>Every player, ranked by championship picks</span>
				</div>
				<div className="win-all-cards">
					{championPicks.map((row, index) => (
						<article
							key={row.playerId}
							className={`win-all-card ${index < 3 ? "top-rank" : ""}`}
						>
							<div className="win-all-header">
								<img src={row.playerPhoto} alt={row.playerName} />
							</div>
							<div className="win-all-content">
								<p>
									<strong>
										{showPercent
											? formatWholePct(row.pickSharePct)
											: row.pickCount}
									</strong>{" "}
									{showPercent ? "of picks chose" : "people picked"}{" "}
									<strong>{row.playerName}</strong> to win it all
								</p>
							</div>
						</article>
					))}
				</div>
			</section>

			<section className="stats-panel">
				<div className="stats-panel-header">
					<h2>Most Picked People (All Games)</h2>
					<span>Includes everyone so least-picked players are visible</span>
				</div>
				<div className="pick-distribution dense">
					{overallPlayerPicks.map((row, index) => (
						<div
							key={row.playerId}
							className={`pick-row ${index < 3 ? "top-rank" : ""}`}
						>
							<span className="pick-rank-badge">#{index + 1}</span>
							<div className="pick-player">
								<img src={row.playerPhoto} alt={row.playerName} />
								<span>{row.playerName}</span>
							</div>
							<div className="pick-bar-wrap">
								<div
									className="pick-bar overall"
									style={{ width: `${row.pickSharePct}%` }}
								/>
							</div>
							<div className="pick-meta">
								<strong>
									{showPercent
										? formatWholePct(row.pickSharePct)
										: row.pickCount}
								</strong>
								<span>
									{showPercent
										? `${row.pickCount} picks`
										: formatPct(row.pickSharePct)}
								</span>
							</div>
						</div>
					))}
				</div>
			</section>

			<section className="stats-panel">
				<div className="stats-panel-header">
					<h2>Round 1 Match Splits</h2>
					<span>Percent split for each of the eight opening matchups</span>
				</div>
				<div className="split-grid">
					{roundOneSplits.map((split) => (
						<article key={split.gameId} className="split-card">
							<div className="split-bar">
								<div
									className={`split-side split-side-left${split.player1Pct >= split.player2Pct ? " split-winner" : ""}`}
									style={{ width: `${split.player1Pct}%` }}
								>
									<img
										src={split.player1Photo}
										alt={split.player1Name}
									/>
									<div className="split-info">
										<span className="split-name">
											{split.player1Name}
										</span>
										<strong className="split-stat">
											{showPercent
												? formatWholePct(split.player1Pct)
												: split.player1Count}
										</strong>
									</div>
								</div>
								<div
									className={`split-side split-side-right${split.player2Pct > split.player1Pct ? " split-winner" : ""}`}
									style={{ width: `${split.player2Pct}%` }}
								>
									<div className="split-info split-info-right">
										<span className="split-name">
											{split.player2Name}
										</span>
										<strong className="split-stat">
											{showPercent
												? formatWholePct(split.player2Pct)
												: split.player2Count}
										</strong>
									</div>
									<img
										src={split.player2Photo}
										alt={split.player2Name}
									/>
								</div>
							</div>
						</article>
					))}
				</div>
			</section>

			<section className="stats-panel">
				<div className="stats-panel-header">
					<h2>Most Common Predicted Matchups</h2>
					<span>
						Top feeder combination for each quarter, semi, and final game
					</span>
				</div>
				<div className="combo-grid">
					{laterRoundCombos.map((comboGame) => (
						<article key={comboGame.gameId} className="combo-card">
							<h3>Top Picked Matchups for {comboGame.gameLabel}</h3>
							{comboGame.mostCommonCombo ? (
								<>
									<p className="combo-label">Most common matchup</p>
									<div className="combo-primary">
										<div className="combo-player">
											<img
												src={comboGame.mostCommonCombo.player1Photo}
												alt={comboGame.mostCommonCombo.player1Name}
											/>
											<span>{comboGame.mostCommonCombo.player1Name}</span>
										</div>
										<span className="combo-vs">vs</span>
										<div className="combo-player">
											<img
												src={comboGame.mostCommonCombo.player2Photo}
												alt={comboGame.mostCommonCombo.player2Name}
											/>
											<span>{comboGame.mostCommonCombo.player2Name}</span>
										</div>
									</div>
									<p className="combo-support">
										{showPercent
											? `${formatWholePct(comboGame.mostCommonCombo.sharePct)} of picks`
											: `${comboGame.mostCommonCombo.count} picks`}
									</p>
								</>
							) : (
								<p className="combo-primary">Not enough picks yet</p>
							)}
							<div className="combo-mini-list">
								{comboGame.topCombos.map((combo) => (
									<div
										key={`${combo.player1Name}-${combo.player2Name}`}
										className="combo-mini-row"
									>
										<div className="combo-mini-player">
											<img src={combo.player1Photo} alt={combo.player1Name} />
											<span>{combo.player1Name.split(" ")[0]}</span>
										</div>
										<span className="combo-mini-vs">vs</span>
										<div className="combo-mini-player combo-mini-right">
											<span>{combo.player2Name.split(" ")[0]}</span>
											<img src={combo.player2Photo} alt={combo.player2Name} />
										</div>
										<strong className="combo-mini-value">
											{showPercent
												? formatWholePct(combo.sharePct)
												: combo.count}
										</strong>
									</div>
								))}
							</div>
							<small>{comboGame.totalEligiblePicks} eligible brackets</small>
						</article>
					))}
				</div>
			</section>

			<section className="stats-panel">
				<div className="stats-panel-header">
					<h2>Daily Pick Creation</h2>
					<span>
						Uses first pick timestamp per user; falls back to signup date when
						pick date is unavailable
					</span>
				</div>
				<div className="daily-chart">
					{dailyPickCreation.map((day) => (
						<div key={day.date} className="day-bar">
							<span className="day-count">
								{showPercent
									? formatWholePct(
											(day.userCount / Math.max(1, totalUsers)) * 100,
										)
									: day.userCount}
							</span>
							<div
								className="day-fill"
								style={{
									height: `${Math.max(
										12,
										(day.userCount / maxDailyUsers) * 150,
									)}px`,
								}}
							/>
							<span className="day-date">{day.date.slice(5)}</span>
						</div>
					))}
				</div>
			</section>
		</div>
	);
}

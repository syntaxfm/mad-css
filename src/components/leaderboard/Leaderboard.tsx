import { useEffect, useState } from "react";
import type { LeaderboardEntry } from "@/routes/api/leaderboard/index";
import { LeaderboardScore } from "./LeaderboardScore";
import "./leaderboard.css";

export function Leaderboard() {
	const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetch("/api/leaderboard/")
			.then((res) => {
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				return res.json();
			})
			.then((data) => {
				setEntries(data.leaderboard || []);
				setLoading(false);
			})
			.catch(() => {
				setLoading(false);
			});
	}, []);

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

						{loading ? (
							<div className="leaderboard-empty">Loading...</div>
						) : entries.length === 0 ? (
							<div className="leaderboard-empty">
								No scores yet. Lock your bracket and check back after Round 1!
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
											<td className="leaderboard-rank">{entry.rank}</td>
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

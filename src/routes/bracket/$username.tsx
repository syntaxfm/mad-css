import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bracket } from "@/components/bracket/Bracket";
import { Ticket } from "@/components/Ticket";
import { players } from "@/data/players";
import type { PublicBracketResponse } from "@/routes/api/bracket/$username";
import "@/styles/share-bracket.css";

export const Route = createFileRoute("/bracket/$username")({
	head: ({ params }) => {
		const { username } = params;
		const ogImageUrl = `/api/og/${username}`;
		return {
			meta: [
				{ title: `${username}'s Bracket | March Mad CSS` },
				{
					name: "description",
					content: `Check out ${username}'s bracket picks for March Mad CSS!`,
				},
				{
					property: "og:title",
					content: `${username}'s Bracket | March Mad CSS`,
				},
				{
					property: "og:description",
					content: `Check out ${username}'s bracket picks!`,
				},
				{ property: "og:image", content: ogImageUrl },
				{ property: "og:type", content: "website" },
				{ name: "twitter:card", content: "summary_large_image" },
				{ name: "twitter:title", content: `${username}'s Bracket` },
				{
					name: "twitter:description",
					content: `Check out ${username}'s bracket picks!`,
				},
				{ name: "twitter:image", content: ogImageUrl },
			],
		};
	},
	component: BracketPage,
});

function BracketPage() {
	const { username } = Route.useParams();
	const [data, setData] = useState<PublicBracketResponse | null>(null);
	const [error, setError] = useState<"not_found" | "not_locked" | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetch(`/api/bracket/${username}`)
			.then((res) => {
				if (res.status === 404) {
					setError("not_found");
					setLoading(false);
					return null;
				}
				if (res.status === 403) {
					setError("not_locked");
					setLoading(false);
					return null;
				}
				if (!res.ok) {
					setError("not_found");
					setLoading(false);
					return null;
				}
				return res.json();
			})
			.then((result: PublicBracketResponse | null) => {
				if (result) {
					setData(result);
				}
				setLoading(false);
			})
			.catch(() => {
				setError("not_found");
				setLoading(false);
			});
	}, [username]);

	if (loading) {
		return (
			<>
				<Ticket />
				<div className="section">
					<div className="section-content">
						<div className="share-bracket-error">
							<p>Loading bracket...</p>
						</div>
					</div>
				</div>
			</>
		);
	}

	if (error === "not_found") {
		return (
			<>
				<Ticket />
				<div className="section">
					<div className="section-content">
						<div className="share-bracket-error">
							<h1>Bracket Not Found</h1>
							<p>This user doesn't exist or hasn't created a bracket yet.</p>
							<a href="/test" className="btn-primary">
								Make Your Own Picks
							</a>
						</div>
					</div>
				</div>
			</>
		);
	}

	if (error === "not_locked") {
		return (
			<>
				<Ticket />
				<div className="section">
					<div className="section-content">
						<div className="share-bracket-error">
							<h1>Bracket Not Available</h1>
							<p>This bracket hasn't been locked yet. Check back later!</p>
							<a href="/test" className="btn-primary">
								Make Your Own Picks
							</a>
						</div>
					</div>
				</div>
			</>
		);
	}

	if (!data) {
		return (
			<>
				<Ticket />
				<div className="section">
					<div className="section-content">
						<div className="share-bracket-error">
							<h1>Something went wrong</h1>
							<p>Unable to load the bracket. Please try again.</p>
							<a href="/test" className="btn-primary">
								Make Your Own Picks
							</a>
						</div>
					</div>
				</div>
			</>
		);
	}

	// Convert array predictions to record format
	const predictions: Record<string, string> = {};
	for (const p of data.predictions) {
		predictions[p.gameId] = p.predictedWinnerId;
	}

	const championId = predictions.final;
	const champion = championId ? players.find((p) => p.id === championId) : null;

	return (
		<>
			<Ticket />
			<div className="section">
				<div className="section-content">
					<div className="share-bracket-header">
						<div className="share-bracket-user">
							{data.user.image && (
								<img
									src={data.user.image}
									alt=""
									className="share-bracket-avatar"
								/>
							)}
							<div className="share-bracket-user-info">
								<h1>{data.user.name}'s Bracket</h1>
								<span className="share-bracket-username">
									@{data.user.username}
								</span>
							</div>
						</div>
						{champion && (
							<div className="share-bracket-champion">
								<span className="champion-label">Champion Pick</span>
								<span className="champion-name">{champion.name}</span>
							</div>
						)}
					</div>
					<Bracket isInteractive predictions={predictions} />
				</div>
			</div>
			<div className="share-bracket-cta">
				<a href="/test" className="btn-primary">
					Make Your Own Picks
				</a>
			</div>
		</>
	);
}

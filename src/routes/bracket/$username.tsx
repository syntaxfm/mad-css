import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bracket } from "@/components/bracket/Bracket";
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
	const [notFoundError, setNotFoundError] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetch(`/api/bracket/${username}`)
			.then((res) => {
				if (!res.ok) {
					setNotFoundError(true);
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
				setNotFoundError(true);
				setLoading(false);
			});
	}, [username]);

	if (loading) {
		return (
			<div className="section">
				<div className="section-content">
					<div className="share-bracket-error">
						<p>Loading bracket...</p>
					</div>
				</div>
			</div>
		);
	}

	if (notFoundError || !data) {
		throw notFound();
	}

	// Convert array predictions to record format
	const predictions: Record<string, string> = {};
	for (const p of data.predictions) {
		predictions[p.gameId] = p.predictedWinnerId;
	}

	return (
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
					<a href="/test" className="btn-primary">
						Make Your Own Picks
					</a>
				</div>
			</div>
			<Bracket isInteractive predictions={predictions} />
		</div>
	);
}

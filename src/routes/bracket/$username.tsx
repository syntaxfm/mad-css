import { createFileRoute, notFound } from "@tanstack/react-router";
import { createIsomorphicFn, createServerFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Bracket } from "@/components/bracket/Bracket";
import { NotFound } from "@/components/NotFound";
import { getResultsFromBracket } from "@/data/players";
import "@/styles/share-bracket.css";

const getLocation = createIsomorphicFn()
	.server(() => getRequestUrl())
	.client(() => new URL(window.location.href));

const usernameInputSchema = z.object({
	username: z
		.string()
		.min(1)
		.max(39)
		.regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/),
});

const getBracketData = createServerFn({ method: "GET" })
	.inputValidator((d: unknown) => usernameInputSchema.parse(d))
	.handler(async ({ data }) => {
		const Sentry = await import("@sentry/tanstackstart-react");
		const { username } = data;
		const { env } = await import("cloudflare:workers");
		const { eq } = await import("drizzle-orm");
		const { createDb } = await import("@/db");
		const schema = await import("@/db/schema");

		return Sentry.startSpan({ name: "bracket.getData", op: "db" }, async () => {
			const db = createDb(env.DB);

			const users = await db
				.select({
					id: schema.user.id,
					name: schema.user.name,
					image: schema.user.image,
					username: schema.user.username,
				})
				.from(schema.user)
				.where(eq(schema.user.username, username))
				.limit(1);

			if (users.length === 0 || !users[0].username) {
				return { found: false as const };
			}

			const user = users[0];

			const predictions = await db
				.select({
					gameId: schema.userPrediction.gameId,
					predictedWinnerId: schema.userPrediction.predictedWinnerId,
				})
				.from(schema.userPrediction)
				.where(eq(schema.userPrediction.userId, user.id));

			if (predictions.length === 0) {
				return { found: false as const };
			}

			return {
				found: true as const,
				user: {
					name: user.name,
					image: user.image,
					username: user.username,
				},
				predictions,
			};
		});
	});

export const Route = createFileRoute("/bracket/$username")({
	loader: async ({ params }) => {
		const result = await getBracketData({
			data: { username: params.username },
		});
		if (!result.found) {
			throw notFound();
		}
		return result;
	},
	notFoundComponent: () => (
		<NotFound message="This bracket doesn't exist. The player you're looking for may have never entered the tournament." />
	),
	head: ({ params }) => {
		const { username } = params;
		const url = getLocation();
		const ogImageUrl = `${url.origin}/api/og/${username}`;
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

function getBracketResults(): Record<string, string> {
	const results: Record<string, string> = {};
	for (const r of getResultsFromBracket()) {
		results[r.gameId] = r.winnerId;
	}
	return results;
}

function BracketPage() {
	const data = Route.useLoaderData();
	const [tournamentResults, setTournamentResults] =
		useState<Record<string, string>>(getBracketResults);

	useEffect(() => {
		const handler = (e: Event) => {
			const customEvent = e as CustomEvent<{
				results: Record<string, string> | null;
			}>;
			if (customEvent.detail.results) {
				setTournamentResults(customEvent.detail.results);
			} else {
				setTournamentResults(getBracketResults());
			}
		};
		window.addEventListener("tournament-results-changed", handler);
		return () =>
			window.removeEventListener("tournament-results-changed", handler);
	}, []);

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
					<a href="/" className="btn btn-primary">
						Make Your Own Picks
					</a>
				</div>
			</div>
			<Bracket
				isInteractive
				predictions={predictions}
				tournamentResults={tournamentResults}
				showPicks
			/>
		</div>
	);
}

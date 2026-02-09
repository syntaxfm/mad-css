import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { Bracket } from "@/components/bracket/Bracket";
import { NotFound } from "@/components/NotFound";
import "@/styles/share-bracket.css";

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
		const { username } = data;
		const { env } = await import("cloudflare:workers");
		const { eq } = await import("drizzle-orm");
		const { createDb } = await import("@/db");
		const schema = await import("@/db/schema");

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

		const bracketStatus = await db
			.select()
			.from(schema.userBracketStatus)
			.where(eq(schema.userBracketStatus.userId, user.id))
			.limit(1);

		const isLocked = bracketStatus[0]?.isLocked ?? false;

		if (!isLocked) {
			return { found: false as const };
		}

		const predictions = await db
			.select({
				gameId: schema.userPrediction.gameId,
				predictedWinnerId: schema.userPrediction.predictedWinnerId,
			})
			.from(schema.userPrediction)
			.where(eq(schema.userPrediction.userId, user.id));

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
	const data = Route.useLoaderData();

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
			<Bracket isInteractive predictions={predictions} showPicks />
		</div>
	);
}

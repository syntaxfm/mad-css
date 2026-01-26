import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";
import { and, eq } from "drizzle-orm";
import { ImageResponse } from "workers-og";
import { players } from "@/data/players";
import { createDb } from "@/db";
import * as schema from "@/db/schema";

export const Route = createFileRoute("/api/og/$username")({
	server: {
		handlers: {
			GET: async ({ params, request }) => {
				const { username } = params;
				const url = new URL(request.url);
				const db = createDb(env.DB);

				// Find user by username
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
					return new Response("User not found", { status: 404 });
				}

				const user = users[0];

				// Check if bracket is locked
				const bracketStatus = await db
					.select()
					.from(schema.userBracketStatus)
					.where(eq(schema.userBracketStatus.userId, users[0].id))
					.limit(1);

				if (!bracketStatus[0]?.isLocked) {
					return new Response("Bracket not locked", { status: 403 });
				}

				// Get champion pick
				const championPick = await db
					.select({
						predictedWinnerId: schema.userPrediction.predictedWinnerId,
					})
					.from(schema.userPrediction)
					.where(
						and(
							eq(schema.userPrediction.userId, users[0].id),
							eq(schema.userPrediction.gameId, "final"),
						),
					)
					.limit(1);

				const championId = championPick[0]?.predictedWinnerId;
				const champion = championId
					? (players.find((p) => p.id === championId) ?? null)
					: null;

				// Build absolute URLs for images
				const baseUrl = `${url.protocol}//${url.host}`;
				const championImageUrl = champion
					? champion.photo.startsWith("http")
						? champion.photo
						: `${baseUrl}${encodeURI(champion.photo)}`
					: null;
				const bgImageUrl = `${baseUrl}/madcss-wide.jpg`;
				const logoUrl = `${baseUrl}/mad-css-logo.png`;

				// Satori-compatible OG image (no linear-gradient, no rgba, no calc)
				const html = `
				<div style="display: flex; width: 1200px; height: 630px; position: relative;">

					<!-- Background image (full bleed) -->
					<img src="${bgImageUrl}" style="position: absolute; top: 0; left: 0; width: 1200px; height: 630px; object-fit: cover;" />

					<!-- Beige outer card (centered, provides contrast against photo bg) -->
					<div style="display: flex; flex-direction: column; align-items: center; position: absolute; top: 40px; left: 200px; width: 800px; height: 550px; background-color: #f5eeda; border: 6px solid #000; padding: 24px;">

						<!-- Header with logo -->
						<div style="display: flex; align-items: center; gap: 16px;">
							<img src="${logoUrl}" style="height: 60px;" />
							<span style="color: #000; font-size: 28px; font-weight: 900; font-family: system-ui; text-transform: uppercase;">2026 Championship</span>
						</div>

						<!-- Inner black card -->
						<div style="display: flex; flex-direction: column; align-items: center; background-color: #000; padding: 24px 60px; border: 5px solid #ffae00; margin-top: 16px;">

							<!-- Champion photo with colored ring -->
							${
								championImageUrl
									? `
							<div style="display: flex; align-items: center; justify-content: center; width: 160px; height: 160px; border-radius: 50%; background-color: #f3370e; border: 5px solid #ffae00;">
								<img src="${championImageUrl}" style="width: 130px; height: 130px; border-radius: 50%; object-fit: cover;" />
							</div>
							`
									: ""
							}

							<!-- Champion Pick label -->
							<span style="color: #ffae00; font-size: 16px; font-weight: 700; font-family: system-ui; text-transform: uppercase; letter-spacing: 3px; margin-top: 16px;">
								Champion Pick
							</span>

							<!-- Champion name -->
							<span style="color: #fff; font-size: 48px; font-weight: 900; font-family: system-ui; margin-top: 4px;">
								${champion?.name ?? "Not Selected"}
							</span>

							<!-- Divider -->
							<div style="display: flex; width: 180px; height: 3px; background-color: #ffae00; margin: 12px 0;"></div>

							<!-- User info -->
							<span style="color: #fff; font-size: 24px; font-weight: 600; font-family: system-ui;">
								@${user.username}'s Bracket
							</span>
						</div>
					</div>
				</div>`;

				const response = new ImageResponse(html, {
					width: 1200,
					height: 630,
				});

				// Add cache headers
				response.headers.set(
					"Cache-Control",
					"public, max-age=3600, s-maxage=86400",
				);

				return response;
			},
		},
	},
});

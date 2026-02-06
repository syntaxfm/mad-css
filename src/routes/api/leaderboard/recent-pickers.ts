import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";
import { desc, eq, inArray } from "drizzle-orm";
import { createDb } from "@/db";
import * as schema from "@/db/schema";
import { bracket, players } from "@/data/players";

const playerMap = new Map(players.map((p) => [p.id, p]));

const r1Opponents = new Map<string, Map<string, string>>();
for (const game of bracket.round1) {
	if (game.player1 && game.player2) {
		const opponents = new Map<string, string>();
		opponents.set(game.player1.id, game.player2.id);
		opponents.set(game.player2.id, game.player1.id);
		r1Opponents.set(game.id, opponents);
	}
}

function roundLabel(gameId: string): string {
	if (gameId === "final") return "win it all";
	if (gameId.startsWith("sf-")) return "win the semis";
	if (gameId.startsWith("qf-")) return "win the quarters";
	return "";
}

export type ActivityItem = {
	key: string;
	pickerName: string;
	pickerImage: string | null;
	pickerUsername: string | null;
	predictedName: string;
	predictedPhoto: string;
	opponentName: string | null;
	opponentPhoto: string | null;
	label: string;
};

export const Route = createFileRoute("/api/leaderboard/recent-pickers")({
	server: {
		handlers: {
			GET: async () => {
				const db = createDb(env.DB);

				const lockedUsers = await db
					.select({
						userId: schema.userBracketStatus.userId,
						userName: schema.user.name,
						userImage: schema.user.image,
						username: schema.user.username,
					})
					.from(schema.userBracketStatus)
					.innerJoin(
						schema.user,
						eq(schema.userBracketStatus.userId, schema.user.id),
					)
					.where(eq(schema.userBracketStatus.isLocked, true))
					.orderBy(desc(schema.userBracketStatus.lockedAt))
					.limit(40);

				if (lockedUsers.length === 0) {
					return new Response(JSON.stringify({ activity: [] }), {
						status: 200,
						headers: { "Content-Type": "application/json" },
					});
				}

				const userIds = lockedUsers.map((u) => u.userId);
				const allPredictions = await db
					.select({
						userId: schema.userPrediction.userId,
						gameId: schema.userPrediction.gameId,
						predictedWinnerId: schema.userPrediction.predictedWinnerId,
					})
					.from(schema.userPrediction)
					.where(inArray(schema.userPrediction.userId, userIds));

				const predictionsByUser = new Map<
					string,
					{ gameId: string; predictedWinnerId: string }[]
				>();
				for (const p of allPredictions) {
					const list = predictionsByUser.get(p.userId) || [];
					list.push({
						gameId: p.gameId,
						predictedWinnerId: p.predictedWinnerId,
					});
					predictionsByUser.set(p.userId, list);
				}

				const items: ActivityItem[] = [];

				for (const user of lockedUsers) {
					const predictions = predictionsByUser.get(user.userId) || [];
					if (predictions.length === 0) continue;

					const shuffled = [...predictions];
					for (let i = shuffled.length - 1; i > 0; i--) {
						const j = Math.floor(Math.random() * (i + 1));
						[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
					}

					for (const pred of shuffled.slice(0, 10)) {
						const predicted = playerMap.get(pred.predictedWinnerId);
						if (!predicted) continue;

						let opponentName: string | null = null;
						let opponentPhoto: string | null = null;
						const gameOpponents = r1Opponents.get(pred.gameId);
						if (gameOpponents) {
							const oppId = gameOpponents.get(pred.predictedWinnerId);
							const opp = oppId ? playerMap.get(oppId) : undefined;
							if (opp) {
								opponentName = opp.name;
								opponentPhoto = `/avatars/color/${opp.id}.png`;
							}
						}

						items.push({
							key: `${user.username ?? user.userName}-${pred.gameId}`,
							pickerName: user.userName,
							pickerImage: user.userImage,
							pickerUsername: user.username,
							predictedName: predicted.name,
							predictedPhoto: `/avatars/color/${predicted.id}.png`,
							opponentName,
							opponentPhoto,
							label: gameOpponents ? "" : roundLabel(pred.gameId),
						});
					}
				}

				for (let i = items.length - 1; i > 0; i--) {
					const j = Math.floor(Math.random() * (i + 1));
					[items[i], items[j]] = [items[j], items[i]];
				}

				return new Response(JSON.stringify({ activity: items }), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				});
			},
		},
	},
});

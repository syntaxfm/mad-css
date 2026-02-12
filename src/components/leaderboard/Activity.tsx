import { useQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import "./activity.css";

type ActivityItem = {
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

const getRecentPickers = createServerFn({ method: "GET" }).handler(async () => {
	const { env } = await import("cloudflare:workers");
	const { createDb } = await import("@/db");
	const { desc, eq } = await import("drizzle-orm");
	const schema = await import("@/db/schema");
	const { bracket, players } = await import("@/data/players");

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

	const db = createDb(env.DB);

	// Get recent predictions with user info
	const recentPredictions = await db
		.select({
			userId: schema.userPrediction.userId,
			gameId: schema.userPrediction.gameId,
			predictedWinnerId: schema.userPrediction.predictedWinnerId,
			userName: schema.user.name,
			userImage: schema.user.image,
			username: schema.user.username,
		})
		.from(schema.userPrediction)
		.innerJoin(schema.user, eq(schema.userPrediction.userId, schema.user.id))
		.orderBy(desc(schema.userPrediction.updatedAt))
		.limit(400);

	if (recentPredictions.length === 0) {
		return [];
	}

	// Group predictions by user
	const userMap = new Map<
		string,
		{
			userId: string;
			userName: string;
			userImage: string | null;
			username: string | null;
		}
	>();
	const predictionsByUser = new Map<
		string,
		{ gameId: string; predictedWinnerId: string }[]
	>();
	for (const p of recentPredictions) {
		if (!userMap.has(p.userId)) {
			userMap.set(p.userId, {
				userId: p.userId,
				userName: p.userName,
				userImage: p.userImage,
				username: p.username,
			});
		}
		const list = predictionsByUser.get(p.userId) || [];
		list.push({
			gameId: p.gameId,
			predictedWinnerId: p.predictedWinnerId,
		});
		predictionsByUser.set(p.userId, list);
	}

	const items: ActivityItem[] = [];

	for (const user of userMap.values()) {
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

	return items;
});

const MAX_VISIBLE = 6;
const TICK_INTERVAL = 2500;

function PickSentence({ item }: { item: ActivityItem }) {
	const inner = (
		<>
			{item.pickerImage && (
				<img src={item.pickerImage} alt="" className="pick-avatar" />
			)}
			<strong className="pick-user-name">{item.pickerName}</strong>
			{" picks "}
			<img src={item.predictedPhoto} alt="" className="pick-avatar" />
			<strong className="pick-player-name">{item.predictedName}</strong>
			{item.opponentName ? (
				<>
					{" to beat "}
					{item.opponentPhoto && (
						<img src={item.opponentPhoto} alt="" className="pick-avatar" />
					)}
					<span className="pick-player-name">{item.opponentName}</span>
				</>
			) : (
				<>{` to ${item.label}`}</>
			)}
		</>
	);

	if (item.pickerUsername) {
		return (
			<a href={`/bracket/${item.pickerUsername}`} className="pick-sentence">
				{inner}
			</a>
		);
	}
	return <span className="pick-sentence">{inner}</span>;
}

export function Activity() {
	const { data } = useQuery({
		queryKey: ["recent-pickers"],
		queryFn: () => getRecentPickers(),
		staleTime: 1000 * 60 * 5,
	});

	const [visible, setVisible] = useState<ActivityItem[]>([]);
	const queueRef = useRef<ActivityItem[]>([]);
	const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

	useEffect(() => {
		if (!data || data.length === 0) return;

		queueRef.current = [...data];

		const initial: ActivityItem[] = [];
		for (let i = 0; i < 3 && queueRef.current.length > 0; i++) {
			const item = queueRef.current.shift()!;
			queueRef.current.push(item);
			initial.push(item);
		}
		setVisible(initial);

		function tick() {
			const queue = queueRef.current;
			const next = queue.shift();
			if (!next) return;
			queue.push(next);

			setVisible((prev) => {
				const updated = [next, ...prev];
				if (updated.length > MAX_VISIBLE) {
					return updated.slice(0, MAX_VISIBLE);
				}
				return updated;
			});
		}

		tickRef.current = setInterval(tick, TICK_INTERVAL);
		return () => {
			if (tickRef.current) clearInterval(tickRef.current);
		};
	}, [data]);

	if (visible.length === 0) return null;

	return (
		<div className="activity">
			<ul className="activity-list">
				{visible.map((item) => (
					<li key={item.key} className="activity-item">
						<PickSentence item={item} />
					</li>
				))}
			</ul>
		</div>
	);
}

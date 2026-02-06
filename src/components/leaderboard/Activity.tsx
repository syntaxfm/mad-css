import { useEffect, useRef, useState } from "react";
import type { ActivityItem } from "@/routes/api/leaderboard/recent-pickers";
import "./activity.css";

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
						<img
							src={item.opponentPhoto}
							alt=""
							className="pick-avatar"
						/>
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
	const [visible, setVisible] = useState<ActivityItem[]>([]);
	const queueRef = useRef<ActivityItem[]>([]);
	const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		fetch("/api/leaderboard/recent-pickers")
			.then((res) => {
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				return res.json() as Promise<{ activity?: ActivityItem[] }>;
			})
			.then((data) => {
				queueRef.current = data.activity || [];
				setLoaded(true);
			})
			.catch(() => {});
	}, []);

	useEffect(() => {
		if (!loaded || queueRef.current.length === 0) return;

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
	}, [loaded]);

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

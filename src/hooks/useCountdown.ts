import { useEffect, useState } from "react";

export type CountdownTime = {
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
	totalMs: number;
};

function getTimeRemaining(deadline: string): CountdownTime {
	const total = new Date(deadline).getTime() - Date.now();
	if (total <= 0) {
		return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 };
	}
	return {
		days: Math.floor(total / (1000 * 60 * 60 * 24)),
		hours: Math.floor((total / (1000 * 60 * 60)) % 24),
		minutes: Math.floor((total / (1000 * 60)) % 60),
		seconds: Math.floor((total / 1000) % 60),
		totalMs: total,
	};
}

export function useCountdown(deadline: string | undefined): CountdownTime {
	const [time, setTime] = useState<CountdownTime>(() =>
		deadline
			? getTimeRemaining(deadline)
			: { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 },
	);

	useEffect(() => {
		if (!deadline) return;
		setTime(getTimeRemaining(deadline));
		const interval = setInterval(() => {
			setTime(getTimeRemaining(deadline));
		}, 1000);
		return () => clearInterval(interval);
	}, [deadline]);

	return time;
}

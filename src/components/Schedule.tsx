import { GAME_LINKS, GAME_SCHEDULE, YOUTUBE_CHANNEL } from "@/data/players";
import "@/styles/ticket.css";

const ROUNDS: {
	key: keyof typeof GAME_SCHEDULE;
	label: string;
	sideText: string;
}[] = [
	{ key: "left-r1", label: "Round 1", sideText: "LEFT BRACKET" },
	{ key: "right-r1", label: "Round 1", sideText: "RIGHT BRACKET" },
	{ key: "qf", label: "Quarter Finals", sideText: "ELITE EIGHT" },
	{ key: "sf", label: "Semi Finals", sideText: "FINAL FOUR" },
	{ key: "final", label: "The Final", sideText: "CHAMPIONSHIP" },
];

const GAME_IDS_FOR_ROUND: Record<keyof typeof GAME_SCHEDULE, string[]> = {
	"left-r1": ["r1-0", "r1-1", "r1-2", "r1-3"],
	"right-r1": ["r1-4", "r1-5", "r1-6", "r1-7"],
	qf: ["qf-0", "qf-1", "qf-2", "qf-3"],
	sf: ["sf-0", "sf-1"],
	final: ["final"],
};

function getVideoUrlForRound(roundKey: keyof typeof GAME_SCHEDULE): string {
	const gameIds = GAME_IDS_FOR_ROUND[roundKey];
	for (const id of gameIds) {
		const videoId = GAME_LINKS[id];
		if (videoId) return `https://www.youtube.com/watch?v=${videoId}`;
	}
	return YOUTUBE_CHANNEL;
}

function formatDate(isoDate: string): { month: string; day: string } {
	const d = new Date(isoDate);
	return {
		month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
		day: d.toLocaleDateString("en-US", { day: "numeric" }),
	};
}

function YouTubeIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="currentColor"
			width="14"
			height="14"
			aria-hidden="true"
		>
			<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
		</svg>
	);
}

function DrinkTicket({
	label,
	sideText,
	isoDate,
	url,
	isPast,
}: {
	label: string;
	sideText: string;
	isoDate: string;
	url: string;
	isPast: boolean;
}) {
	const { month, day } = formatDate(isoDate);
	return (
		<a
			href={url}
			target="_blank"
			rel="noopener noreferrer"
			className={`drink-ticket ${isPast ? "past" : ""}`}
		>
			<span className="side left">{sideText}</span>
			<div className="inner">
				<span className="label">{label}</span>
				<span className="date">
					<YouTubeIcon />
					{month} {day}
				</span>
				{isPast && <span className="watch">▶ WATCH</span>}
			</div>
			<span className="side right">{sideText}</span>
		</a>
	);
}

function EmptyTicket() {
	return (
		<div className="drink-ticket empty">
			<span className="side left">MAD CSS</span>
			<div className="inner" />
			<span className="side right">MAD CSS</span>
		</div>
	);
}

export function Schedule() {
	return (
		<div id="schedule" className="drink-tickets-wrapper">
			<div className="drink-tickets">
				{["v", "w", "x", "y", "z"].map((id) => (
					<EmptyTicket key={id} />
				))}
				{ROUNDS.map(({ key, label, sideText }) => {
					const isoDate = GAME_SCHEDULE[key];
					const isPast = new Date(isoDate).getTime() < Date.now();
					const url = isPast ? getVideoUrlForRound(key) : YOUTUBE_CHANNEL;
					return (
						<DrinkTicket
							key={key}
							label={label}
							sideText={sideText}
							isoDate={isoDate}
							url={url}
							isPast={isPast}
						/>
					);
				})}
				{["a", "b", "c", "d", "e"].map((id) => (
					<EmptyTicket key={id} />
				))}
			</div>
		</div>
	);
}

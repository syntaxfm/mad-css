import { usePredictionsContext } from "@/context/PredictionsContext";
import { getNextGameTime } from "@/data/players";
import { useCountdown } from "@/hooks/useCountdown";
import { authClient } from "@/lib/auth-client";
import { Scoreboard } from "./scoreboard/Scoreboard";
import "@/styles/login.css";

const ROUND_LABELS: Record<string, string> = {
	"left-r1": "Left R1",
	"right-r1": "Right R1",
	qf: "Quarterfinals",
	sf: "Semifinals",
	final: "Finals",
};

// Sub-component: Share buttons (copy link, X, Bluesky)
export function LoginSectionShare({
	twitterShareUrl,
	blueskyShareUrl,
	copied,
	onCopyLink,
}: {
	twitterShareUrl: string | null;
	blueskyShareUrl: string | null;
	copied: boolean;
	onCopyLink: () => Promise<void>;
}) {
	return (
		<div className="cta-share">
			<div className="cta-share-label">
				<svg
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
				>
					<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
					<polyline points="16 6 12 2 8 6" />
					<line x1="12" x2="12" y1="2" y2="15" />
				</svg>
				Share your bracket
			</div>
			<div className="cta-share-actions">
				<button
					type="button"
					className={`btn btn-sm btn-share btn-share--copy${copied ? " copied" : ""}`}
					onClick={onCopyLink}
				>
					<svg
						className="share-icon"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
					>
						{copied ? (
							<path d="M20 6 9 17l-5-5" />
						) : (
							<>
								<rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
								<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
							</>
						)}
					</svg>
				</button>
				{twitterShareUrl && (
					<a
						href={twitterShareUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="btn btn-dark btn-sm btn-share btn-share--twitter"
					>
						<svg
							className="share-icon"
							viewBox="0 0 24 24"
							fill="currentColor"
							aria-hidden="true"
						>
							<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
						</svg>
						<span className="sr-only">Share on X</span>
					</a>
				)}
				{blueskyShareUrl && (
					<a
						href={blueskyShareUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="btn btn-sm btn-share btn-share--bluesky"
					>
						<svg
							className="share-icon"
							viewBox="0 0 600 530"
							fill="currentColor"
							aria-hidden="true"
						>
							<path d="m135.72 44.03c66.496 49.921 138.02 151.14 164.28 205.46 26.262-54.316 97.782-155.54 164.28-205.46 47.98-36.021 125.72-63.892 125.72 24.795 0 17.712-10.155 148.79-16.111 170.07-20.703 73.984-96.144 92.854-163.25 81.433 117.3 19.964 147.14 86.092 82.697 152.22-122.39 125.59-175.91-31.511-189.63-71.766-2.514-7.3797-3.6904-10.832-3.7077-7.8964-0.0174-2.9357-1.1937 0.51669-3.7077 7.8964-13.714 40.255-67.233 197.36-189.63 71.766-64.444-66.128-34.605-132.26 82.697-152.22-67.108 11.421-142.55-7.4491-163.25-81.433-5.9562-21.282-16.111-152.36-16.111-170.07 0-88.687 77.742-60.816 125.72-24.795z" />
						</svg>
						<span className="sr-only">Share on Bluesky</span>
					</a>
				)}
			</div>
		</div>
	);
}

export function LoginSection() {
	const ctx = usePredictionsContext();

	const error = ctx?.error ?? null;
	const deadline = ctx?.deadline;
	const isDeadlinePassed = ctx?.isDeadlinePassed ?? false;
	const { data: session, isPending } = authClient.useSession();
	const countdown = useCountdown(deadline);
	const isUrgent =
		countdown.totalMs > 0 && countdown.totalMs < 24 * 60 * 60 * 1000;

	// Next game countdown
	const nextGame = getNextGameTime();
	const nextGameCountdown = useCountdown(nextGame?.time);
	const nextGameLabel = nextGame ? ROUND_LABELS[nextGame.round] : null;

	if (isPending) {
		return (
			<div className="bracket-cta">
				<span className="login-loading">Loading...</span>
			</div>
		);
	}

	if (session?.user) {
		if (!isDeadlinePassed && !error) return null;

		return (
			<div className="bracket-cta logged-in">
				{isDeadlinePassed && (
					<div className="cta-status deadline-passed">Deadline has passed</div>
				)}
				{error && <p className="cta-error">{error}</p>}
			</div>
		);
	}

	// Logged out state
	return (
		<div className="bracket-cta">
			<p className="cta-headline font_block">Think you can call it?</p>
			<p className="cta-sub">
				Make your predictions before <strong>March 6</strong> for a chance to
				win some amazing prizes!
			</p>
			{deadline && countdown.totalMs > 0 ? (
				<Scoreboard countdown={countdown} isUrgent={isUrgent} />
			) : (
				nextGame &&
				nextGameCountdown.totalMs > 0 && (
					<div className="cta-next-results">
						<span className="next-results-label">
							{nextGameLabel} results in:
						</span>
						<Scoreboard countdown={nextGameCountdown} isUrgent={false} />
					</div>
				)
			)}
			<button
				type="button"
				className="btn btn-danger btn-lg"
				onClick={() =>
					authClient.signIn.social({
						provider: "github",
						callbackURL: "/test",
					})
				}
			>
				<svg viewBox="0 0 24 24" aria-hidden="true" className="github-icon">
					<path
						fill="currentColor"
						d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
					/>
				</svg>
				Sign in to Play
			</button>
		</div>
	);
}

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
	mastodonShareUrl,
	copied,
	onCopyLink,
}: {
	twitterShareUrl: string | null;
	blueskyShareUrl: string | null;
	mastodonShareUrl: string | null;
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
				{mastodonShareUrl && (
					<a
						href={mastodonShareUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="btn btn-sm btn-share btn-share--mastodon"
					>
						<svg role="img" aria-label="Mastodon" height="1em" viewBox="0 0 74 79" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M73.7014 17.4323C72.5616 9.05152 65.1774 2.4469 56.424 1.1671C54.9472 0.950843 49.3518 0.163818 36.3901 0.163818H36.2933C23.3281 0.163818 20.5465 0.950843 19.0697 1.1671C10.56 2.41145 2.78877 8.34604 0.903306 16.826C-0.00357854 21.0022 -0.100361 25.6322 0.068112 29.8793C0.308275 35.9699 0.354874 42.0498 0.91406 48.1156C1.30064 52.1448 1.97502 56.1419 2.93215 60.0769C4.72441 67.3445 11.9795 73.3925 19.0876 75.86C26.6979 78.4332 34.8821 78.8603 42.724 77.0937C43.5866 76.8952 44.4398 76.6647 45.2833 76.4024C47.1867 75.8033 49.4199 75.1332 51.0616 73.9562C51.0841 73.9397 51.1026 73.9184 51.1156 73.8938C51.1286 73.8693 51.1359 73.8421 51.1368 73.8144V67.9366C51.1364 67.9107 51.1302 67.8852 51.1186 67.862C51.1069 67.8388 51.0902 67.8184 51.0695 67.8025C51.0489 67.7865 51.0249 67.7753 50.9994 67.7696C50.9738 67.764 50.9473 67.7641 50.9218 67.7699C45.8976 68.9569 40.7491 69.5519 35.5836 69.5425C26.694 69.5425 24.3031 65.3699 23.6184 63.6327C23.0681 62.1314 22.7186 60.5654 22.5789 58.9744C22.5775 58.9477 22.5825 58.921 22.5934 58.8965C22.6043 58.8721 22.621 58.8505 22.6419 58.8336C22.6629 58.8167 22.6876 58.8049 22.714 58.7992C22.7404 58.7934 22.7678 58.794 22.794 58.8007C27.7345 59.9796 32.799 60.5746 37.8813 60.5733C39.1036 60.5733 40.3223 60.5733 41.5447 60.5414C46.6562 60.3996 52.0437 60.1408 57.0728 59.1694C57.1983 59.1446 57.3237 59.1233 57.4313 59.0914C65.3638 57.5847 72.9128 52.8555 73.6799 40.8799C73.7086 40.4084 73.7803 35.9415 73.7803 35.4523C73.7839 33.7896 74.3216 23.6576 73.7014 17.4323ZM61.4925 47.3144H53.1514V27.107C53.1514 22.8528 51.3591 20.6832 47.7136 20.6832C43.7061 20.6832 41.6988 23.2499 41.6988 28.3194V39.3803H33.4078V28.3194C33.4078 23.2499 31.3969 20.6832 27.3894 20.6832C23.7654 20.6832 21.9552 22.8528 21.9516 27.107V47.3144H13.6176V26.4937C13.6176 22.2395 14.7157 18.8598 16.9118 16.3545C19.1772 13.8552 22.1488 12.5719 25.8373 12.5719C30.1064 12.5719 33.3325 14.1955 35.4832 17.4394L37.5587 20.8853L39.6377 17.4394C41.7884 14.1955 45.0145 12.5719 49.2765 12.5719C52.9614 12.5719 55.9329 13.8552 58.2055 16.3545C60.4017 18.8574 61.4997 22.2371 61.4997 26.4937L61.4925 47.3144Z" fill="inherit"/></svg>
						<span className="sr-only">Share on Mastodon</span>
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
				win some <a href="#prizes">amazing prizes!</a>
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
						callbackURL: "/",
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

import { useState } from "react";
import { getNextGameTime, TOTAL_GAMES } from "@/data/players";
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

export interface LoginSectionProps {
	pickCount?: number;
	isLocked?: boolean;
	isSaving?: boolean;
	hasChanges?: boolean;
	error?: string | null;
	deadline?: string;
	isDeadlinePassed?: boolean;
	username?: string | null;
	onSave?: () => void;
	onLock?: () => void;
	onReset?: () => void;
	showPicks?: boolean;
	onToggleShowPicks?: () => void;
}

export function LoginSection({
	pickCount = 0,
	isLocked = false,
	isSaving = false,
	hasChanges = false,
	error = null,
	deadline,
	isDeadlinePassed = false,
	username = null,
	onSave,
	onLock,
	onReset,
	showPicks = false,
	onToggleShowPicks,
}: LoginSectionProps) {
	const { data: session, isPending } = authClient.useSession();
	const [showLockConfirm, setShowLockConfirm] = useState(false);
	const [copied, setCopied] = useState(false);
	const countdown = useCountdown(deadline);
	const isUrgent =
		countdown.totalMs > 0 && countdown.totalMs < 24 * 60 * 60 * 1000;

	// Next game countdown
	const nextGame = getNextGameTime();
	const nextGameCountdown = useCountdown(nextGame?.time);
	const nextGameLabel = nextGame ? ROUND_LABELS[nextGame.round] : null;

	const shareUrl = username
		? `${typeof window !== "undefined" ? window.location.origin : ""}/bracket/${username}`
		: null;

	const handleCopyLink = async () => {
		if (!shareUrl) return;
		try {
			await navigator.clipboard.writeText(shareUrl);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// Fallback for older browsers
			const input = document.createElement("input");
			input.value = shareUrl;
			document.body.appendChild(input);
			input.select();
			document.execCommand("copy");
			document.body.removeChild(input);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	const twitterShareUrl = username
		? `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out my March Mad CSS bracket picks! \ud83c\udfc0\n\n${shareUrl}`)}`
		: null;

	const blueskyShareUrl = username
		? `https://bsky.app/intent/compose?text=${encodeURIComponent(`Check out my March Mad CSS bracket picks! \ud83c\udfc0\n\n${shareUrl}`)}`
		: null;

	if (isPending) {
		return (
			<div className="bracket-cta">
				<span className="login-loading">Loading...</span>
			</div>
		);
	}

	if (session?.user) {
		const canLock = pickCount === TOTAL_GAMES && !isLocked && !isDeadlinePassed;

		return (
			<div className="bracket-cta logged-in">
				{/* Header: Avatar + Name + Sign Out */}
				<div className="cta-header">
					<img
						src={session.user.image || "/default-avatar.png"}
						alt=""
						className="user-avatar"
					/>
					<p className="cta-welcome">
						Welcome back, <strong>{session.user.name}</strong>
					</p>
					<button
						type="button"
						className="btn-signout"
						onClick={() => {
							sessionStorage.removeItem("bracket-scrolled");
							authClient.signOut();
						}}
					>
						Sign out
					</button>
				</div>

				{/* Status badges for locked/deadline states */}
				{isLocked && (
					<>
						<div className="cta-status locked">
							✓ Your bracket is locked in!
						</div>

						{/* Next results countdown */}
						{nextGame && nextGameCountdown.totalMs > 0 && (
							<div className="cta-next-results">
								<span className="next-results-label">
									{nextGameLabel} results in:
								</span>
								<Scoreboard countdown={nextGameCountdown} isUrgent={false} />
							</div>
						)}

						{/* Toggle to show picks vs results */}
						{onToggleShowPicks && (
							<button
								type="button"
								className={`btn-toggle-picks${!showPicks ? " active" : ""}`}
								onClick={onToggleShowPicks}
							>
								{showPicks ? "Hide My Picks" : "Show My Picks"}
							</button>
						)}

						{/* Share section - only show when locked and username exists */}
						{shareUrl && (
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
										className={`btn-share btn-share--copy${copied ? " copied" : ""}`}
										onClick={handleCopyLink}
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
													<rect
														width="14"
														height="14"
														x="8"
														y="8"
														rx="2"
														ry="2"
													/>
													<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
												</>
											)}
										</svg>
										{copied ? "Copied!" : "Copy Link"}
									</button>
									{twitterShareUrl && (
										<a
											href={twitterShareUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="btn-share btn-share--twitter"
										>
											<svg
												className="share-icon"
												viewBox="0 0 24 24"
												fill="currentColor"
												aria-hidden="true"
											>
												<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
											</svg>
											Share on X
										</a>
									)}
									{blueskyShareUrl && (
										<a
											href={blueskyShareUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="btn-share btn-share--bluesky"
										>
											<svg
												className="share-icon"
												viewBox="0 0 600 530"
												fill="currentColor"
												aria-hidden="true"
											>
												<path d="m135.72 44.03c66.496 49.921 138.02 151.14 164.28 205.46 26.262-54.316 97.782-155.54 164.28-205.46 47.98-36.021 125.72-63.892 125.72 24.795 0 17.712-10.155 148.79-16.111 170.07-20.703 73.984-96.144 92.854-163.25 81.433 117.3 19.964 147.14 86.092 82.697 152.22-122.39 125.59-175.91-31.511-189.63-71.766-2.514-7.3797-3.6904-10.832-3.7077-7.8964-0.0174-2.9357-1.1937 0.51669-3.7077 7.8964-13.714 40.255-67.233 197.36-189.63 71.766-64.444-66.128-34.605-132.26 82.697-152.22-67.108 11.421-142.55-7.4491-163.25-81.433-5.9562-21.282-16.111-152.36-16.111-170.07 0-88.687 77.742-60.816 125.72-24.795z" />
											</svg>
											Bluesky
										</a>
									)}
								</div>
							</div>
						)}
					</>
				)}

				{isDeadlinePassed && !isLocked && (
					<div className="cta-status deadline-passed">Deadline has passed</div>
				)}

				{/* Progress section - only show when not locked */}
				{!isLocked && !isDeadlinePassed && (
					<>
						<div className="cta-progress">
							<div className="progress-header">
								<div className="progress-count">
									{pickCount} <span>/ {TOTAL_GAMES} picks</span>
								</div>
								{deadline && countdown.totalMs > 0 && (
									<Scoreboard countdown={countdown} isUrgent={isUrgent} />
								)}
							</div>
						</div>

						{/* Instructions */}
						<div className="cta-instructions">
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
								<circle cx="12" cy="12" r="10" />
								<path d="m9 12 2 2 4-4" />
							</svg>
							<span>
								Click any player to pick them as the winner of that match
							</span>
						</div>

						{/* Actions */}
						<div className="cta-actions">
							{showLockConfirm ? (
								<div className="lock-confirm">
									<p>Lock your bracket? This cannot be undone.</p>
									<div className="lock-confirm-buttons">
										<button
											type="button"
											className="btn-lock-confirm"
											onClick={() => {
												onLock?.();
												setShowLockConfirm(false);
											}}
											disabled={!canLock || isSaving}
										>
											Yes, Lock It
										</button>
										<button
											type="button"
											className="btn-cancel"
											onClick={() => setShowLockConfirm(false)}
										>
											Cancel
										</button>
									</div>
								</div>
							) : (
								<>
									<button
										type="button"
										className="btn-save"
										onClick={onSave}
										disabled={isSaving || !hasChanges}
									>
										{isSaving ? "Saving..." : "Save"}
									</button>
									<button
										type="button"
										className="btn-lock"
										onClick={() => setShowLockConfirm(true)}
										disabled={!canLock || isSaving}
										title={
											pickCount < TOTAL_GAMES
												? `Need all ${TOTAL_GAMES} picks to lock`
												: "Lock your bracket"
										}
									>
										Lock Bracket
									</button>
									{pickCount > 0 && (
										<button
											type="button"
											className="btn-reset"
											onClick={onReset}
											disabled={isSaving}
											title="Reset all picks"
										>
											Reset
										</button>
									)}
								</>
							)}
						</div>
					</>
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
				Lock in your predictions before <strong>Round 1</strong> and compete for
				mass internet clout. Perfect bracket = mass internet clout.
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
				className="btn-github"
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

import { useEffect, useState } from "react";
import { TOTAL_GAMES } from "@/data/players";
import { authClient } from "@/lib/auth-client";
import "@/styles/login.css";

export interface LoginSectionProps {
	pickCount?: number;
	isLocked?: boolean;
	isSaving?: boolean;
	hasChanges?: boolean;
	error?: string | null;
	deadline?: string;
	isDeadlinePassed?: boolean;
	onSave?: () => void;
	onLock?: () => void;
	onReset?: () => void;
}

type CountdownTime = {
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

function useCountdown(deadline: string | undefined): CountdownTime {
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

function CountdownUnit({
	value,
	suffix,
	pad = true,
}: {
	value: number;
	suffix: string;
	pad?: boolean;
}) {
	const displayValue = pad ? String(value).padStart(2, "0") : String(value);
	return (
		<span className="countdown-unit">
			<span className="countdown-value">{displayValue}</span>
			<span className="countdown-suffix">{suffix}</span>
		</span>
	);
}

export function LoginSection({
	pickCount = 0,
	isLocked = false,
	isSaving = false,
	hasChanges = false,
	error = null,
	deadline,
	isDeadlinePassed = false,
	onSave,
	onLock,
	onReset,
}: LoginSectionProps) {
	const { data: session, isPending } = authClient.useSession();
	const [showLockConfirm, setShowLockConfirm] = useState(false);
	const countdown = useCountdown(deadline);
	const isUrgent =
		countdown.totalMs > 0 && countdown.totalMs < 24 * 60 * 60 * 1000;

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
						onClick={() => authClient.signOut()}
					>
						Sign out
					</button>
				</div>

				{/* Status badges for locked/deadline states */}
				{isLocked && (
					<div className="cta-status locked">✓ Your bracket is locked in!</div>
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
									<div
										className={`countdown ${isUrgent ? "countdown--urgent" : ""}`}
									>
										<span className="countdown-label">Lock in</span>
										<div className="countdown-timer">
											{countdown.days > 0 && (
												<CountdownUnit
													value={countdown.days}
													suffix="d"
													pad={false}
												/>
											)}
											<CountdownUnit value={countdown.hours} suffix="h" />
											<CountdownUnit value={countdown.minutes} suffix="m" />
											<CountdownUnit value={countdown.seconds} suffix="s" />
										</div>
									</div>
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
			{deadline && countdown.totalMs > 0 && (
				<div className={`countdown ${isUrgent ? "countdown--urgent" : ""}`}>
					<span className="countdown-label">Lock in</span>
					<div className="countdown-timer">
						{countdown.days > 0 && (
							<CountdownUnit value={countdown.days} suffix="d" pad={false} />
						)}
						<CountdownUnit value={countdown.hours} suffix="h" />
						<CountdownUnit value={countdown.minutes} suffix="m" />
						<CountdownUnit value={countdown.seconds} suffix="s" />
					</div>
				</div>
			)}
			<button
				type="button"
				className="btn-github"
				onClick={() => authClient.signIn.social({ provider: "github" })}
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

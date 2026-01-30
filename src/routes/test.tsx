import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bracket } from "@/components/bracket/Bracket";
import { LoginSection } from "@/components/LoginSection";
import { Leaderboard } from "@/components/leaderboard/Leaderboard";
import { Roster } from "@/components/roster/Roster";
import { Rules } from "@/components/rules/Rules";
import { Ticket } from "@/components/Ticket";
import { getResultsFromBracket } from "@/data/players";
import { usePredictions } from "@/hooks/usePredictions";
import { authClient } from "@/lib/auth-client";

// Initialize tournament results from bracket data (single source of truth)
function getBracketResults(): Record<string, string> {
	const results: Record<string, string> = {};
	for (const r of getResultsFromBracket()) {
		results[r.gameId] = r.winnerId;
	}
	return results;
}

export const Route = createFileRoute("/test")({ component: TestPage });

function TestPage() {
	const { data: session } = authClient.useSession();
	const isAuthenticated = !!session?.user;
	const [tournamentResults, setTournamentResults] =
		useState<Record<string, string>>(getBracketResults);
	const [showPicks, setShowPicks] = useState(true);

	// Listen for simulation overrides (temporary, memory-only)
	useEffect(() => {
		const handler = (e: Event) => {
			const customEvent = e as CustomEvent<{
				results: Record<string, string> | null;
			}>;
			if (customEvent.detail.results) {
				// Simulation override
				setTournamentResults(customEvent.detail.results);
			} else {
				// Reset to bracket data
				setTournamentResults(getBracketResults());
			}
		};
		window.addEventListener("tournament-results-changed", handler);
		return () =>
			window.removeEventListener("tournament-results-changed", handler);
	}, []);

	const {
		predictions,
		isLocked,
		isSaving,
		error,
		pickCount,
		deadline,
		isDeadlinePassed,
		hasChanges,
		setPrediction,
		savePredictions,
		lockBracket,
		resetPredictions,
	} = usePredictions(isAuthenticated);

	// Auto-scroll to bracket after fresh OAuth login (only once per session)
	useEffect(() => {
		const hasScrolled = sessionStorage.getItem("bracket-scrolled");
		if (isAuthenticated && !hasScrolled) {
			sessionStorage.setItem("bracket-scrolled", "true");
			// Small delay to let bracket render first
			setTimeout(() => {
				document
					.getElementById("bracket")
					?.scrollIntoView({ behavior: "smooth" });
			}, 100);
		}
	}, [isAuthenticated]);

	return (
		<div>
			<Ticket />
			<div className="section">
				<div className="section-content">
					<Roster />
				</div>
			</div>
			<div id="bracket" className="section">
				<h2>The Bracket</h2>
				<LoginSection
					pickCount={pickCount}
					isLocked={isLocked}
					isSaving={isSaving}
					hasChanges={hasChanges}
					error={error}
					deadline={deadline}
					isDeadlinePassed={isDeadlinePassed}
					username={(session?.user as { username?: string })?.username}
					onSave={savePredictions}
					onLock={lockBracket}
					onReset={resetPredictions}
					showPicks={showPicks}
					onToggleShowPicks={() => setShowPicks(!showPicks)}
				/>
				<Bracket
					isInteractive
					predictions={predictions}
					onPick={setPrediction}
					isLocked={isLocked}
					isAuthenticated={isAuthenticated}
					tournamentResults={tournamentResults}
					showPicks={showPicks}
				/>
			</div>
			<Leaderboard />
			<Rules />
		</div>
	);
}

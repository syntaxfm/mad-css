import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bracket } from "@/components/bracket/Bracket";
import { LoginSection } from "@/components/LoginSection";
import { Leaderboard } from "@/components/leaderboard/Leaderboard";
import { Roster } from "@/components/roster/Roster";
import { Rules } from "@/components/rules/Rules";
import { Ticket } from "@/components/Ticket";
import { PredictionsProvider } from "@/context/PredictionsContext";
import { getResultsFromBracket } from "@/data/players";
import { authClient } from "@/lib/auth-client";

// Initialize tournament results from bracket data (single source of truth)
function getBracketResults(): Record<string, string> {
	const results: Record<string, string> = {};
	for (const r of getResultsFromBracket()) {
		results[r.gameId] = r.winnerId;
	}
	return results;
}

export const Route = createFileRoute("/test")({
	component: TestPage,
});

function TestPage() {
	const { data: session } = authClient.useSession();
	const isAuthenticated = !!session?.user;
	const userId = session?.user?.id;
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
			<PredictionsProvider isAuthenticated={isAuthenticated} userId={userId}>
				<div id="bracket" className="section">
					<h2>The Bracket</h2>
					<LoginSection
						username={(session?.user as { username?: string })?.username}
						showPicks={showPicks}
						onToggleShowPicks={() => setShowPicks(!showPicks)}
					/>
					<Bracket
						isInteractive
						isAuthenticated={isAuthenticated}
						tournamentResults={tournamentResults}
						showPicks={showPicks}
						onToggleShowPicks={() => setShowPicks(!showPicks)}
					/>
				</div>
			</PredictionsProvider>
			<Leaderboard />
			<Rules />
		</div>
	);
}

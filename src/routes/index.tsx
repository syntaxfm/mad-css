import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bracket } from "@/components/bracket/Bracket";
import { LoginSection } from "@/components/LoginSection";
import { Activity } from "@/components/leaderboard/Activity";
import { Leaderboard } from "@/components/leaderboard/Leaderboard";
import { Merch } from "@/components/merch/Merch";
import { Prizes } from "@/components/prizes/Prizes";
import { Roster } from "@/components/roster/Roster";
import { Rules } from "@/components/rules/Rules";
import { Ticket } from "@/components/Ticket";
import { PredictionsProvider } from "@/context/PredictionsContext";
import { getResultsFromBracket } from "@/data/players";
import { authClient } from "@/lib/auth-client";

function getBracketResults(): Record<string, string> {
	const results: Record<string, string> = {};
	for (const r of getResultsFromBracket()) {
		results[r.gameId] = r.winnerId;
	}
	return results;
}

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	const { data: session } = authClient.useSession();
	const isAuthenticated = !!session?.user;
	const userId = session?.user?.id;
	const [tournamentResults, setTournamentResults] =
		useState<Record<string, string>>(getBracketResults);
	const [showPicks, setShowPicks] = useState(true);

	useEffect(() => {
		const handler = (e: Event) => {
			const customEvent = e as CustomEvent<{
				results: Record<string, string> | null;
			}>;
			if (customEvent.detail.results) {
				setTournamentResults(customEvent.detail.results);
			} else {
				setTournamentResults(getBracketResults());
			}
		};
		window.addEventListener("tournament-results-changed", handler);
		return () =>
			window.removeEventListener("tournament-results-changed", handler);
	}, []);

	useEffect(() => {
		const hasScrolled = sessionStorage.getItem("bracket-scrolled");
		if (isAuthenticated && !hasScrolled) {
			sessionStorage.setItem("bracket-scrolled", "true");
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
			<div id="roster" className="section">
				<div className="section-content">
					<Roster />
				</div>
			</div>
			<Activity />
			<PredictionsProvider isAuthenticated={isAuthenticated} userId={userId}>
				<div id="bracket" className="section">
					<h2>The Bracket</h2>
					<LoginSection />
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
			<Prizes />
			<Merch />
			<Rules />
		</div>
	);
}

import { createFileRoute } from "@tanstack/react-router";
import { Bracket } from "@/components/bracket/Bracket";
import { Roster } from "@/components/roster/Roster";
import { Rules } from "@/components/rules/Rules";
import { Ticket } from "@/components/Ticket";

export const Route = createFileRoute("/")({ component: App });

function App() {
	return (
		<div>
			<Ticket />
			<div className="section">
				<div className="section-content" style={{ "--max-width": "1500px", paddingInline: 0 }}>
					<Roster />
				</div>
			</div>
			<div className="section" style={{ paddingInline: 0 }}>
				<h2>The Bracket</h2>
				<Bracket />
			</div>
			<Rules />
		</div>
	);
}

import { createFileRoute} from "@tanstack/react-router";
import { Bracket } from "@/components/bracket/Bracket";
// import { LoginSection } from "@/components/LoginSection";
import { Roster } from "@/components/roster/Roster";
import { Rules } from "@/components/rules/Rules";
import { Ticket } from "@/components/Ticket";

export const Route = createFileRoute("/")({ component: App });

function App() {

	return (
		<div>
			<Ticket />
			<div className="section">
				<div className="section-content">
					<Roster />
				</div>
			</div>
			<div className="section">
				<h2>The Bracket</h2>
				{/* <ClientOnly fallback={null}>
					<LoginSection />
				</ClientOnly> */}
				<Bracket />
			</div>
			<Rules />
			{/* <Bracket /> */}
			{/* <SimpleBracket /> */}
		</div>
	);
}

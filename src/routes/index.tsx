import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { Bracket } from "@/components/bracket/Bracket";
import { SimpleBracket } from "@/components/bracket/SimpleBracket";
import { LoginSection } from "@/components/LoginSection";
import { Roster } from "@/components/roster/Roster";
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
				<ClientOnly fallback={null}>
					<LoginSection />
				</ClientOnly>
				<Bracket />
			</div>
			<section className="section rules">
				<div className="section-content">
					<h2>The Rules</h2>

					<p>
						Welcome to Mad CSS — the ultimate showdown of styling supremacy. Two
						competitors enter, one champion emerges. This ain't your grandma's
						CSS tutorial. This is war.
					</p>

        <h2>The Rules</h2>
        <p className="center">
          The rules are coming
        </p>
        </div>
      </section>
      {/* <Bracket /> */}
      {/* <SimpleBracket /> */}

    </div>
  )
}

import { createFileRoute } from "@tanstack/react-router";
import { Bracket } from "@/components/bracket/Bracket";
import { LoginSection } from "@/components/LoginSection";
import { Roster } from "@/components/roster/Roster";
import { Rules } from "@/components/rules/Rules";
import { Ticket } from "@/components/Ticket";
import { usePredictions } from "@/hooks/usePredictions";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/test")({ component: TestPage });

function TestPage() {
	const { data: session } = authClient.useSession();
	const isAuthenticated = !!session?.user;

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
					onSave={savePredictions}
					onLock={lockBracket}
					onReset={resetPredictions}
				/>
				<Bracket
					isInteractive
					predictions={predictions}
					onPick={setPrediction}
					isLocked={isLocked}
					isAuthenticated={isAuthenticated}
				/>
			</div>
			<Rules />
		</div>
	);
}

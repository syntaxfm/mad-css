import "./rules.css";

export function Rules() {
	return (
		<section id="rules" className="section rules">
			<div className="section-content">
				<h2>The Rules</h2>

				<p className="rules-headline">
					16 of the most elite CSS Developers from around the world will battle
					it out for the chance to be dubbed the{" "}
					<strong>INAUGURAL MADCSS CHAMPIONS OF THE WORLD</strong>
				</p>

				<div className="rules-grid">
					<div className="rules-card">
						<h3>How It Works</h3>
						<ul className="rules-list">
							<li>16 of the most talented* developers</li>
							<li>single elimination</li>
							<li>4 rounds</li>
							<li>1 winner</li>
						</ul>
						<p className="disclaimer">*participants' talents not specified👀</p>
					</div>

					<div className="rules-card">
						<h3>The Games</h3>
						<ul className="rules-list">
							<li>15 minute time limit</li>
							<li>
								2 participants will work to re-create a target UI with only{" "}
								<strong>HTML / CSS</strong>
							</li>
						</ul>
					</div>

					<div className="rules-card full-width">
						<h3>How Do You Win A Match?</h3>
						<p>
							The first participant to reach <strong>100%</strong> target match
							before time is up
						</p>
						<p className="or">OR</p>
						<p>
							The participant with the <strong>highest percentage</strong>{" "}
							target match
						</p>
					</div>

					<div className="rules-card full-width">
						<h3>Tie Breaker</h3>
						<p>
							In the unlikely event of a tie, the designated referee will
							determine a tie breaker, which may be but is not limited to:
							checking match percent in another web browser, comparing total
							amount of code written etc.
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}

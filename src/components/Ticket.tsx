import '@/styles/ticket.css';
export function Ticket() {
	return (
		<div className="ticket_wrapper">
			<div className="ticket">
				<div className="ticket_body">
					<h2>The Ultimate CSS Tournament</h2>
					<p className="font_block battle">16 Devs Battle for Glory</p>
					<div className="presented">
						<a href="https://syntax.fm" target="_blank">
							<img src="/syntax.svg" alt="Syntax" />
						</a>
						<p>Presented by</p>
					</div>
					<div className="presented">
						{/* TODO Setup UTM tracking */}
						<a href="https://sentry.io" target="_blank">
							<img src="/sentry.svg" alt="Sentry" />
						</a>
						<p>Technology Partner</p>
					</div>
					<div className="presented">
						<a href="https://youtube.com" target="_blank">
							<img src="/youtube.png" alt="YouTube" />
						</a>
						<p>Unofficial Internet Broadcast Partner</p>
					</div>
				</div>
				<div className="ticket_tear">
					<p>ADMIT ONE</p>
				</div>
				<div className="ticket_stub">
					<div className="barcode"></div>
				</div>
			</div>
		</div>
	);
}

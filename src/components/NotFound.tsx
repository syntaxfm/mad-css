interface NotFoundProps {
	message?: string;
}

export function NotFound({ message }: NotFoundProps) {
	return (
		<div className="section">
			<div className="not-found">
				<div className="not-found-code">404</div>
				<h1 className="not-found-title">Out of Bounds!</h1>
				<p className="not-found-text">
					{message ??
						"This page doesn't exist. The CSS you're looking for may have been eliminated from the tournament."}
				</p>
				<a href="/" className="not-found-btn">
					Back to Tournament
				</a>
			</div>
		</div>
	);
}

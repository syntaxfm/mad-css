import { Link } from "@tanstack/react-router";

import '@/styles/header.css';

export function Header() {
  return (
    <header className="header">
			<Link to="/" className="logo">
				{/* TODO this should be a vector image */}
				<img src="/mad-css-logo.svg" alt="Mad CSS Logo" />
			</Link>
		</header>
	);
}

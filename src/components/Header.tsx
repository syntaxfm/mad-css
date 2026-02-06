import { Link } from "@tanstack/react-router";
import { UserMenu } from "./UserMenu";

import "@/styles/header.css";

export function Header() {
	return (
		<header className="header">
			<Link to="/" className="logo">
				<img src="/mad-css-logo.svg" alt="Mad CSS Logo" />
			</Link>
			<UserMenu />
		</header>
	);
}

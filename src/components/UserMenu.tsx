import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import "@/styles/user-menu.css";

export function UserMenu() {
	const { data: session, isPending } = authClient.useSession();
	const [open, setOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		}
		if (open) {
			document.addEventListener("click", handleClickOutside);
		}
		return () => document.removeEventListener("click", handleClickOutside);
	}, [open]);

	if (isPending || !session?.user) return null;

	const { name, image } = session.user;

	return (
		<div className="user-menu" ref={menuRef}>
			<button
				type="button"
				className="user-menu-trigger"
				onClick={() => setOpen((prev) => !prev)}
				aria-expanded={open}
				aria-haspopup="true"
			>
				<img
					src={image || "/default-avatar.png"}
					alt=""
					className="user-menu-avatar"
				/>
				<span className="user-menu-name">{name}</span>
				<svg
					className="user-menu-chevron"
					width="12"
					height="12"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="3"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
				>
					<polyline points="6 9 12 15 18 9" />
				</svg>
			</button>
			{open && (
				<div className="user-menu-dropdown">
					<button
						type="button"
						className="user-menu-item"
						onClick={() => {
							sessionStorage.removeItem("bracket-scrolled");
							authClient.signOut();
							setOpen(false);
						}}
					>
						Sign out
					</button>
				</div>
			)}
		</div>
	);
}

import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { buildResultsUpToStage, type SimulationStage } from "@/lib/simulation";
import "@/styles/admin-button.css";

const STAGES: { value: string; label: string }[] = [
	{ value: "default", label: "Default (Live Data)" },
	{ value: "r1-left", label: "R1 Left Complete" },
	{ value: "r1-right", label: "R1 Right Complete" },
	{ value: "quarterfinals", label: "Quarterfinals Complete" },
	{ value: "semifinals", label: "Semifinals Complete" },
	{ value: "finals", label: "Champion Crowned" },
];

export function AdminButton() {
	const location = useLocation();
	const { data: session } = useSession();
	const [isAdmin, setIsAdmin] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [simStage, setSimStage] = useState("default");
	const popoverRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);

	// Fetch the user's admin status for client-side check (UI only)
	useEffect(() => {
		if (!session?.user) {
			setIsAdmin(false);
			return;
		}

		fetch("/api/admin/check")
			.then((res) => {
				if (res.ok) return res.json();
				return null;
			})
			.then((data) => {
				setIsAdmin(data?.isAdmin ?? false);
			})
			.catch(() => {
				setIsAdmin(false);
			});
	}, [session?.user]);

	// Close popover when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				popoverRef.current &&
				buttonRef.current &&
				!popoverRef.current.contains(event.target as Node) &&
				!buttonRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		}

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			return () =>
				document.removeEventListener("mousedown", handleClickOutside);
		}
	}, [isOpen]);

	const handleStageChange = (stage: string) => {
		setSimStage(stage);
		if (stage === "default") {
			window.dispatchEvent(
				new CustomEvent("tournament-results-changed", { detail: {} }),
			);
		} else {
			const results = buildResultsUpToStage(stage as SimulationStage);
			window.dispatchEvent(
				new CustomEvent("tournament-results-changed", { detail: { results } }),
			);
		}
	};

	// Don't show on admin page itself
	if (location.pathname === "/admin") {
		return null;
	}

	// Only show for admin users (client-side check for UI only)
	if (!isAdmin) {
		return null;
	}

	return (
		<div className="admin-button-container">
			{isOpen && (
				<div ref={popoverRef} className="admin-popover">
					<Link to="/admin" className="admin-popover-link">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
						>
							<path d="M12 2L2 7l10 5 10-5-10-5z" />
							<path d="M2 17l10 5 10-5" />
							<path d="M2 12l10 5 10-5" />
						</svg>
						Admin Dashboard
					</Link>

					<div className="admin-popover-divider" />

					<div className="admin-popover-section">
						<label className="admin-popover-label" htmlFor="sim-stage">
							Simulation
						</label>
						<select
							id="sim-stage"
							className="admin-popover-select"
							value={simStage}
							onChange={(e) => handleStageChange(e.target.value)}
						>
							{STAGES.map((stage) => (
								<option key={stage.value} value={stage.value}>
									{stage.label}
								</option>
							))}
						</select>
					</div>
				</div>
			)}

			<button
				ref={buttonRef}
				type="button"
				className="admin-button"
				onClick={() => setIsOpen(!isOpen)}
				aria-expanded={isOpen}
				aria-haspopup="true"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
				>
					<path d="M12 2L2 7l10 5 10-5-10-5z" />
					<path d="M2 17l10 5 10-5" />
					<path d="M2 12l10 5 10-5" />
				</svg>
				Admin
			</button>
		</div>
	);
}

import { useCallback, useEffect, useRef, useState } from "react";
import "@/styles/section-nav.css";

const SECTIONS = [
	{ id: "ticket", label: "Home", sideText: "MAD CSS" },
	{ id: "roster", label: "Roster", sideText: "THE PLAYERS" },
	{ id: "bracket", label: "Bracket", sideText: "TOURNAMENT" },
	{ id: "leaderboard", label: "Leaders", sideText: "TOP PICKS" },
	{ id: "prizes", label: "Prizes", sideText: "LOOT" },
	{ id: "merch", label: "Merch", sideText: "GEAR" },
	{ id: "rules", label: "Rules", sideText: "THE LAW" },
] as const;

export function SectionNav() {
	const [activeId, setActiveId] = useState<string>("ticket");
	const navRef = useRef<HTMLElement>(null);

	useEffect(() => {
		const sectionEls = SECTIONS.map(({ id }) =>
			document.getElementById(id),
		).filter(Boolean) as HTMLElement[];

		if (sectionEls.length === 0) return;

		const activeObserver = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setActiveId(entry.target.id);
					}
				}
			},
			{ rootMargin: "-50% 0px -50% 0px" },
		);

		for (const el of sectionEls) {
			activeObserver.observe(el);
		}

		function onScroll() {
			if (window.scrollY === 0) setActiveId("ticket");
		}
		window.addEventListener("scroll", onScroll, { passive: true });

		return () => {
			activeObserver.disconnect();
			window.removeEventListener("scroll", onScroll);
		};
	}, []);

	const activeItemCallback = useCallback((node: HTMLAnchorElement | null) => {
		if (!node) return;
		node.scrollIntoView({
			behavior: "smooth",
			block: "nearest",
			inline: "nearest",
		});
	}, []);

	function handleClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
		e.preventDefault();
		document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
	}

	return (
		<nav ref={navRef} className="section-nav" aria-label="Page sections">
			<div className="section-nav-tickets">
				{/* {["f1", "f2", "f3"].map((id) => (
					<div key={id} className="drink-ticket empty">
						<span className="side left">MAD CSS</span>
						<div className="inner" />
						<span className="side right">MAD CSS</span>
					</div>
				))} */}
				{SECTIONS.map((section) => (
					<a
						key={section.id}
						ref={section.id === activeId ? activeItemCallback : undefined}
						href={`#${section.id}`}
						className={`drink-ticket${activeId === section.id ? " active" : ""}`}
						onClick={(e) => handleClick(e, section.id)}
					>
						<span className="side left">{section.sideText}</span>
						<div className="inner">
							<span className="label">{section.label}</span>
						</div>
						<span className="side right">{section.sideText}</span>
					</a>
				))}
				{/* {["f4", "f5", "f6"].map((id) => (
					<div key={id} className="drink-ticket empty">
						<span className="side left">MAD CSS</span>
						<div className="inner" />
						<span className="side right">MAD CSS</span>
					</div>
				))} */}
			</div>
		</nav>
	);
}

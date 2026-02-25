import { useState } from "react";
import "./prizes.css";

type PrizeLevel = 1 | 2 | 3;

interface PrizeImage {
	src: string;
	label: string;
	link: string;
	level: PrizeLevel;
	alts?: Partial<Record<PrizeLevel, { src: string; label: string }>>;
	left: number;
	top: number;
	width: number;
	height: number;
	rotate?: number;
	scale?: number;
	zIndex?: number;
}

const PLACES: { level: PrizeLevel; label: string }[] = [
	{ level: 1, label: "1st" },
	{ level: 2, label: "2nd" },
	{ level: 3, label: "3rd" },
];

const VIEWBOX = 16295;

function pct(val: number) {
	return (val / VIEWBOX) * 100;
}

const Y_OFFSET = 2653;

const prizeImages: PrizeImage[] = [
	{
		src: "/prizes/prize-0.png",
		label: "Syntax Skate Deck",
		link: "https://checkout.sentry.shop/products/syntax-skate-deck",
		level: 3,
		left: -500,
		top: 8724 - Y_OFFSET,
		width: 3149,
		height: 7878,
		scale: 0.9,
		zIndex: 1,
	},
	{
		src: "/prizes/prize-1.png",
		label: "Syntax Hoodie",
		link: "https://checkout.sentry.shop/products/syntax-hoodie",
		level: 3,
		left: 1186,
		top: 11152 - Y_OFFSET,
		width: 4688,
		height: 5643,
		scale: 0.9,
		zIndex: 6,
	},
	{
		src: "/prizes/prize-2.png",
		label: "Blazing Fast Tee",
		link: "https://checkout.sentry.shop/products/syntax-blazing-fast-tee",
		level: 3,
		left: 8292,
		top: 12184 - Y_OFFSET,
		width: 4533,
		height: 4590,
		scale: 0.9,
		zIndex: 6,
	},
	{
		src: "/prizes/prize-3.png",
		label: "Syntax Panther Tee",
		link: "https://checkout.sentry.shop/products/syntax-panther-tee",
		level: 3,
		left: 6562,
		top: 12236 - Y_OFFSET,
		width: 2878,
		height: 4318,
		scale: 0.9,
		zIndex: 6,
	},
	{
		src: "/prizes/prize-4.png",
		label: "Sick Pick Tee",
		link: "https://checkout.sentry.shop/products/syntax-sick-pick-tee",
		level: 3,
		left: 3248,
		top: 12236 - Y_OFFSET,
		width: 4533,
		height: 4485,
		scale: 0.9,
		zIndex: 6,
	},
	{
		src: "/prizes/prize-5.png",
		label: "Drizzle Tee",
		link: "https://checkout.sentry.shop/products/syntax-drizzle-tee",
		level: 3,
		left: 10600,
		top: 11331 - Y_OFFSET,
		width: 4532,
		height: 5665,
		scale: 0.9,
		zIndex: 5,
	},
	{
		src: "/prizes/prize-6.png",
		label: "Webmaster Tee",
		link: "https://checkout.sentry.shop/products/syntax-webmaster-tee",
		level: 3,
		left: 13410,
		top: 11269 - Y_OFFSET,
		width: 3503,
		height: 5305,
		scale: 0.9,
		zIndex: 6,
	},
	{
		src: "/prizes/prize-7.png",
		label: "Syntax Beanie",
		link: "https://checkout.sentry.shop/products/syntax-beanie",
		level: 3,
		left: 1300,
		top: 8148 - Y_OFFSET,
		width: 3334,
		height: 3334,
		scale: 0.9,
		zIndex: 7,
	},
	{
		src: "/prizes/prize-8.png",
		label: "Web Dev Pin Pack #1",
		link: "https://checkout.sentry.shop/products/syntax-web-dev-pin-pack-1",
		level: 1,
		left: 10206,
		top: 9810 - Y_OFFSET,
		width: 2419,
		height: 2354,
		rotate: 7.44,
		scale: 1.3,
		zIndex: 8,
	},
	{
		src: "/prizes/prize-9.png",
		label: "Syntax Key Caps",
		link: "https://checkout.sentry.shop/products/syntax-keycaps",
		level: 1,
		left: 14543,
		top: 8221 - Y_OFFSET,
		width: 1921,
		height: 1979,
		scale: 1.4,
		zIndex: 7,
	},
	{
		src: "/prizes/prize-10.png",
		label: "Syntax Rope Hat",
		link: "https://checkout.sentry.shop/products/syntax-rope-cap",
		level: 2,
		left: 3262,
		top: 9208 - Y_OFFSET,
		width: 3061,
		height: 3061,
		scale: 0.9,
		zIndex: 8,
	},
	{
		src: "/prizes/prize-11.png",
		label: "Syntax Felt Cap",
		link: "https://checkout.sentry.shop/products/syntax-felt-cap",
		level: 3,
		left: 5110,
		top: 9815 - Y_OFFSET,
		width: 2301,
		height: 3500,
		scale: 1.2,
		zIndex: 8,
	},
	{
		src: "/prizes/prize-12.png",
		label: "Syntax Koozie",
		link: "https://checkout.sentry.shop/products/syntax-can-holder",
		level: 3,
		left: 1348,
		top: 10292 - Y_OFFSET,
		width: 2463,
		height: 2463,
		scale: 0.9,
		zIndex: 9,
	},
	{
		src: "/prizes/prize-13.png",
		label: "Syntax Nalgene",
		link: "#",
		level: 1,
		left: -795,
		top: 5464 - Y_OFFSET,
		width: 3210,
		height: 5500,
		rotate: -6.24,
		scale: 0.9,
		zIndex: 3,
	},
	{
		src: "/prizes/prize-14.png",
		label: "MadCSS Sticker",
		link: "#",
		level: 1,

		left: 5057,
		top: 3830 - Y_OFFSET,
		width: 2407,
		height: 2407,
		scale: 0.9,
		zIndex: 4,
	},
	{
		src: "/prizes/prize-15.png",
		label: "$69 Taco Bell Gift Card",
		link: "#",
		level: 1,
		alts: {
			2: {
				src: "/prizes/taco-bell-sixteen-ninety.png",
				label: "$16.90 Taco Bell Gift Card",
			},
			3: {
				src: "/prizes/taco-bell-six-nine.png",
				label: "$6.90 Taco Bell Gift Card",
			},
		},
		left: 11299,
		top: 2653 - Y_OFFSET,
		width: 7774,
		height: 5183,
		rotate: 11.77,
		scale: 0.9,
		zIndex: 2,
	},
	{
		src: "/prizes/prize-19.png",
		label: "MadCSS Tee",
		link: "#",
		level: 1,
		left: 2580,
		top: 5115 - Y_OFFSET,
		width: 5385,
		height: 5385,
		scale: 0.9,
		zIndex: 4,
	},
	{
		src: "/prizes/prize-20.png",
		label: "MadCSS Tee",
		link: "#",
		level: 1,
		left: 569,
		top: 3731 - Y_OFFSET,
		width: 5385,
		height: 5385,
		scale: 0.9,
		zIndex: 3,
	},
	{
		src: "/prizes/prize-21.png",
		label: "Syntax Basketball",
		link: "https://checkout.sentry.shop/products/syntax-basketball",
		level: 2,
		left: 12508,
		top: 8736 - Y_OFFSET,
		width: 3170,
		height: 3882,
		scale: 0.9,
		zIndex: 7,
	},
	{
		src: "/prizes/prize-22.png",
		label: "MadCSS Bomber Jacket",
		link: "https://checkout.sentry.shop/collections/syntax-march-madcss",
		level: 3,
		left: 5893,
		top: 4480 - Y_OFFSET,
		width: 9277,
		height: 5936,
		rotate: 5.14,
		scale: 0.9,
		zIndex: 5,
	},
	{
		src: "/prizes/sentry-1-year.png",
		label: "1 Year of Sentry",
		link: "https://sentry.io",
		level: 1,
		alts: {
			2: { src: "/prizes/sentry-6-months.png", label: "6 Months of Sentry" },
			3: { src: "/prizes/sentry-3-months.png", label: "3 Months of Sentry" },
		},
		left: 5522,
		top: 8987 - Y_OFFSET,
		width: 2500,
		height: 2500,
		rotate: 6.78,
		scale: 0.9,
		zIndex: 10,
	},
	{
		src: "/prizes/prize-24.png",
		label: "Internet Hat",
		link: "https://checkout.sentry.shop/products/internet-hat",
		level: 3,
		left: 7392,
		top: 9422 - Y_OFFSET,
		width: 3189,
		height: 2718,
		scale: 0.9,
		zIndex: 9,
	},
];

const ROTATION_JITTER = prizeImages.map((_, i) => {
	const seed = Math.sin(i * 9301 + 4927) * 10000;
	const magnitude = 1 + (seed - Math.floor(seed)) * 2;
	const sign = Math.sin(i * 1741 + 3137) > 0 ? 1 : -1;
	return magnitude * sign;
});

function isVisible(itemLevel: PrizeLevel, activePlace: PrizeLevel): boolean {
	if (activePlace === 1) return true;
	if (activePlace === 2) return itemLevel <= 2;
	return itemLevel <= 1;
}

const PLACE_VALUES: Record<PrizeLevel, string> = {
	1: "$1,500",
	2: "$630",
	3: "$300",
};

export function Prizes() {
	const [activePlace, setActivePlace] = useState<PrizeLevel>(1);
	const activeIndex = PLACES.findIndex((p) => p.level === activePlace);

	return (
		<section id="prizes" className="section prizes-section">
			<div className="section-content">
				<h2>Prizes</h2>
				<div className="prizes-toggle">
					<div className="prizes-toggle-track">
						<div
							className="prizes-toggle-thumb"
							style={{ left: `${(activeIndex / PLACES.length) * 100}%` }}
						/>
						{PLACES.map((p) => (
							<button
								key={p.level}
								type="button"
								className={`prizes-toggle-option${activePlace === p.level ? " active" : ""}`}
								onMouseEnter={() => setActivePlace(p.level)}
								onClick={() => setActivePlace(p.level)}
							>
								{p.label}
							</button>
						))}
					</div>
					<p className="prizes-value">{PLACE_VALUES[activePlace]} value!</p>
				</div>
			</div>
			<div className="prizes-collage">
				<div className="prizes-collage-inner">
					<svg
						className="prizes-red-shape"
						viewBox={`0 ${Y_OFFSET} 16295 16295`}
						preserveAspectRatio="none"
						role="presentation"
					>
						<path
							d="M1140 4855.78L-228.625 5308.9V5624.78L-391 8295L80.5 8911.5L1893 8779.86L2312.5 8626.5L3500 8779.86L3983.5 10043.5L6344 10237L7492 9279L7781.5 9713L9202 10132L10424 10840L11873 10639L13134.5 10840L13456.5 9069L13778.5 8087.5L14875 8236L15989.5 8087.5L16743 7458.74V4756.78L15898 4112.45L14671.6 3663L13304.1 3790.82L12882.5 5439.5L12490.5 5299.5L10609.9 4855.78H9202L7566.95 5434.47L6827.5 4240L5686 4112.45L5200.5 4973.65L4858.64 4559.81L3655 4112.45H2430.39L1140 4855.78Z"
							fill="var(--orange)"
						/>
					</svg>

					{prizeImages.map((img, i) => {
						const active = isVisible(img.level, activePlace);
						const alt = img.alts?.[activePlace];
						const imgSrc = alt?.src ?? img.src;
						const imgLabel = alt?.label ?? img.label;
						const hasLink = img.link && img.link !== "#";
						const Tag = hasLink ? "a" : "div";
						const jitter =
							activePlace === 2
								? ROTATION_JITTER[i]
								: activePlace === 3
									? -ROTATION_JITTER[i]
									: 0;
						const rotate = (img.rotate ?? 0) + jitter;
						return (
							<Tag
								key={img.src}
								{...(hasLink
									? {
											href: img.link,
											target: "_blank",
											rel: "noopener noreferrer",
											title: imgLabel,
										}
									: {})}
								className={`prize-image-wrapper${active ? "" : " dimmed"}`}
								style={
									{
										"--prize-img": `url(${imgSrc})`,
										left: `${pct(img.left)}%`,
										top: `${pct(img.top)}%`,
										width: `${pct(img.width)}%`,
										height: `${pct(img.height)}%`,
										transform:
											[
												rotate ? `rotate(${rotate}deg)` : "",
												img.scale ? `scale(${img.scale})` : "",
											]
												.join(" ")
												.trim() || undefined,
										zIndex: img.zIndex ?? 1,
									} as React.CSSProperties
								}
							>
								<img
									src={imgSrc}
									alt={imgLabel}
									className="prize-image"
									loading="lazy"
								/>
								<span className="prize-label">{imgLabel}</span>
							</Tag>
						);
					})}
				</div>
			</div>
		</section>
	);
}

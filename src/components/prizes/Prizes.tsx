import "./prizes.css";

interface PrizeImage {
	src: string;
	label: string;
	link: string;
	left: number;
	top: number;
	width: number;
	height: number;
	rotate?: number;
	scale?: number;
	zIndex?: number;
}

const VIEWBOX = 16295;

function pct(val: number) {
	return (val / VIEWBOX) * 100;
}

const Y_OFFSET = 2653;

const prizeImages: PrizeImage[] = [
	{
		src: "/prizes/prize-0.png",
		label: "Prize 1",
		link: "#",
		left: 0,
		top: 8724 - Y_OFFSET,
		width: 3149,
		height: 7878,
		scale: 1.5,
		zIndex: 1,
	},
	{
		src: "/prizes/prize-1.png",
		label: "Prize 2",
		link: "#",
		left: 1186,
		top: 11152 - Y_OFFSET,
		width: 4688,
		height: 5643,
		scale: 1.5,
		zIndex: 6,
	},
	{
		src: "/prizes/prize-2.png",
		label: "Prize 3",
		link: "#",
		left: 8292,
		top: 12184 - Y_OFFSET,
		width: 4533,
		height: 4590,
		scale: 1.5,
		zIndex: 6,
	},
	{
		src: "/prizes/prize-3.png",
		label: "Prize 4",
		link: "#",
		left: 6562,
		top: 12236 - Y_OFFSET,
		width: 2878,
		height: 4318,
		scale: 1.5,
		zIndex: 6,
	},
	{
		src: "/prizes/prize-4.png",
		label: "Prize 5",
		link: "#",
		left: 3248,
		top: 12236 - Y_OFFSET,
		width: 4533,
		height: 4485,
		scale: 1.5,
		zIndex: 6,
	},
	{
		src: "/prizes/prize-5.png",
		label: "Prize 6",
		link: "#",
		left: 10600,
		top: 11331 - Y_OFFSET,
		width: 4532,
		height: 5665,
		scale: 1.5,
		zIndex: 5,
	},
	{
		src: "/prizes/prize-6.png",
		label: "Prize 7",
		link: "#",
		left: 13410,
		top: 12269 - Y_OFFSET,
		width: 3003,
		height: 4305,
		scale: 1.5,
		zIndex: 6,
	},
	{
		src: "/prizes/prize-7.png",
		label: "Prize 8",
		link: "#",
		left: 1300,
		top: 8148 - Y_OFFSET,
		width: 3334,
		height: 3334,
		scale: 1.5,
		zIndex: 7,
	},
	{
		src: "/prizes/prize-8.png",
		label: "Prize 9",
		link: "#",
		left: 10206,
		top: 9810 - Y_OFFSET,
		width: 2419,
		height: 2354,
		rotate: 7.44,
		scale: 1.5,
		zIndex: 8,
	},
	{
		src: "/prizes/prize-9.png",
		label: "Prize 10",
		link: "#",
		left: 14543,
		top: 8221 - Y_OFFSET,
		width: 1921,
		height: 1979,
		scale: 1.5,
		zIndex: 7,
	},
	{
		src: "/prizes/prize-10.png",
		label: "Prize 11",
		link: "#",
		left: 3262,
		top: 9208 - Y_OFFSET,
		width: 3061,
		height: 3061,
		scale: 1.5,
		zIndex: 8,
	},
	{
		src: "/prizes/prize-11.png",
		label: "Prize 12",
		link: "#",
		left: 5110,
		top: 9815 - Y_OFFSET,
		width: 2301,
		height: 3500,
		scale: 1.5,
		zIndex: 8,
	},
	{
		src: "/prizes/prize-12.png",
		label: "Prize 13",
		link: "#",
		left: 1348,
		top: 10292 - Y_OFFSET,
		width: 2463,
		height: 2463,
		scale: 1.5,
		zIndex: 9,
	},
	{
		src: "/prizes/prize-13.png",
		label: "Prize 14",
		link: "#",
		left: -795,
		top: 5464 - Y_OFFSET,
		width: 3210,
		height: 3210,
		rotate: -6.24,
		scale: 1.5,
		zIndex: 3,
	},
	{
		src: "/prizes/prize-14.png",
		label: "Prize 15",
		link: "#",
		left: 5057,
		top: 3830 - Y_OFFSET,
		width: 2407,
		height: 2407,
		scale: 1.5,
		zIndex: 4,
	},
	{
		src: "/prizes/prize-15.png",
		label: "Prize 16",
		link: "#",
		left: 11299,
		top: 2653 - Y_OFFSET,
		width: 7774,
		height: 5183,
		rotate: 11.77,
		scale: 1.5,
		zIndex: 2,
	},
	{
		src: "/prizes/prize-19.png",
		label: "Prize 17",
		link: "#",
		left: 2580,
		top: 5115 - Y_OFFSET,
		width: 5385,
		height: 5385,
		scale: 1.5,
		zIndex: 4,
	},
	{
		src: "/prizes/prize-20.png",
		label: "Prize 18",
		link: "#",
		left: 569,
		top: 3731 - Y_OFFSET,
		width: 5385,
		height: 5385,
		scale: 1.5,
		zIndex: 3,
	},
	{
		src: "/prizes/prize-21.png",
		label: "Prize 19",
		link: "#",
		left: 12508,
		top: 8736 - Y_OFFSET,
		width: 3170,
		height: 3882,
		scale: 1.5,
		zIndex: 7,
	},
	{
		src: "/prizes/prize-22.png",
		label: "Prize 20",
		link: "#",
		left: 5893,
		top: 4480 - Y_OFFSET,
		width: 9277,
		height: 5936,
		rotate: 5.14,
		scale: 1.5,
		zIndex: 5,
	},
	{
		src: "/prizes/prize-23.png",
		label: "Prize 21",
		link: "#",
		left: 7733,
		top: 10408 - Y_OFFSET,
		width: 792,
		height: 727,
		rotate: 6.78,
		scale: 1.5,
		zIndex: 10,
	},
	{
		src: "/prizes/prize-24.png",
		label: "Prize 22",
		link: "#",
		left: 7392,
		top: 9422 - Y_OFFSET,
		width: 3189,
		height: 2718,
		scale: 1.5,
		zIndex: 9,
	},
];

export function Prizes() {
	return (
		<section className="section prizes-section">
			<div className="section-content">
				<h2>Prizes</h2>
			</div>
			<div className="prizes-collage">
				<div className="prizes-collage-inner">
					{/* Red jagged shape */}
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

					{prizeImages.map((img) => (
						<a
							key={img.src}
							href={img.link}
							className="prize-image-wrapper"
							target="_blank"
							rel="noopener noreferrer"
							style={{
								left: `${pct(img.left)}%`,
								top: `${pct(img.top)}%`,
								width: `${pct(img.width)}%`,
								height: `${pct(img.height)}%`,
								transform:
									[
										img.rotate ? `rotate(${img.rotate}deg)` : "",
										// img.scale ? `scale(${img.scale})` : "",
									]
										.join(" ")
										.trim() || undefined,
								zIndex: img.zIndex ?? 1,
							}}
						>
							<img
								src={img.src}
								alt={img.label}
								className="prize-image"
								loading="lazy"
							/>
							<span className="prize-label">{img.label}</span>
						</a>
					))}
				</div>
			</div>
		</section>
	);
}

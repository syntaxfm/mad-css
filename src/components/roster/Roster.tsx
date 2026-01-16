import "./roster.css";
import { cfImage } from "../../lib/cfImage";

// Deterministic pseudo-random based on seed (same result for same index)
function seededRandom(seed: number): number {
	const x = Math.sin(seed * 9999) * 10000;
	return x - Math.floor(x);
}

export function Roster() {
	const players = [
		{
			name: "Wes Bos",
			image: "/cards/wes bos card.jpg",
		},
		{
			name: "Scott Tolinski",
			image: "/cards/scott tolinski card.jpg",
		},
		{
			name: "Kevin Powell",
			image: "/cards/Kevin Powell Card.jpg",
		},
		{
			name: "Adam Argyle",
			image: "/cards/adam argyle card.jpg",
		},
		{
			name: "Adam Wathan",
			image: "/cards/Adam Wathan Card.jpg",
		},
		{
			name: "Ania Kubow",
			image: "/cards/Ania Kubow card.jpg",
		},
	];
	return (
		<div className="roster">
			<h2 className="center font_block uppercase">The Roster</h2>
			<p className="center">
				16 players total. Here are the Lucky {players.length} thave have been
				drafted so far.
			</p>
			<div className="cards">
				{players.map((player, index) => (
					<div
						className="card"
						key={`${player.name}-${index}`}
						style={
							{
								"--rotate": `${(index % 2 === 0 ? 1 : -1) * seededRandom(index) * 5}deg`,
							} as React.CSSProperties
						}
					>
						<img src={cfImage(player.image)} alt={player.name} />
					</div>
				))}
			</div>
		</div>
	);
}

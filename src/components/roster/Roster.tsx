import "./roster.css";

// Deterministic pseudo-random based on seed (same result for same index)
function seededRandom(seed: number): number {
	const x = Math.sin(seed * 9999) * 10000;
	return x - Math.floor(x);
}

export function Roster() {
  const players = [
			{
				name: "Wes Bos",
				image: "/cards/wes.jpg",
			},
			{
				name: "Scott Tolinski",
				image: "/cards/scott.jpg",
			},
			{
				name: "Wes Bos",
				image: "/cards/wes.jpg",
			},
			{
				name: "Scott Tolinski",
				image: "/cards/scott.jpg",
			},
			{
				name: "Wes Bos",
				image: "/cards/wes.jpg",
			},
			{
				name: "Scott Tolinski",
				image: "/cards/scott.jpg",
			},
			{
				name: "Wes Bos",
				image: "/cards/wes.jpg",
			},
			{
				name: "Scott Tolinski",
				image: "/cards/scott.jpg",
			},
		];
  return (
    <div className="roster">
      <h2 className="center font_block uppercase">The Roster</h2>
      <p className="center">16 player lineup to be posted soon. For Now enjoy Wes and Scott a few times.</p>
      <div className="cards">
        {players.map((player, index) => (
          <div
            className="card"
            key={`${player.name}-${index}`}
            style={{ "--rotate": `${(index % 2 === 0 ? 1 : -1) * seededRandom(index) * 5}deg` } as React.CSSProperties}
          >
            <img src={player.image} alt={player.name} />
          </div>
        ))}
      </div>
    </div>
  )
}

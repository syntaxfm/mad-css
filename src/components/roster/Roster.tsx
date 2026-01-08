import "./roster.css";
export function Roster() {
  const players = [
			{
				name: "Wes Bos",
				image: "/cards/wes.png",
			},
			{
				name: "Scott Tolinski",
				image: "/cards/scott.png",
			},
			{
				name: "Kevin Powell",
				image: "/cards/kevin.png",
			},
			{
				name: "Wes Bos",
				image: "/cards/wes.png",
			},
			{
				name: "Scott Tolinski",
				image: "/cards/scott.png",
			},
			{
				name: "Kevin Powell",
				image: "/cards/kevin.png",
			},
			{
				name: "Wes Bos",
				image: "/cards/wes.png",
			},
			{
				name: "Scott Tolinski",
				image: "/cards/scott.png",
			},
			{
				name: "Kevin Powell",
				image: "/cards/kevin.png",
			},
			{
				name: "Wes Bos",
				image: "/cards/wes.png",
			},
			{
				name: "Scott Tolinski",
				image: "/cards/scott.png",
			},
			{
				name: "Kevin Powell",
				image: "/cards/kevin.png",
			},
			{
				name: "Wes Bos",
				image: "/cards/wes.png",
			},
			{
				name: "Scott Tolinski",
				image: "/cards/scott.png",
			},
			{
				name: "Kevin Powell",
				image: "/cards/kevin.png",
			},
			{
				name: "Kevin Powell",
				image: "/cards/kevin.png",
			},
		];
  return (
    <div className="roster">
      <h2 className="center font_block uppercase">The Roster</h2>
      <div className="cards">
        {players.map((player, index) => (
          <div
            className="card"
            key={`${player.name}-${index}`}
            style={{ "--rotate": `${(index % 2 === 0 ? 1 : -1) * Math.random() * 5}deg` } as React.CSSProperties}
          >
            <img src={player.image} alt={player.name} />
          </div>
        ))}
      </div>
    </div>
  )
}

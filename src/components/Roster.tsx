export function Roster() {
  const players = [
    {
      name: 'Wes Bos',
      image: '/cards/wes.png',
    },
    {
      name: 'Scott Tolinski',
      image: '/cards/scott.png',
    },
    {
      name: 'Kevin Powell',
      image: '/cards/kevin.png',
    },
  ]
  return (
    <div className="roster">
      <h2>The Roster</h2>
      <div className="cards">
        {players.map((player) => (
          <div className="card" key={player.name}>
            <img src={player.image} alt={player.name} />
            <p>{player.name}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

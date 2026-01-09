// =============================================================================
// PLAYER DEFINITIONS
// =============================================================================
// Each player needs: id (slug), name, photo path, and byline
// Photos are in /public/cards/

export type Player = {
	id: string;
	name: string;
	photo: string;
	byline: string;
};

// -----------------------------------------------------------------------------
// ALL PLAYERS
// -----------------------------------------------------------------------------

export const wesBos: Player = {
	id: "wes-bos",
	name: "Wes Bos",
	photo: "/cards/wes.jpg",
	byline: "Syntax.fm",
};

export const michaelJordan: Player = {
	id: "michael-jordan",
	name: "Michael Jordan",
	photo: "/cards/kevin.jpg",
	byline: "Chicago Bulls",
};

export const scottTolinski: Player = {
	id: "scott-tolinski",
	name: "Scott Tolinski",
	photo: "/cards/scott.jpg",
	byline: "Level Up Tuts",
};

export const scottiePippen: Player = {
	id: "scottie-pippen",
	name: "Scottie Pippen",
	photo: "/cards/wes.jpg",
	byline: "Chicago Bulls",
};

export const dennisRodman: Player = {
	id: "dennis-rodman",
	name: "Dennis Rodman",
	photo: "/cards/kevin.jpg",
	byline: "Chicago Bulls",
};

export const shaquilleOneal: Player = {
	id: "shaquille-oneal",
	name: "Shaquille O'Neal",
	photo: "/cards/scott.jpg",
	byline: "Orlando Magic",
};

export const hakeemOlajuwon: Player = {
	id: "hakeem-olajuwon",
	name: "Hakeem Olajuwon",
	photo: "/cards/wes.jpg",
	byline: "Houston Rockets",
};

export const charlesBarkley: Player = {
	id: "charles-barkley",
	name: "Charles Barkley",
	photo: "/cards/kevin.jpg",
	byline: "Phoenix Suns",
};

export const karlMalone: Player = {
	id: "karl-malone",
	name: "Karl Malone",
	photo: "/cards/scott.jpg",
	byline: "Utah Jazz",
};

export const johnStockton: Player = {
	id: "john-stockton",
	name: "John Stockton",
	photo: "/cards/wes.jpg",
	byline: "Utah Jazz",
};

export const patrickEwing: Player = {
	id: "patrick-ewing",
	name: "Patrick Ewing",
	photo: "/cards/kevin.jpg",
	byline: "New York Knicks",
};

export const reggieMiller: Player = {
	id: "reggie-miller",
	name: "Reggie Miller",
	photo: "/cards/scott.jpg",
	byline: "Indiana Pacers",
};

export const garyPayton: Player = {
	id: "gary-payton",
	name: "Gary Payton",
	photo: "/cards/wes.jpg",
	byline: "Seattle SuperSonics",
};

export const clydeDrexler: Player = {
	id: "clyde-drexler",
	name: "Clyde Drexler",
	photo: "/cards/kevin.jpg",
	byline: "Portland Trail Blazers",
};

export const davidRobinson: Player = {
	id: "david-robinson",
	name: "David Robinson",
	photo: "/cards/scott.jpg",
	byline: "San Antonio Spurs",
};

export const pennyHardaway: Player = {
	id: "penny-hardaway",
	name: "Penny Hardaway",
	photo: "/cards/wes.jpg",
	byline: "Orlando Magic",
};

// All players array
export const players: Player[] = [
	wesBos,
	michaelJordan,
	scottTolinski,
	scottiePippen,
	dennisRodman,
	shaquilleOneal,
	hakeemOlajuwon,
	charlesBarkley,
	karlMalone,
	johnStockton,
	patrickEwing,
	reggieMiller,
	garyPayton,
	clydeDrexler,
	davidRobinson,
	pennyHardaway,
];

// =============================================================================
// BRACKET DATA STRUCTURE
// =============================================================================
//
// TOURNAMENT FLOW:
// ----------------
// Each round is a single array. First half displays on LEFT, second half on RIGHT.
//
//   Round 1 (8 games)    Quarters (4)      Semis (2)       Finals (1)
//
//   LEFT SIDE:
//   Game 0 ──┐
//            ├── Game 0 ──┐
//   Game 1 ──┘            │
//                         ├── Game 0 ──┐
//   Game 2 ──┐            │            │
//            ├── Game 1 ──┘            │
//   Game 3 ──┘                         ├── Game 0 (FINAL)
//                                      │
//   RIGHT SIDE:                        │
//   Game 4 ──┐                         │
//            ├── Game 2 ──┐            │
//   Game 5 ──┘            │            │
//                         ├── Game 1 ──┘
//   Game 6 ──┐            │
//            ├── Game 3 ──┘
//   Game 7 ──┘
//
// =============================================================================

// Game type - represents a single match between two players
export type Game = {
	id: string; // Unique identifier for the game
	date: string; // Game date (YYYY-MM-DD format)
	player1?: Player; // First player (optional - may not be determined yet)
	player2?: Player; // Second player (optional - may not be determined yet)
	winner?: Player; // Winner (optional - game may not be played yet)
};

// The complete bracket structure
export type Bracket = {
	round1: Game[]; // 8 games - 16 players (games 0-3 left, 4-7 right)
	quarters: Game[]; // 4 games - 8 players (games 0-1 left, 2-3 right)
	semis: Game[]; // 2 games - 4 players (game 0 left, 1 right)
	finals: Game[]; // 1 game - 2 players (championship)
};

// =============================================================================
// THE BRACKET DATA
// =============================================================================
// Edit this to update the tournament state!
// - Set `winner` to mark a game as complete
// - Leave `winner` undefined for games not yet played
// - Leave `player2` undefined if the opponent isn't determined yet
//
// DISPLAY RULES:
// - First half of each array → LEFT side of bracket
// - Second half of each array → RIGHT side of bracket
// =============================================================================

export const bracket: Bracket = {
	// ===========================================================================
	// ROUND 1 - 8 games, 16 players
	// ===========================================================================
	// Games 0-3: LEFT side | Games 4-7: RIGHT side
	// Winners advance to Quarterfinals

	round1: [
		// ----- LEFT SIDE (games 0-3) -----

		// Game 0: Wes Bos vs Michael Jordan
		{
			id: "r1-0",
			date: "2026-02-01",
			player1: wesBos,
			player2: michaelJordan,
			winner: wesBos, // ← Wes won!
		},
		// Game 1: Scott Tolinski vs Scottie Pippen
		{
			id: "r1-1",
			date: "2026-02-01",
			player1: scottTolinski,
			player2: scottiePippen,
			winner: scottTolinski, // ← Scott won!
		},
		// Game 2: Dennis Rodman vs Shaquille O'Neal
		{
			id: "r1-2",
			date: "2026-02-02",
			player1: dennisRodman,
			player2: shaquilleOneal,
			winner: shaquilleOneal, // ← Shaq won!
		},
		// Game 3: Hakeem Olajuwon vs Charles Barkley
		{
			id: "r1-3",
			date: "2026-02-02",
			player1: hakeemOlajuwon,
			player2: charlesBarkley,
			winner: hakeemOlajuwon, // ← Hakeem won!
		},

		// ----- RIGHT SIDE (games 4-7) -----

		// Game 4: Karl Malone vs John Stockton
		{
			id: "r1-4",
			date: "2026-02-01",
			player1: karlMalone,
			player2: johnStockton,
			winner: karlMalone, // ← Karl won!
		},
		// Game 5: Patrick Ewing vs Reggie Miller
		{
			id: "r1-5",
			date: "2026-02-01",
			player1: patrickEwing,
			player2: reggieMiller,
			winner: reggieMiller, // ← Reggie won!
		},
		// Game 6: Gary Payton vs Clyde Drexler
		{
			id: "r1-6",
			date: "2026-02-02",
			player1: garyPayton,
			player2: clydeDrexler,
			winner: garyPayton, // ← Gary won!
		},
		// Game 7: David Robinson vs Penny Hardaway
		{
			id: "r1-7",
			date: "2026-02-02",
			player1: davidRobinson,
			player2: pennyHardaway,
			winner: pennyHardaway, // ← Penny won!
		},
	],

	// ===========================================================================
	// QUARTERFINALS - 4 games, 8 players
	// ===========================================================================
	// Games 0-1: LEFT side | Games 2-3: RIGHT side
	// Winners advance to Semifinals

	quarters: [
		// ----- LEFT SIDE (games 0-1) -----

		// Game 0: Winner of R1-0 vs Winner of R1-1
		{
			id: "qf-0",
			date: "2026-02-08",
			player1: wesBos, // Winner of Game 0
			player2: scottTolinski, // Winner of Game 1
			winner: wesBos, // ← Wes won!
		},
		// Game 1: Winner of R1-2 vs Winner of R1-3
		{
			id: "qf-1",
			date: "2026-02-08",
			player1: shaquilleOneal, // Winner of Game 2
			player2: hakeemOlajuwon, // Winner of Game 3
			winner: hakeemOlajuwon, // ← Hakeem won!
		},

		// ----- RIGHT SIDE (games 2-3) -----

		// Game 2: Winner of R1-4 vs Winner of R1-5
		{
			id: "qf-2",
			date: "2026-02-08",
			player1: karlMalone, // Winner of Game 4
			player2: reggieMiller, // Winner of Game 5
			winner: karlMalone, // ← Karl won!
		},
		// Game 3: Winner of R1-6 vs Winner of R1-7
		{
			id: "qf-3",
			date: "2026-02-08",
			player1: garyPayton, // Winner of Game 6
			player2: pennyHardaway, // Winner of Game 7
			// winner: undefined    // ← GAME NOT PLAYED YET
		},
	],

	// ===========================================================================
	// SEMIFINALS - 2 games, 4 players
	// ===========================================================================
	// Game 0: LEFT side | Game 1: RIGHT side
	// Winners advance to Finals

	semis: [
		// ----- LEFT SIDE (game 0) -----

		// Game 0: Winner of QF-0 vs Winner of QF-1
		{
			id: "sf-0",
			date: "2026-02-15",
			player1: wesBos, // Winner of QF Game 0
			player2: hakeemOlajuwon, // Winner of QF Game 1
			// winner: undefined    // ← GAME NOT PLAYED YET
		},

		// ----- RIGHT SIDE (game 1) -----

		// Game 1: Winner of QF-2 vs Winner of QF-3
		{
			id: "sf-1",
			date: "2026-02-15",
			player1: karlMalone, // Winner of QF Game 2
			// player2: undefined   // ← TBD (waiting for QF-3 result)
			// winner: undefined    // ← GAME NOT PLAYED YET
		},
	],

	// ===========================================================================
	// FINALS - 1 game, 2 players (CHAMPIONSHIP)
	// ===========================================================================

	finals: [
		// Championship: Winner of SF-0 vs Winner of SF-1
		{
			id: "final",
			date: "2026-02-22",
			player1: wesBos, // Placeholder - will be SF-0 winner
			// player2: undefined   // ← TBD (waiting for SF-1 result)
			// winner: undefined    // ← CHAMPIONSHIP NOT PLAYED YET
		},
	],
};

export const emptyBracket: Bracket = {
	// 8 games in round 1 (games 0-3 left, 4-7 right)
	round1: [
		{ id: "r1-0", date: "" },
		{ id: "r1-1", date: "" },
		{ id: "r1-2", date: "" },
		{ id: "r1-3", date: "" },
		{ id: "r1-4", date: "" },
		{ id: "r1-5", date: "" },
		{ id: "r1-6", date: "" },
		{ id: "r1-7", date: "" },
	],
	// 4 games in quarters (games 0-1 left, 2-3 right)
	quarters: [
		{ id: "qf-0", date: "" },
		{ id: "qf-1", date: "" },
		{ id: "qf-2", date: "" },
		{ id: "qf-3", date: "" },
	],
	// 2 games in semis (game 0 left, 1 right)
	semis: [
		{ id: "sf-0", date: "" },
		{ id: "sf-1", date: "" },
	],
	// 1 championship game
	finals: [{ id: "final", date: "" }],
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/** Check if a player won a specific game */
export function isWinner(game: Game, player: Player): boolean {
	return game.winner?.id === player.id;
}

/** Check if a player lost a specific game (game must be complete) */
export function isLoser(game: Game, player: Player): boolean {
	if (!game.winner) return false;
	const wasInGame =
		game.player1?.id === player.id || game.player2?.id === player.id;
	return wasInGame && game.winner.id !== player.id;
}

/** Get all games as a flat array */
export function getAllGames(): Game[] {
	return [
		...bracket.round1,
		...bracket.quarters,
		...bracket.semis,
		...bracket.finals,
	];
}

/** Get a game by its ID */
export function getGameById(id: string): Game | undefined {
	return getAllGames().find((game) => game.id === id);
}

/** Split an array into left and right halves for display */
export function splitForDisplay<T>(games: T[]): { left: T[]; right: T[] } {
	const mid = Math.ceil(games.length / 2);
	return {
		left: games.slice(0, mid),
		right: games.slice(mid),
	};
}

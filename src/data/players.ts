// =============================================================================
// TOURNAMENT CONFIG
// =============================================================================

// Deadline for locking brackets (ISO 8601 format)
// After this time, no new brackets can be created or locked
export const BRACKET_DEADLINE = "2026-02-01T00:00:00Z";

// Total number of games in the bracket (8 + 4 + 2 + 1 = 15)
export const TOTAL_GAMES = 15;

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
// REAL PLAYERS (6 with actual card artwork)
// -----------------------------------------------------------------------------

export const wesBos: Player = {
	id: "wes-bos",
	name: "Wes Bos",
	photo: "/cards/wes bos card.jpg",
	byline: "Syntax.fm",
};

export const scottTolinski: Player = {
	id: "scott-tolinski",
	name: "Scott Tolinski",
	photo: "/cards/scott tolinski card.jpg",
	byline: "Level Up Tuts",
};

export const kevinPowell: Player = {
	id: "kevin-powell",
	name: "Kevin Powell",
	photo: "/cards/Kevin Powell Card.jpg",
	byline: "CSS Evangelist",
};

export const adamArgyle: Player = {
	id: "adam-argyle",
	name: "Adam Argyle",
	photo: "/cards/adam argyle card.jpg",
	byline: "Google Chrome",
};

export const adamWathan: Player = {
	id: "adam-wathan",
	name: "Adam Wathan",
	photo: "/cards/Adam Wathan Card.jpg",
	byline: "Tailwind CSS",
};

export const aniaKubow: Player = {
	id: "ania-kubow",
	name: "Ania Kubow",
	photo: "/cards/Ania Kubow card.jpg",
	byline: "Code with Ania",
};

export const cassidyWilliams: Player = {
	id: "cassidy-williams",
	name: "Cassidy Williams",
	photo: "/cards/cassidy williams card.jpg",
	byline: "Contenda",
};

export const joshComeau: Player = {
	id: "josh-comeau",
	name: "Josh Comeau",
	photo: "/cards/josh comeau card.jpg",
	byline: "CSS for JS Devs",
};

export const kyleCook: Player = {
	id: "kyle-cook",
	name: "Kyle Cook",
	photo: "/cards/kyle cook card.jpg",
	byline: "Web Dev Simplified",
};

// -----------------------------------------------------------------------------
// PLACEHOLDER PLAYERS (7 dummy CSS/web dev contestants)
// These use existing card images as placeholders
// -----------------------------------------------------------------------------

export const sarasoueidan: Player = {
	id: "sara-soueidan",
	name: "Sara Soueidan",
	photo: "/cards/Ania Kubow card.jpg",
	byline: "SVG Specialist",
};

export const unaMravos: Player = {
	id: "una-kravets",
	name: "Una Kravets",
	photo: "/cards/Adam Wathan Card.jpg",
	byline: "Google Chrome",
};

export const jenSimmons: Player = {
	id: "jen-simmons",
	name: "Jen Simmons",
	photo: "/cards/Kevin Powell Card.jpg",
	byline: "Apple WebKit",
};

export const bramus: Player = {
	id: "bramus",
	name: "Bramus",
	photo: "/cards/adam argyle card.jpg",
	byline: "Chrome DevRel",
};

export const rachelandrew: Player = {
	id: "rachel-andrew",
	name: "Rachel Andrew",
	photo: "/cards/scott tolinski card.jpg",
	byline: "CSS Grid Master",
};

export const stephaleruch: Player = {
	id: "stephanie-eckles",
	name: "Stephanie Eckles",
	photo: "/cards/Ania Kubow card.jpg",
	byline: "ModernCSS.dev",
};

export const cassiecodes: Player = {
	id: "cassie-evans",
	name: "Cassie Evans",
	photo: "/cards/wes bos card.jpg",
	byline: "GSAP & SVG",
};

export const mirisuzanne: Player = {
	id: "miriam-suzanne",
	name: "Miriam Suzanne",
	photo: "/cards/Kevin Powell Card.jpg",
	byline: "OddBird CSS",
};

export const cssninjatech: Player = {
	id: "css-ninja",
	name: "CSS Ninja",
	photo: "/cards/adam argyle card.jpg",
	byline: "Dark Arts of CSS",
};

// All players array (16 total for tournament bracket)
export const players: Player[] = [
	// Round 1 - Left side (Games 0-3)
	wesBos,
	scottTolinski,
	kevinPowell,
	adamArgyle,
	adamWathan,
	aniaKubow,
	cassidyWilliams,
	joshComeau,
	// Round 1 - Right side (Games 4-7)
	kyleCook,
	jenSimmons,
	bramus,
	rachelandrew,
	stephaleruch,
	cassiecodes,
	mirisuzanne,
	cssninjatech,
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

		// Game 0: Wes Bos vs Scott Tolinski
		{
			id: "r1-0",
			date: "2026-02-01",
			player1: wesBos,
			player2: scottTolinski,
			// winner: undefined    // ← GAME NOT PLAYED YET
		},
		// Game 1: Kevin Powell vs Adam Argyle
		{
			id: "r1-1",
			date: "2026-02-01",
			player1: kevinPowell,
			player2: adamArgyle,
			// winner: undefined    // ← GAME NOT PLAYED YET
		},
		// Game 2: Adam Wathan vs Ania Kubow
		{
			id: "r1-2",
			date: "2026-02-02",
			player1: adamWathan,
			player2: aniaKubow,
			// winner: undefined    // ← GAME NOT PLAYED YET
		},
		// Game 3: Cassidy Williams vs Josh Comeau
		{
			id: "r1-3",
			date: "2026-02-02",
			player1: cassidyWilliams,
			player2: joshComeau,
			// winner: undefined    // ← GAME NOT PLAYED YET
		},

		// ----- RIGHT SIDE (games 4-7) -----

		// Game 4: Kyle Cook vs Jen Simmons
		{
			id: "r1-4",
			date: "2026-02-01",
			player1: kyleCook,
			player2: jenSimmons,
			// winner: undefined    // ← GAME NOT PLAYED YET
		},
		// Game 5: Bramus vs Rachel Andrew
		{
			id: "r1-5",
			date: "2026-02-01",
			player1: bramus,
			player2: rachelandrew,
			// winner: undefined    // ← GAME NOT PLAYED YET
		},
		// Game 6: Stephanie Eckles vs Cassie Evans
		{
			id: "r1-6",
			date: "2026-02-02",
			player1: stephaleruch,
			player2: cassiecodes,
			// winner: undefined    // ← GAME NOT PLAYED YET
		},
		// Game 7: Miriam Suzanne vs CSS Ninja
		{
			id: "r1-7",
			date: "2026-02-02",
			player1: mirisuzanne,
			player2: cssninjatech,
			// winner: undefined    // ← GAME NOT PLAYED YET
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
			// player1: undefined   // ← TBD (R1-0 winner)
			// player2: undefined   // ← TBD (R1-1 winner)
			// winner: undefined    // ← GAME NOT PLAYED YET
		},
		// Game 1: Winner of R1-2 vs Winner of R1-3
		{
			id: "qf-1",
			date: "2026-02-08",
			// player1: undefined   // ← TBD (R1-2 winner)
			// player2: undefined   // ← TBD (R1-3 winner)
			// winner: undefined    // ← GAME NOT PLAYED YET
		},

		// ----- RIGHT SIDE (games 2-3) -----

		// Game 2: Winner of R1-4 vs Winner of R1-5
		{
			id: "qf-2",
			date: "2026-02-08",
			// player1: undefined   // ← TBD (R1-4 winner)
			// player2: undefined   // ← TBD (R1-5 winner)
			// winner: undefined    // ← GAME NOT PLAYED YET
		},
		// Game 3: Winner of R1-6 vs Winner of R1-7
		{
			id: "qf-3",
			date: "2026-02-08",
			// player1: undefined   // ← TBD (R1-6 winner)
			// player2: undefined   // ← TBD (R1-7 winner)
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
			// player1: undefined   // ← TBD (QF-0 winner)
			// player2: undefined   // ← TBD (QF-1 winner)
			// winner: undefined    // ← GAME NOT PLAYED YET
		},

		// ----- RIGHT SIDE (game 1) -----

		// Game 1: Winner of QF-2 vs Winner of QF-3
		{
			id: "sf-1",
			date: "2026-02-15",
			// player1: undefined   // ← TBD (QF-2 winner)
			// player2: undefined   // ← TBD (QF-3 winner)
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
			// player1: undefined   // ← TBD (SF-0 winner)
			// player2: undefined   // ← TBD (SF-1 winner)
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

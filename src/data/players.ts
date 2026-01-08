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
	id: 'wes-bos',
	name: 'Wes Bos',
	photo: '/cards/wes.jpg',
	byline: 'Syntax.fm',
};

export const kevinPowell: Player = {
	id: 'kevin-powell',
	name: 'Kevin Powell',
	photo: '/cards/kevin.jpg',
	byline: 'CSS Evangelist',
};

export const scottTolinski: Player = {
	id: 'scott-tolinski',
	name: 'Scott Tolinski',
	photo: '/cards/scott.jpg',
	byline: 'Level Up Tuts',
};

export const adamWathan: Player = {
	id: 'adam-wathan',
	name: 'Adam Wathan',
	photo: '/cards/wes.jpg',
	byline: 'Tailwind CSS',
};

export const jheyTompkins: Player = {
	id: 'jhey-tompkins',
	name: 'Jhey Tompkins',
	photo: '/cards/kevin.jpg',
	byline: 'CSS Wizard',
};

export const unaKravets: Player = {
	id: 'una-kravets',
	name: 'Una Kravets',
	photo: '/cards/scott.jpg',
	byline: 'Google Chrome',
};

export const joshComeau: Player = {
	id: 'josh-comeau',
	name: 'Josh Comeau',
	photo: '/cards/wes.jpg',
	byline: 'CSS for JS Devs',
};

export const miriamSuzanne: Player = {
	id: 'miriam-suzanne',
	name: 'Miriam Suzanne',
	photo: '/cards/kevin.jpg',
	byline: 'OddBird',
};

export const leaVerou: Player = {
	id: 'lea-verou',
	name: 'Lea Verou',
	photo: '/cards/scott.jpg',
	byline: 'CSS WG',
};

export const bramus: Player = {
	id: 'bramus',
	name: 'Bramus',
	photo: '/cards/wes.jpg',
	byline: 'Google Chrome',
};

export const adamArgyle: Player = {
	id: 'adam-argyle',
	name: 'Adam Argyle',
	photo: '/cards/kevin.jpg',
	byline: 'Open UI',
};

export const stephanieEckles: Player = {
	id: 'stephanie-eckles',
	name: 'Stephanie Eckles',
	photo: '/cards/scott.jpg',
	byline: 'ModernCSS.dev',
};

export const rachelAndrew: Player = {
	id: 'rachel-andrew',
	name: 'Rachel Andrew',
	photo: '/cards/wes.jpg',
	byline: 'Google Chrome',
};

export const chenHuiJing: Player = {
	id: 'chen-hui-jing',
	name: 'Chen Hui Jing',
	photo: '/cards/kevin.jpg',
	byline: 'Mozilla',
};

export const saraSoueidan: Player = {
	id: 'sara-soueidan',
	name: 'Sara Soueidan',
	photo: '/cards/scott.jpg',
	byline: 'Accessibility',
};

export const cassieEvans: Player = {
	id: 'cassie-evans',
	name: 'Cassie Evans',
	photo: '/cards/wes.jpg',
	byline: 'GSAP',
};

// All players array
export const players: Player[] = [
	wesBos,
	kevinPowell,
	scottTolinski,
	adamWathan,
	jheyTompkins,
	unaKravets,
	joshComeau,
	miriamSuzanne,
	leaVerou,
	bramus,
	adamArgyle,
	stephanieEckles,
	rachelAndrew,
	chenHuiJing,
	saraSoueidan,
	cassieEvans,
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
	player1: Player; // First player (always required)
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

		// Game 0: Wes Bos vs Kevin Powell
		{
			id: 'r1-0',
			date: '2026-02-01',
			player1: wesBos,
			player2: kevinPowell,
			winner: wesBos, // ← Wes won!
		},
		// Game 1: Scott Tolinski vs Adam Wathan
		{
			id: 'r1-1',
			date: '2026-02-01',
			player1: scottTolinski,
			player2: adamWathan,
			winner: scottTolinski, // ← Scott won!
		},
		// Game 2: Jhey Tompkins vs Una Kravets
		{
			id: 'r1-2',
			date: '2026-02-02',
			player1: jheyTompkins,
			player2: unaKravets,
			winner: unaKravets, // ← Una won!
		},
		// Game 3: Josh Comeau vs Miriam Suzanne
		{
			id: 'r1-3',
			date: '2026-02-02',
			player1: joshComeau,
			player2: miriamSuzanne,
			winner: joshComeau, // ← Josh won!
		},

		// ----- RIGHT SIDE (games 4-7) -----

		// Game 4: Lea Verou vs Bramus
		{
			id: 'r1-4',
			date: '2026-02-01',
			player1: leaVerou,
			player2: bramus,
			winner: leaVerou, // ← Lea won!
		},
		// Game 5: Adam Argyle vs Stephanie Eckles
		{
			id: 'r1-5',
			date: '2026-02-01',
			player1: adamArgyle,
			player2: stephanieEckles,
			winner: stephanieEckles, // ← Stephanie won!
		},
		// Game 6: Rachel Andrew vs Chen Hui Jing
		{
			id: 'r1-6',
			date: '2026-02-02',
			player1: rachelAndrew,
			player2: chenHuiJing,
			winner: rachelAndrew, // ← Rachel won!
		},
		// Game 7: Sara Soueidan vs Cassie Evans
		{
			id: 'r1-7',
			date: '2026-02-02',
			player1: saraSoueidan,
			player2: cassieEvans,
			winner: cassieEvans, // ← Cassie won!
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
			id: 'qf-0',
			date: '2026-02-08',
			player1: wesBos, // Winner of Game 0
			player2: scottTolinski, // Winner of Game 1
			winner: wesBos, // ← Wes won!
		},
		// Game 1: Winner of R1-2 vs Winner of R1-3
		{
			id: 'qf-1',
			date: '2026-02-08',
			player1: unaKravets, // Winner of Game 2
			player2: joshComeau, // Winner of Game 3
			winner: joshComeau, // ← Josh won!
		},

		// ----- RIGHT SIDE (games 2-3) -----

		// Game 2: Winner of R1-4 vs Winner of R1-5
		{
			id: 'qf-2',
			date: '2026-02-08',
			player1: leaVerou, // Winner of Game 4
			player2: stephanieEckles, // Winner of Game 5
			winner: leaVerou, // ← Lea won!
		},
		// Game 3: Winner of R1-6 vs Winner of R1-7
		{
			id: 'qf-3',
			date: '2026-02-08',
			player1: rachelAndrew, // Winner of Game 6
			player2: cassieEvans, // Winner of Game 7
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
			id: 'sf-0',
			date: '2026-02-15',
			player1: wesBos, // Winner of QF Game 0
			player2: joshComeau, // Winner of QF Game 1
			// winner: undefined    // ← GAME NOT PLAYED YET
		},

		// ----- RIGHT SIDE (game 1) -----

		// Game 1: Winner of QF-2 vs Winner of QF-3
		{
			id: 'sf-1',
			date: '2026-02-15',
			player1: leaVerou, // Winner of QF Game 2
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
			id: 'final',
			date: '2026-02-22',
			player1: wesBos, // Placeholder - will be SF-0 winner
			// player2: undefined   // ← TBD (waiting for SF-1 result)
			// winner: undefined    // ← CHAMPIONSHIP NOT PLAYED YET
		},
	],
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
		game.player1.id === player.id || game.player2?.id === player.id;
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

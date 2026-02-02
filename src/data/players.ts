// =============================================================================
// PLAYER DEFINITIONS
// =============================================================================
// Each player needs: id (slug), name, photo path, and byline
// Photos are in /public/avatars/

export type Player = {
	id: string;
	name: string;
	photo: string;
	byline: string;
};

// -----------------------------------------------------------------------------
// ALL PLAYERS
// -----------------------------------------------------------------------------

export const jasonLengstorf: Player = {
	id: "jason-lengstorf",
	name: "Jason Lengstorf",
	photo: "/avatars/jason-lengstorf.png",
	byline: "TV for devs @CodeTV",
};

export const kyleCook: Player = {
	id: "kyle-cook",
	name: "Kyle Cook",
	photo: "/avatars/kyle-cook.png",
	byline: "@WebDevSimplified | Full Stack Dev",
};

export const adamWathan: Player = {
	id: "adam-wathan",
	name: "Adam Wathan",
	photo: "/avatars/adam-wathan.png",
	byline: "Founder + CEO @Tailwind Labs",
};

export const juliaMiocene: Player = {
	id: "julia-miocene",
	name: "Julia Miocene",
	photo: "/avatars/julia-miocene.png",
	byline: "Product Designer + Google Dev Expert",
};

export const chrisCoyier: Player = {
	id: "chris-coyier",
	name: "Chris Coyier",
	photo: "/avatars/chris-coyier.png",
	byline: "CSS-Tricks + CodePen Co-Founder",
};

export const breeHall: Player = {
	id: "bree-hall",
	name: "Bree Hall",
	photo: "/avatars/bree-hall.png",
	byline: "Sr. Dev Advocate @Atlassian",
};

export const scottTolinski: Player = {
	id: "scott-tolinski",
	name: "Scott Tolinski",
	photo: "/avatars/scott-tolinski.png",
	byline: "Co-Host @Syntax",
};

export const shaundaiPerson: Player = {
	id: "shaundai-person",
	name: "Shaundai Person",
	photo: "/avatars/shaundai-person.png",
	byline: "Sr. Software Engineer @Netflix",
};

export const kevinPowell: Player = {
	id: "kevin-powell",
	name: "Kevin Powell",
	photo: "/avatars/kevin-powell.png",
	byline: "CSS Evangelist",
};

export const joshComeau: Player = {
	id: "josh-comeau",
	name: "Josh Comeau",
	photo: "/avatars/josh-comeau.png",
	byline: "Whimsical Developer + Educator",
};

export const cassidyWilliams: Player = {
	id: "cassidy-williams",
	name: "Cassidy Williams",
	photo: "/avatars/cassidy-williams.png",
	byline: "Sr. Director of Dev Advocacy @GitHub",
};

export const wesBos: Player = {
	id: "wes-bos",
	name: "Wes Bos",
	photo: "/avatars/wes-bos.png",
	byline: "Co-Host @Syntax",
};

export const aniaKubow: Player = {
	id: "ania-kubow",
	name: "Ania Kubow",
	photo: "/avatars/ania-kubow.png",
	byline: "Software Developer + Course Creator",
};

export const adamArgyle: Player = {
	id: "adam-argyle",
	name: "Adam Argyle",
	photo: "/avatars/adam-argyle.png",
	byline: "CSS Genius + CSSWG member",
};

export const benHong: Player = {
	id: "ben-hong",
	name: "Ben Hong",
	photo: "/avatars/ben-hong.png",
	byline: "@BenCodeZen | Vue.js Core Team",
};

export const amyDutton: Player = {
	id: "amy-dutton",
	name: "Amy Dutton",
	photo: "/avatars/amy-dutton.png",
	byline: "@SelfTeachMe | Maintainer Redwoodjs",
};

// All players array
export const players: Player[] = [
	jasonLengstorf,
	kyleCook,
	adamWathan,
	juliaMiocene,
	chrisCoyier,
	breeHall,
	scottTolinski,
	shaundaiPerson,
	kevinPowell,
	joshComeau,
	cassidyWilliams,
	wesBos,
	aniaKubow,
	adamArgyle,
	benHong,
	amyDutton,
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

	round1: [
		// ----- LEFT SIDE (games 0-3) -----

		// Game 0: Jason Lengstorf vs Kyle Cook (Web Dev Simplified)
		{
			id: "r1-0",
			date: "2026-02-01",
			player1: jasonLengstorf,
			player2: kyleCook,
		},
		// Game 1: Adam Wathan vs Julia Miocene
		{
			id: "r1-1",
			date: "2026-02-01",
			player1: adamWathan,
			player2: juliaMiocene,
		},
		// Game 2: Chris Coyier vs Bree Hall
		{
			id: "r1-2",
			date: "2026-02-02",
			player1: chrisCoyier,
			player2: breeHall,
		},
		// Game 3: Scott Tolinski vs Shaundai Person
		{
			id: "r1-3",
			date: "2026-02-02",
			player1: scottTolinski,
			player2: shaundaiPerson,
		},

		// ----- RIGHT SIDE (games 4-7) -----

		// Game 4: Kevin Powell vs Amy Dutton
		{
			id: "r1-4",
			date: "2026-02-01",
			player1: kevinPowell,
			player2: amyDutton,
		},
		// Game 5: Josh Comeau vs Cassidy Williams
		{
			id: "r1-5",
			date: "2026-02-01",
			player1: joshComeau,
			player2: cassidyWilliams,
		},
		// Game 6: Wes Bos vs TBD
		{
			id: "r1-6",
			date: "2026-02-02",
			player1: wesBos,
			player2: benHong,
		},
		// Game 7: Ania Kubow vs Adam Argyle
		{
			id: "r1-7",
			date: "2026-02-02",
			player1: aniaKubow,
			player2: adamArgyle,
		},
	],

	// ===========================================================================
	// QUARTERFINALS - 4 games, 8 players
	// ===========================================================================
	// Games 0-1: LEFT side | Games 2-3: RIGHT side

	quarters: [
		{ id: "qf-0", date: "" },
		{ id: "qf-1", date: "" },
		{ id: "qf-2", date: "" },
		{ id: "qf-3", date: "" },
	],

	// ===========================================================================
	// SEMIFINALS - 2 games, 4 players
	// ===========================================================================
	// Game 0: LEFT side | Game 1: RIGHT side

	semis: [
		{ id: "sf-0", date: "" },
		{ id: "sf-1", date: "" },
	],

	// ===========================================================================
	// FINALS - 1 game, 2 players (CHAMPIONSHIP)
	// ===========================================================================

	finals: [{ id: "final", date: "" }],
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

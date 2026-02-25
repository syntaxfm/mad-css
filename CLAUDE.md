# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Project Overview

Mad CSS is a TanStack Start application for "The Ultimate CSS Tournament" - an
event website featuring 16 developers battling for CSS glory. Built with React
19, TanStack Router, and deploys to Cloudflare Workers.

## Commands

**Package manager: pnpm**

```bash
# Development
pnpm dev          # Start dev server on port 3000
[Note] I will run the dev command myself unless otherwise specified

# Build & Deploy
pnpm build        # Build for production
pnpm deploy       # Build and deploy to Cloudflare Workers

# Code Quality
pnpm check        # Run Biome linter and formatter checks
pnpm lint         # Lint only
pnpm format       # Format only

# Testing
pnpm test         # Run Vitest tests

# Database
pnpm db:generate      # Generate Drizzle migrations from schema
pnpm db:migrate:local # Apply migrations to local D1
pnpm db:migrate:prod  # Apply migrations to production D1
pnpm db:studio        # Open Drizzle Studio
pnpm db:setup         # Generate + migrate local (full setup)
```

## Database Setup

### Prerequisites

- Cloudflare account with D1 access
- `CLOUDFLARE_ACCOUNT_ID` environment variable set

### Local Development

1. Create D1 database (first time only):
   ```bash
   npx wrangler d1 create mad-css-db
   ```
2. Copy the `database_id` from output to `wrangler.jsonc`
3. Generate the better-auth schema:
   ```bash
   npx @better-auth/cli generate --output src/db/schema.ts
   ```
4. Generate and apply migrations:
   ```bash
   npm run db:setup
   ```

### Environment Variables

Create `.dev.vars` file (not committed):

```
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
BETTER_AUTH_SECRET=your_random_secret
BETTER_AUTH_URL=http://localhost:3000
```

### GitHub OAuth Setup

1. Go to GitHub Settings > Developer settings > OAuth Apps > New OAuth App
2. Fill in:
   - **Application name:** Mad CSS (Local) or similar
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:**
     `http://localhost:3000/api/auth/callback/github`
3. Click "Register application"
4. Copy the **Client ID** to `GITHUB_CLIENT_ID` in `.dev.vars`
5. Generate a new **Client Secret** and copy to `GITHUB_CLIENT_SECRET`

The login flow redirects to `/` after authentication.

### Production Deployment

1. Set secrets in Cloudflare dashboard (Workers > Settings > Variables):
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
   - `BETTER_AUTH_SECRET`
   - `BETTER_AUTH_URL` (your production URL)
2. Apply migrations:
   ```bash
   npm run db:migrate:prod
   ```

## Architecture

**Stack:** TanStack Start (SSR framework) + React 19 + Vite + Cloudflare Workers

**File-based routing:** Routes live in `src/routes/`. TanStack Router
auto-generates `src/routeTree.gen.ts` - don't edit this file manually.

**Key directories:**

- `src/routes/` - Page components and API routes
- `src/routes/__root.tsx` - Root layout, includes Header and devtools
- `src/components/` - Reusable components (Header, Ticket, LoginSection,
  bracket/, roster/, footer/, rules/)
- `src/lib/` - Auth setup (better-auth) and utilities (cfImage.ts for Cloudflare
  Images)
- `src/data/` - Player data (players.ts with 16 contestants)
- `src/styles/` - CSS files imported directly into components
- `public/` - Static assets (logos, images, card artwork)

**Path alias:** `@/*` maps to `./src/*`

**Styling:** Plain CSS with CSS custom properties defined in
`src/styles/styles.css`. Uses custom fonts (Kaltjer, CollegiateBlackFLF, Inter)
and texture backgrounds.

## Design System & Aesthetic

The app has a **retro sports tournament / arcade** aesthetic inspired by vintage
ticket stubs, torn paper textures, and classic sports programs.

### Color Palette

```css
--orange: #f3370e; /* Primary accent, CTAs, highlights */
--yellow: #ffae00; /* Secondary accent, warnings, badges */
--black: #000000; /* Borders, shadows, text */
--white: #ffffff; /* Text on dark backgrounds */
--beige: #f5eeda; /* Paper/background color */
```

### Typography

- **Block/Display:** `Alfa Slab One` (`--font-block`) - Headlines, buttons,
  badges. Always uppercase with letter-spacing (0.05-0.1em)
- **Serif:** Custom serif font (`--font-serif`) - Body text, descriptions
- **Sans:** `Inter` (`--font-sans`) - UI elements, small text

### Key Design Patterns

**Borders & Shadows:**

- 3-4px solid black borders on interactive elements
- 4px black box-shadows that shift on hover/active states
- Button hover: `transform: translate(2px, 2px)` + reduced shadow
- Button active: `transform: translate(4px, 4px)` + no shadow

**Torn Paper Edges:**

- Use CSS `mask-image` with paper texture PNGs
- Top edge: `repeating-paper-top.png`
- Bottom edge: `repeating-paper-bottom.png`
- Combined with `mask-composite: exclude`

**Ticket Stub Elements:**

- Dashed tear lines (4px dashed borders)
- Notched edges using radial gradients
- Barcode decorations
- "ADMIT ONE" style typography

**Buttons:**

```css
.button {
  background: var(--yellow);
  border: 3px solid var(--black);
  box-shadow: 4px 4px 0 var(--black);
  font-family: var(--font-block);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition:
    transform 0.1s,
    box-shadow 0.1s;
}
.button:hover {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0 var(--black);
}
.button:active {
  transform: translate(4px, 4px);
  box-shadow: none;
}
```

**Cards/Containers:**

- Beige (`--beige`) or yellow (`--yellow`) backgrounds
- Thick black borders (4-6px)
- Optional torn paper mask on edges

**Status Badges:**

- Uppercase, small font (0.625-0.75rem)
- Solid fill for active states (yellow bg, black text)
- Outline style for inactive states (transparent bg, colored border)

### What to Avoid

- Rounded corners (keep things sharp/angular)
- Gradients (except for mask effects)
- Drop shadows (use solid offset shadows only)
- Generic sans-serif styling
- Soft/pastel colors

## Code Style

- Biome for linting/formatting (tabs, double quotes)
- TypeScript strict mode
- XY Flow library for tournament bracket visualization

## Bracket System

**Tournament structure (FEEDER_GAMES in Bracket.tsx):**

- 16 players, single elimination bracket
- Left side games: r1-0, r1-1, r1-2, r1-3 → qf-0, qf-1 → sf-0
- Right side games: r1-4, r1-5, r1-6, r1-7 → qf-2, qf-3 → sf-1
- Finals: sf-0 winner vs sf-1 winner

**Tournament stages (sequential order):**

1. Left R1 - games r1-0, r1-1, r1-2, r1-3
2. Right R1 - games r1-4, r1-5, r1-6, r1-7
3. QF - games qf-0, qf-1, qf-2, qf-3 (all together)
4. SF - games sf-0, sf-1 (semifinals)
5. Finals

**Node sizing logic (`isNodeLarge()` in Bracket.tsx):**

- A node is "large" (`round1` class, ~130px with bio) when:
  - Its feeder game IS decided (we know the player)
  - The current game is NOT decided (active round)
- A node is "small" (`later` class, ~90px, no bio) when:
  - Its feeder is NOT decided (TBD state), OR
  - The current game IS already decided (completed)

**Dynamic Y positioning:**

- Node Y offsets adjust based on `isNodeLarge()` to center nodes properly
- QF: 0.5 (large) vs 0.62 (small)
- SF: 1.35 (large) vs 1.5 (small)
- Finals: 3.35 (large) vs 3.5 (small)

**Key constants (Bracket.tsx):**

- `NODE_HEIGHT = 70`, `VERTICAL_GAP = 76`, `MATCH_GAP = 146`
- `ROUND_GAP = 220` (horizontal spacing between rounds)

**User picking flow:**

- Users can pick winners for games where both players are known
- Picks stored in `predictions` object keyed by game ID
- `isPickable` flag enables click handlers on player nodes

## Comment Policy

### Unacceptable Comments

- Comments that repeat what code does
- Commented-out code (delete it)
- Obvious comments ("increment counter")
- Comments instead of good naming

### Principle

Code should be self-documenting. If you need a comment to explain WHAT the code
does, consider refactoring to make it clearer.

# AGENTS.md

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
pnpm db:migrate:local    # Apply migrations to local D1
pnpm db:migrate:staging  # Apply migrations to staging D1
pnpm db:migrate:prod     # Apply migrations to production D1
pnpm db:studio           # Open Drizzle Studio
pnpm db:setup            # Generate + migrate local (full setup)
```

## Architecture

**Stack:** TanStack Start (SSR framework) + React 19 + Vite + Cloudflare Workers

**File-based routing:** Routes live in `src/routes/`. TanStack Router
auto-generates `src/routeTree.gen.ts` - don't edit this file manually.

**Key directories:**

- `src/routes/` - Page components and API routes
- `src/routes/__root.tsx` - Root layout, includes Header and devtools
- `src/components/` - Reusable components (Header, Ticket, LoginSection,
  bracket/, roster/, footer/, rules/, leaderboard/, merch/, prizes/, scoreboard/)
- `src/context/` - React context providers (PredictionsContext for tournament
  prediction state)
- `src/hooks/` - Custom hooks (useCountdown, usePredictions, usePredictionsQuery)
- `src/lib/` - Auth (better-auth), utilities (cfImage.ts, scoring.ts,
  simulation.ts, users.server.ts, admin.ts), middleware/, schemas/
- `src/db/` - Drizzle database schema (index.ts, schema.ts)
- `src/data/` - Player data (players.ts with 16 contestants, bracket config,
  FEEDER_GAMES, GAME_SCHEDULE)
- `src/styles/` - CSS files imported directly into components
- `public/` - Static assets (logos, images, card artwork, fonts)

**Path alias:** `@/*` maps to `./src/*`

**Styling:** Plain CSS with CSS custom properties defined in
`src/styles/styles.css`. Uses custom fonts (custom "serif" face from
`public/fonts/serif.woff2`, Alfa Slab One, Inter) and texture backgrounds.

## Design System & Aesthetic

The app has a **retro sports tournament / arcade** aesthetic inspired by vintage
ticket stubs, torn paper textures, and classic sports programs.

### Color Palette

```css
--orange: #f3370e;  /* Primary accent, CTAs, highlights */
--yellow: #ffae00;  /* Secondary accent, warnings, badges */
--black: #000000;   /* Borders, shadows, text */
--white: #ffffff;   /* Text on dark backgrounds */
--beige: #f5eeda;   /* Paper/background color */
--bluesky: #0f73ff; /* Bluesky brand color */
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

**Buttons (see `src/styles/buttons.css`):**

Base class `.btn` is required. Compose with variant and size classes.

- **Variants:** `.btn-primary` (yellow), `.btn-danger` (orange), `.btn-dark` (black), `.btn-ghost` (beige), `.btn-outline` (orange border on beige)
- **Sizes:** `.btn-xs`, `.btn-sm`, (default), `.btn-lg`

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

## CSS Style

**Use modern CSS.** This codebase uses cutting-edge CSS features throughout.
Write CSS the same way -- prefer modern solutions over legacy patterns.

**Required patterns:**

- **Nesting:** Use `&` nesting for pseudo-classes, variants, child selectors,
  and media queries. Never write flat disconnected selectors.
- **Custom properties:** Use the existing design tokens (`--orange`, `--yellow`,
  `--black`, `--white`, `--beige`, `--font-block`, `--font-serif`, `--font-sans`).
  Define component-scoped custom properties for repeated values.
- **Logical properties:** Use `padding-inline`, `padding-block`, `margin-inline`,
  `border-block`, `inset`, etc. instead of physical directions.
- **Container queries:** Use `container-type` / `@container` for component-level
  responsive design. Use container query units (`cqi`, `cqb`, `cqh`) for sizing
  relative to containers.
- **Individual transforms:** Use `translate`, `rotate`, `scale` as standalone
  properties instead of the `transform` shorthand where possible.
- **`text-wrap: balance`** on headings, **`text-wrap: pretty`** on paragraphs.
- **`text-box: trim-both cap alphabetic`** for precise text box trimming.
- **`@starting-style`** for entry animations on newly inserted elements.
- **`@property`** for typed custom properties that need to be animated.
- **`aspect-ratio`** instead of padding hacks.
- **`:has()`** for parent/sibling selection instead of JS class toggling.
- **`@supports`** for progressive enhancement of experimental features
  (e.g. `corner-shape: scoop`).

**Font sizes:** Use `px` for font sizes. Do not use `rem` or `em` for font
sizing. Container query units (`cqi`, `cqb`) are fine when sizing relative to a
container.

**Keep CSS minimal:** Only set properties you are intentionally changing. Do not
redundantly set `color`, `line-height`, `font-size`, `font-family`, or other
inherited properties that are already correct from the cascade. Let styles
inherit naturally.

**Do not use:**

- BEM naming (no `__` or `--` in class names). Use plain class names with nesting.
- `rem` or `em` for font sizes -- use `px`.
- Vendor prefixes (except `-webkit-backdrop-filter` which still needs it).
- `@import` in CSS files (handled by the build tool).
- Preprocessors (Sass, Less, etc.) -- vanilla CSS only.

## Code Style

- Biome for linting/formatting (tabs, double quotes)
- TypeScript strict mode
- `@xyflow/react` (React Flow / XY Flow) for tournament bracket visualization

## Bracket System

**Tournament structure (FEEDER_GAMES in `src/data/players.ts`):**

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

**Node sizing logic (`round` prop on `PlayerNode`, defined in `nodeGenerators.ts`):**

- A node is `"round1"` (~130px with bio) when the player is known and the game
  is active (not yet decided)
- A node is `"later"` (~90px, no bio) when the player is TBD or the game is
  already completed

**Key constants (`src/components/bracket/nodeGenerators.ts`):**

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

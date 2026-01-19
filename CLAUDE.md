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
   - **Homepage URL:** `http://localhost:3000/test`
   - **Authorization callback URL:**
     `http://localhost:3000/api/auth/callback/github`
3. Click "Register application"
4. Copy the **Client ID** to `GITHUB_CLIENT_ID` in `.dev.vars`
5. Generate a new **Client Secret** and copy to `GITHUB_CLIENT_SECRET`

The login flow redirects to `/test` after authentication.

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

## Code Style

- Biome for linting/formatting (tabs, double quotes)
- TypeScript strict mode
- XY Flow library for tournament bracket visualization

## Comment Policy

### Unacceptable Comments

- Comments that repeat what code does
- Commented-out code (delete it)
- Obvious comments ("increment counter")
- Comments instead of good naming

### Principle

Code should be self-documenting. If you need a comment to explain WHAT the code
does, consider refactoring to make it clearer.

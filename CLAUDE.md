# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mad CSS is a TanStack Start application for "The Ultimate CSS Tournament" - an event website featuring 16 developers battling for CSS glory. Built with React 19, TanStack Router, and deploys to Cloudflare Workers.

## Commands

```bash
# Development
npm run dev          # Start dev server on port 3000

# Build & Deploy
npm run build        # Build for production
npm run deploy       # Build and deploy to Cloudflare Workers

# Code Quality
npm run check        # Run Biome linter and formatter checks
npm run lint         # Lint only
npm run format       # Format only

# Testing
npm run test         # Run Vitest tests

# Database
npm run db:generate      # Generate Drizzle migrations from schema
npm run db:migrate:local # Apply migrations to local D1
npm run db:migrate:prod  # Apply migrations to production D1
npm run db:studio        # Open Drizzle Studio
npm run db:setup         # Generate + migrate local (full setup)
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

**File-based routing:** Routes live in `src/routes/`. TanStack Router auto-generates `src/routeTree.gen.ts` - don't edit this file manually.

**Key directories:**

- `src/routes/` - Page components and API routes
- `src/routes/__root.tsx` - Root layout, includes Header and devtools
- `src/components/` - Reusable components (Header, Ticket, Roster)
- `src/styles/` - CSS files imported directly into components
- `public/` - Static assets (logos, images)

**Path alias:** `@/*` maps to `./src/*`

**Styling:** Plain CSS with CSS custom properties defined in `src/styles/styles.css`. Uses custom fonts (Kaltjer, CollegiateBlackFLF, Inter) and texture backgrounds.

## Code Style

- Biome for linting/formatting (tabs, double quotes)
- TypeScript strict mode

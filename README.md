![](./public/mad-css-logo.svg)

# Mad CSS

The website behind [madcss.com](https://madcss.com) — The Ultimate CSS Tournament. 16 developers battle it out for CSS glory. Brought to you by [Syntax.fm](https://syntax.fm)

## What It Does

- Interactive single-elimination tournament bracket (16 players)
- User predictions — pick winners before each round
- GitHub OAuth login
- Personalized ticket stubs with OG image generation
- Live schedule and results
- Player roster with bios

## The Stack

- **Framework:** [TanStack Start](https://tanstack.com/start)
- **Styling:** Plain CSS + custom properties
- **Database:** Cloudflare D1 + Drizzle ORM
- **Auth:** better-auth (GitHub OAuth)
- **Bracket Viz:** React Flow
- **OG Images:** workers-og
- **Monitoring:** Sentry
- **Hosting:** Cloudflare Workers
- **Tooling:** Biome, Vitest, pnpm

## Local Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Create a Cloudflare D1 database

```bash
npx wrangler d1 create mad-css-db
```

Copy the `database_id` from the output into `wrangler.jsonc`.

### 3. Set up environment variables

Create a `.dev.vars` file in the project root:

```
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
BETTER_AUTH_SECRET=your_random_secret
BETTER_AUTH_URL=http://localhost:3000
```

### 4. Set up GitHub OAuth

1. Go to **GitHub Settings > Developer settings > OAuth Apps > New OAuth App**
2. Set **Homepage URL** to `http://localhost:3000`
3. Set **Callback URL** to `http://localhost:3000/api/auth/callback/github`
4. Copy the Client ID and Client Secret into `.dev.vars`

### 5. Set up the database

```bash
pnpm db:setup  # Generates Drizzle migrations + applies them locally
```

### 6. Run it

```bash
pnpm dev
```

## Database

Schema changes go through Drizzle.

```bash
pnpm db:generate       # Generate migration from schema changes
pnpm db:migrate:local  # Apply migrations locally
pnpm db:migrate:prod   # Apply migrations to production
pnpm db:setup          # Generate + migrate local in one shot
pnpm db:studio         # Browse the database
```

## Created By

Thanks to [Serg](https://x.com/sergical) from [Sentry](https://sentry.io) and [Wes][https://x.com/wesbos] for building


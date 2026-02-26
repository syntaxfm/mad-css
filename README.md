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
- Merch store powered by Shopify (cached via Cloudflare KV)

## The Stack

- **Framework:** [TanStack Start](https://tanstack.com/start)
- **Styling:** Plain CSS + custom properties
- **Database:** Cloudflare D1 + Drizzle ORM
- **Cache:** Cloudflare KV (merch product data)
- **Auth:** better-auth with GitHub OAuth
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

### 6. Create a KV namespace (optional, for merch caching)

```bash
npx wrangler kv namespace create mad-css-kv
```

Copy the `id` from the output into the `kv_namespaces` section of `wrangler.jsonc`. The merch section fetches products from the Sentry Shop Shopify store and caches them in KV for 1 hour. If no KV binding is available, it fetches directly from Shopify on every request.

### 7. Run it

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

Thanks to [Serg](https://x.com/sergical) from [Sentry](https://sentry.io) and [Wes](https://x.com/wesbos) for building

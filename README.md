# MAD CSS

## Development

Just `pnpm install` then `pnpm dev`

## Database

Schema changes go through Drizzle. Generate a migration after editing the schema, then apply it.

```bash
# Generate migration from schema changes
pnpm db:generate

# Apply migrations locally (uses wrangler D1 --local)
pnpm db:migrate:local

# Apply migrations to production
pnpm db:migrate:prod

# Apply migrations to staging
pnpm db:migrate:staging

# Both generate + migrate local in one shot
pnpm db:setup

# Browse the database
pnpm db:studio
```

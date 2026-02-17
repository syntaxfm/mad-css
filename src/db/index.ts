import { instrumentD1WithSentry } from "@sentry/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export type Database = ReturnType<typeof createDb>;

export function createDb(d1: D1Database) {
	return drizzle(instrumentD1WithSentry(d1), { schema });
}

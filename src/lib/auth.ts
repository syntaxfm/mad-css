import type { D1Database } from "@cloudflare/workers-types";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { createDb } from "@/db";
import * as schema from "@/db/schema";

export function createAuth(d1: D1Database) {
	const db = createDb(d1);

	return betterAuth({
		database: drizzleAdapter(db, {
			provider: "sqlite",
			schema,
		}),
		socialProviders: {
			github: {
				clientId: process.env.GITHUB_CLIENT_ID!,
				clientSecret: process.env.GITHUB_CLIENT_SECRET!,
			},
		},
		plugins: [tanstackStartCookies()],
	});
}

export type Auth = ReturnType<typeof createAuth>;

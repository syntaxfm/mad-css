import * as Sentry from "@sentry/tanstackstart-react";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { createDb } from "@/db";
import * as schema from "@/db/schema";

export function createAuth(d1: D1Database) {
	try {
		const db = createDb(d1);
		return betterAuth({
			baseURL: process.env.BETTER_AUTH_URL,
			database: drizzleAdapter(db, {
				provider: "sqlite",
				schema,
			}),
			trustedOrigins: [
				"http://localhost:3000",
				process.env.BETTER_AUTH_URL,
			].filter(Boolean) as string[],
			socialProviders: {
				github: {
					clientId: process.env.GITHUB_CLIENT_ID || "",
					clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
					mapProfileToUser: (profile) => ({
						username:
							profile.login ||
							profile.name?.toLowerCase().replace(/\s+/g, "") ||
							undefined,
					}),
				},
			},
			user: {
				additionalFields: {
					username: {
						type: "string",
						required: false,
					},
				},
			},
			plugins: [tanstackStartCookies()],
		});
	} catch (error) {
		Sentry.captureException(error);
		throw error;
	}
}

export type Auth = ReturnType<typeof createAuth>;

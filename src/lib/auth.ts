import * as Sentry from "@sentry/tanstackstart-react";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { eq } from "drizzle-orm";
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
						username: profile.login,
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
			databaseHooks: {
				user: {
					create: {
						after: async (user) => {
							// Backfill username from GitHub account if not set
							if (!user.username) {
								const accounts = await db
									.select()
									.from(schema.account)
									.where(eq(schema.account.userId, user.id));
								const githubAccount = accounts.find(
									(a) => a.providerId === "github",
								);
								if (githubAccount?.accountId) {
									// accountId is the GitHub user ID, we'll fetch the username via API
									// For now, use the name as fallback
									const username =
										user.name?.toLowerCase().replace(/\s+/g, "") || null;
									if (username) {
										await db
											.update(schema.user)
											.set({ username })
											.where(eq(schema.user.id, user.id));
									}
								}
							}
						},
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

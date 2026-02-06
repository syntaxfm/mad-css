import { and, eq } from "drizzle-orm";
import type { Database } from "@/db";
import * as schema from "@/db/schema";

// GitHub User IDs (immutable, verified via `gh api users/{username}`)
// These NEVER change even if the user changes their GitHub username
export const ADMIN_GITHUB_IDS = [
	"176013", // wesbos
	"669383", // stolinski
	"14241866", // w3cj
	"3760543", // sergical
] as const;

/**
 * SERVER-SIDE ONLY: Check if a user is an admin by querying their GitHub account ID
 * This is the ONLY secure way to check admin status - never trust client-supplied data
 */
export async function isAdminUser(
	db: Database,
	userId: string,
): Promise<boolean> {
	const githubAccount = await db
		.select({ accountId: schema.account.accountId })
		.from(schema.account)
		.where(
			and(
				eq(schema.account.userId, userId),
				eq(schema.account.providerId, "github"),
			),
		)
		.get();

	if (!githubAccount) return false;
	return ADMIN_GITHUB_IDS.includes(
		githubAccount.accountId as (typeof ADMIN_GITHUB_IDS)[number],
	);
}

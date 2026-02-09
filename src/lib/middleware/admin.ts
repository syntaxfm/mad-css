import type { D1Database } from "@cloudflare/workers-types";
import { createDb } from "@/db";
import { isAdminUser } from "@/lib/admin";
import { createAuth } from "@/lib/auth";

type AdminResult =
	| { success: true; user: { id: string; name: string; email: string } }
	| { success: false; response: Response };

/**
 * Validates request authentication and admin status.
 * Use in admin API handlers to reduce auth boilerplate.
 */
export async function requireAdmin(
	request: Request,
	d1: D1Database,
): Promise<AdminResult> {
	const auth = createAuth(d1);
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session?.user) {
		return {
			success: false,
			response: new Response(JSON.stringify({ error: "Unauthorized" }), {
				status: 401,
				headers: { "Content-Type": "application/json" },
			}),
		};
	}

	const db = createDb(d1);
	const isAdmin = await isAdminUser(db, session.user.id);

	if (!isAdmin) {
		return {
			success: false,
			response: new Response(JSON.stringify({ error: "Forbidden" }), {
				status: 403,
				headers: { "Content-Type": "application/json" },
			}),
		};
	}

	return {
		success: true,
		user: session.user,
	};
}

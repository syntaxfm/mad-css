import type { D1Database } from "@cloudflare/workers-types";
import { createAuth } from "@/lib/auth";

type AuthResult =
	| { success: true; user: { id: string; name: string; email: string } }
	| { success: false; response: Response };

/**
 * Validates request authentication and returns user or error response.
 * Use in API handlers to reduce auth boilerplate.
 */
export async function requireAuth(
	request: Request,
	db: D1Database,
): Promise<AuthResult> {
	const auth = createAuth(db);
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

	return {
		success: true,
		user: session.user,
	};
}

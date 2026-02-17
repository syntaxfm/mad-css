import type { D1Database } from "@cloudflare/workers-types";
import * as Sentry from "@sentry/tanstackstart-react";
import { createAuth } from "@/lib/auth";

type AuthResult =
	| { success: true; user: { id: string; name: string; email: string } }
	| { success: false; response: Response };

export async function requireAuth(
	request: Request,
	db: D1Database,
): Promise<AuthResult> {
	return Sentry.startSpan(
		{ name: "auth.requireAuth", op: "auth" },
		async () => {
			const auth = createAuth(db);
			const session = await auth.api.getSession({
				headers: request.headers,
			});

			if (!session?.user) {
				return {
					success: false as const,
					response: new Response(JSON.stringify({ error: "Unauthorized" }), {
						status: 401,
						headers: { "Content-Type": "application/json" },
					}),
				};
			}

			return {
				success: true as const,
				user: session.user,
			};
		},
	);
}

import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { createDb } from "@/db";
import { userBracketStatus } from "@/db/schema";
import { requireAdmin } from "@/lib/middleware/admin";

const unlockRequestSchema = z.object({
	userId: z.string().min(1).max(50),
});

export const Route = createFileRoute("/api/admin/brackets/unlock")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const authResult = await requireAdmin(request, env.DB);
				if (!authResult.success) return authResult.response;

				let body: unknown;
				try {
					body = await request.json();
				} catch {
					return new Response(
						JSON.stringify({ error: "Invalid JSON in request body" }),
						{
							status: 400,
							headers: { "Content-Type": "application/json" },
						},
					);
				}

				const validationResult = unlockRequestSchema.safeParse(body);
				if (!validationResult.success) {
					return new Response(
						JSON.stringify({ error: "Invalid request: userId is required" }),
						{
							status: 400,
							headers: { "Content-Type": "application/json" },
						},
					);
				}

				const { userId } = validationResult.data;

				const db = createDb(env.DB);

				// Update bracket status to unlocked
				const updateResult = await db
					.update(userBracketStatus)
					.set({ isLocked: false, lockedAt: null })
					.where(eq(userBracketStatus.userId, userId))
					.returning();

				if (updateResult.length === 0) {
					return new Response(
						JSON.stringify({ error: "Bracket status not found" }),
						{
							status: 404,
							headers: { "Content-Type": "application/json" },
						},
					);
				}

				return new Response(JSON.stringify({ success: true }), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				});
			},
		},
	},
});

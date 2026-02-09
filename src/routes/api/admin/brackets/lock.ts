import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { createDb } from "@/db";
import { userBracketStatus } from "@/db/schema";
import { requireAdmin } from "@/lib/middleware/admin";

const lockRequestSchema = z.object({
	userId: z.string().min(1).max(50),
});

export const Route = createFileRoute("/api/admin/brackets/lock")({
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

				const validationResult = lockRequestSchema.safeParse(body);
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

				// Upsert bracket status to locked
				await db
					.insert(userBracketStatus)
					.values({
						id: crypto.randomUUID(),
						userId,
						isLocked: true,
						lockedAt: new Date(),
					})
					.onConflictDoUpdate({
						target: userBracketStatus.userId,
						set: { isLocked: true, lockedAt: new Date() },
					});

				return new Response(JSON.stringify({ success: true }), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				});
			},
		},
	},
});

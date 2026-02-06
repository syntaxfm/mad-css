import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { useEffect, useState } from "react";
import { z } from "zod";
import { TOTAL_GAMES } from "@/data/players";
import { invalidateAllPredictions } from "@/hooks/usePredictionsQuery";
import type { AdminStats, AdminUser } from "@/routes/api/admin/users";
import "@/styles/admin.css";

const PAGE_SIZE = 20;

const adminDataInputSchema = z.object({
	page: z.number().int().positive().default(1),
	search: z.string().max(100).default(""),
});

interface PaginationData {
	page: number;
	pageSize: number;
	totalCount: number;
	totalPages: number;
}

// Server function to check admin status (for beforeLoad redirect)
const checkAdminFn = createServerFn({ method: "GET" }).handler(async () => {
	const { env } = await import("cloudflare:workers");
	const { createAuth } = await import("@/lib/auth");
	const { createDb } = await import("@/db");
	const { isAdminUser } = await import("@/lib/admin");

	const headers = getRequestHeaders();
	const auth = createAuth(env.DB);
	const session = await auth.api.getSession({
		headers: new Headers(headers),
	});

	if (!session?.user) {
		return { authorized: false as const };
	}

	const db = createDb(env.DB);
	const isAdmin = await isAdminUser(db, session.user.id);

	if (!isAdmin) {
		return { authorized: false as const };
	}

	return { authorized: true as const };
});

// Server function to fetch paginated admin data
const getAdminDataFn = createServerFn({ method: "GET" })
	.inputValidator((data: unknown) => adminDataInputSchema.parse(data ?? {}))
	.handler(async ({ data }) => {
		const { env } = await import("cloudflare:workers");
		const { createAuth } = await import("@/lib/auth");
		const { createDb } = await import("@/db");
		const { isAdminUser } = await import("@/lib/admin");
		const { count, desc, eq, like, sql } = await import("drizzle-orm");
		const schema = await import("@/db/schema");

		const page = data.page;
		const searchRaw = data.search.trim();
		// Escape LIKE wildcards to prevent unintended pattern matching
		const search = searchRaw.replace(/[%_]/g, "\\$&");

		const headers = getRequestHeaders();
		const auth = createAuth(env.DB);
		const session = await auth.api.getSession({
			headers: new Headers(headers),
		});

		if (!session?.user) {
			return { authorized: false as const };
		}

		const db = createDb(env.DB);
		const isAdmin = await isAdminUser(db, session.user.id);

		if (!isAdmin) {
			return { authorized: false as const };
		}

		// Build base query with optional search filter
		const baseQuery = search
			? db
					.select({
						id: schema.user.id,
						name: schema.user.name,
						username: schema.user.username,
						image: schema.user.image,
					})
					.from(schema.user)
					.where(like(schema.user.username, `%${search}%`))
			: db
					.select({
						id: schema.user.id,
						name: schema.user.name,
						username: schema.user.username,
						image: schema.user.image,
					})
					.from(schema.user);

		// Get total count for pagination
		const countQuery = search
			? db
					.select({ count: count() })
					.from(schema.user)
					.where(like(schema.user.username, `%${search}%`))
			: db.select({ count: count() }).from(schema.user);

		const [{ count: totalCount }] = await countQuery;

		// Fetch paginated users
		const offset = (page - 1) * PAGE_SIZE;
		const users = await baseQuery
			.orderBy(desc(schema.user.createdAt))
			.limit(PAGE_SIZE)
			.offset(offset);

		// Get bracket statuses for these users
		const userIds = users.map((u) => u.id);
		const bracketStatuses =
			userIds.length > 0
				? await db
						.select()
						.from(schema.userBracketStatus)
						.where(
							sql`${schema.userBracketStatus.userId} IN (${sql.join(
								userIds.map((id) => sql`${id}`),
								sql`, `,
							)})`,
						)
				: [];

		// Get prediction counts for these users
		const predictionCounts =
			userIds.length > 0
				? await db
						.select({
							userId: schema.userPrediction.userId,
							count: count(),
						})
						.from(schema.userPrediction)
						.where(
							sql`${schema.userPrediction.userId} IN (${sql.join(
								userIds.map((id) => sql`${id}`),
								sql`, `,
							)})`,
						)
						.groupBy(schema.userPrediction.userId)
				: [];

		// Get scores for these users
		const scores =
			userIds.length > 0
				? await db
						.select()
						.from(schema.userScore)
						.where(
							sql`${schema.userScore.userId} IN (${sql.join(
								userIds.map((id) => sql`${id}`),
								sql`, `,
							)})`,
						)
				: [];

		// Map data
		const statusMap = new Map(
			bracketStatuses.map((s) => [
				s.userId,
				{ isLocked: s.isLocked, lockedAt: s.lockedAt },
			]),
		);
		const predictionMap = new Map(
			predictionCounts.map((p) => [p.userId, p.count]),
		);
		const scoreMap = new Map(scores.map((s) => [s.userId, s.totalScore]));

		const adminUsers: AdminUser[] = users.map((user) => ({
			id: user.id,
			name: user.name,
			username: user.username,
			image: user.image,
			isLocked: statusMap.get(user.id)?.isLocked ?? false,
			lockedAt: statusMap.get(user.id)?.lockedAt?.getTime() ?? null,
			predictionsCount: predictionMap.get(user.id) ?? 0,
			totalScore: scoreMap.get(user.id) ?? 0,
		}));

		// Get global stats (not filtered by search) using COUNT queries
		const [{ count: allUsersCount }] = await db
			.select({ count: count() })
			.from(schema.user);

		const [{ count: lockedCount }] = await db
			.select({ count: count() })
			.from(schema.userBracketStatus)
			.where(eq(schema.userBracketStatus.isLocked, true));
		const stats: AdminStats = {
			totalUsers: allUsersCount,
			lockedBrackets: lockedCount,
			unlockedBrackets: allUsersCount - lockedCount,
		};

		return {
			authorized: true as const,
			users: adminUsers,
			stats,
			pagination: {
				page,
				pageSize: PAGE_SIZE,
				totalCount,
				totalPages: Math.ceil(totalCount / PAGE_SIZE),
			},
		};
	});

export const Route = createFileRoute("/admin")({
	beforeLoad: async () => {
		const data = await checkAdminFn();
		if (!data.authorized) {
			throw redirect({ to: "/" });
		}
		return data;
	},
	loader: async () => {
		const result = await getAdminDataFn({ data: { page: 1, search: "" } });
		if (!result.authorized) {
			throw redirect({ to: "/" });
		}
		return result;
	},
	component: AdminPage,
});

function StatCard({ label, value }: { label: string; value: number }) {
	const digits = String(value).split("");
	return (
		<div className="stat-card">
			<h3>{label}</h3>
			<div className="stat-digits">
				{digits.map((digit, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: static digit positions
					<span key={i} className="stat-digit">
						{digit}
					</span>
				))}
			</div>
		</div>
	);
}

function AdminPage() {
	const loaderData = Route.useLoaderData();
	const queryClient = useQueryClient();

	const [users, setUsers] = useState<AdminUser[]>(loaderData.users);
	const [stats, setStats] = useState<AdminStats>(loaderData.stats);
	const [pagination, setPagination] = useState<PaginationData>(
		loaderData.pagination,
	);
	const [message, setMessage] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);
	const [isCalculating, setIsCalculating] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [searchInput, setSearchInput] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [unlockingUserId, setUnlockingUserId] = useState<string | null>(null);

	// Fetch data function for subsequent requests (pagination, search)
	const fetchData = async (page: number, search: string) => {
		setIsLoading(true);
		try {
			const result = await getAdminDataFn({ data: { page, search } });
			if (result.authorized) {
				setUsers(result.users);
				setStats(result.stats);
				setPagination(result.pagination);
			}
		} finally {
			setIsLoading(false);
		}
	};

	// Debounce search input and fetch results
	// biome-ignore lint/correctness/useExhaustiveDependencies: fetchData is stable
	useEffect(() => {
		const timer = setTimeout(() => {
			if (searchInput !== searchQuery) {
				setSearchQuery(searchInput);
				fetchData(1, searchInput);
			}
		}, 300);
		return () => clearTimeout(timer);
	}, [searchInput, searchQuery]);

	const handlePageChange = (newPage: number) => {
		fetchData(newPage, searchQuery);
	};

	const handleRecalculateScores = async () => {
		setIsCalculating(true);
		setMessage(null);

		try {
			const response = await fetch("/api/leaderboard/calculate", {
				method: "POST",
			});

			const data = (await response.json()) as {
				updated?: number;
				error?: string;
			};

			if (response.ok) {
				setMessage({
					type: "success",
					text: `Recalculated scores for ${data.updated} users.`,
				});
				// Refresh current page data
				fetchData(pagination.page, searchQuery);
			} else {
				setMessage({
					type: "error",
					text: data.error || "Failed to recalculate scores",
				});
			}
		} catch {
			setMessage({ type: "error", text: "Network error while calculating" });
		} finally {
			setIsCalculating(false);
		}
	};

	const handleUnlockBracket = async (userId: string, userName: string) => {
		if (!confirm(`Unlock bracket for ${userName}?`)) return;

		setUnlockingUserId(userId);
		setMessage(null);

		try {
			const response = await fetch("/api/admin/brackets/unlock", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ userId }),
			});

			const data = (await response.json()) as {
				success?: boolean;
				error?: string;
			};

			if (response.ok) {
				setMessage({
					type: "success",
					text: `Unlocked bracket for ${userName}`,
				});
				// Invalidate predictions cache so unlocked user sees fresh data
				invalidateAllPredictions(queryClient);
				// Refresh current page data
				fetchData(pagination.page, searchQuery);
			} else {
				setMessage({
					type: "error",
					text: data.error || "Failed to unlock bracket",
				});
			}
		} catch {
			setMessage({ type: "error", text: "Network error while unlocking" });
		} finally {
			setUnlockingUserId(null);
		}
	};

	return (
		<div className="admin-page">
			<div className="admin-header">
				<h1>Admin Dashboard</h1>
				<Link to="/" className="admin-btn">
					Back to Site
				</Link>
			</div>

			<div className="admin-stats">
				<StatCard label="Total Users" value={stats.totalUsers} />
				<StatCard label="Locked Brackets" value={stats.lockedBrackets} />
				<StatCard label="Unlocked Brackets" value={stats.unlockedBrackets} />
			</div>

			{message && (
				<div className={`admin-message ${message.type}`}>{message.text}</div>
			)}

			<div className="admin-actions">
				<button
					type="button"
					className="admin-btn"
					onClick={handleRecalculateScores}
					disabled={isCalculating}
				>
					{isCalculating ? "Calculating..." : "Recalculate All Scores"}
				</button>
			</div>

			<div className="admin-search">
				<input
					type="text"
					placeholder="Search by username..."
					value={searchInput}
					onChange={(e) => setSearchInput(e.target.value)}
					className="admin-search-input"
				/>
			</div>

			<div className="admin-table-container">
				<table className={`admin-table ${isLoading ? "loading" : ""}`}>
					<thead>
						<tr>
							<th>User</th>
							<th>Status</th>
							<th>Picks</th>
							<th>Score</th>
							<th>Locked On</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{users.length === 0 ? (
							<tr>
								<td colSpan={6} className="no-results">
									{isLoading ? "Loading..." : "No users found"}
								</td>
							</tr>
						) : (
							users.map((user) => (
								<tr key={user.id}>
									<td>
										<div className="user-cell">
											{user.image ? (
												<img
													src={user.image}
													alt={user.name}
													className="user-avatar"
												/>
											) : (
												<div className="user-avatar" />
											)}
											<div className="user-info">
												<span className="user-name">{user.name}</span>
												{user.username && (
													<span className="user-username">
														@{user.username}
													</span>
												)}
											</div>
										</div>
									</td>
									<td>
										<span
											className={`status-badge ${user.isLocked ? "locked" : "unlocked"}`}
										>
											{user.isLocked ? "Locked" : "Unlocked"}
										</span>
									</td>
									<td className="numeric">
										{user.predictionsCount}/{TOTAL_GAMES}
									</td>
									<td className="numeric">{user.totalScore}</td>
									<td className="numeric">
										{user.lockedAt
											? new Date(user.lockedAt).toLocaleDateString()
											: "-"}
									</td>
									<td className="actions-cell">
										{user.username && user.isLocked && (
											<>
												<Link
													to="/bracket/$username"
													params={{ username: user.username }}
													className="view-bracket-link"
												>
													View
												</Link>
												<button
													type="button"
													className="unlock-btn"
													onClick={() =>
														handleUnlockBracket(user.id, user.name)
													}
													disabled={unlockingUserId === user.id}
												>
													{unlockingUserId === user.id ? "..." : "Unlock"}
												</button>
											</>
										)}
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{pagination.totalPages > 1 && (
				<div className="admin-pagination">
					<button
						type="button"
						className="pagination-btn"
						onClick={() => handlePageChange(pagination.page - 1)}
						disabled={pagination.page <= 1 || isLoading}
					>
						Prev
					</button>
					<span className="pagination-info">
						Page {pagination.page} of {pagination.totalPages}
					</span>
					<button
						type="button"
						className="pagination-btn"
						onClick={() => handlePageChange(pagination.page + 1)}
						disabled={pagination.page >= pagination.totalPages || isLoading}
					>
						Next
					</button>
				</div>
			)}
		</div>
	);
}

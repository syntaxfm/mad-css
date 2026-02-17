import * as Sentry from "@sentry/tanstackstart-react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { useEffect, useState } from "react";
import { z } from "zod";
import { TOTAL_GAMES } from "@/data/players";
import {
	SIMULATION_STAGES,
	type SimulationStage,
	STAGE_CONFIG,
} from "@/lib/simulation";
import { deleteUserFn, generateTestUserFn } from "@/lib/users.server";
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
		const { count, desc, like, sql } = await import("drizzle-orm");
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

		// Get prediction counts for these users
		const userIds = users.map((u) => u.id);
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
		const predictionMap = new Map(
			predictionCounts.map((p) => [p.userId, p.count]),
		);
		const scoreMap = new Map(scores.map((s) => [s.userId, s.totalScore]));

		const adminUsers: AdminUser[] = users.map((user) => ({
			id: user.id,
			name: user.name,
			username: user.username,
			image: user.image,
			predictionsCount: predictionMap.get(user.id) ?? 0,
			totalScore: scoreMap.get(user.id) ?? 0,
		}));

		// Get global stats
		const [{ count: allUsersCount }] = await db
			.select({ count: count() })
			.from(schema.user);

		// Count users who have at least one prediction
		const [{ count: usersWithPicks }] = await db
			.select({
				count: sql<number>`COUNT(DISTINCT ${schema.userPrediction.userId})`,
			})
			.from(schema.userPrediction);

		const stats: AdminStats = {
			totalUsers: allUsersCount,
			usersWithPicks,
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

const testSentryServerFn = createServerFn({ method: "POST" }).handler(
	async () => {
		const Sentry = await import("@sentry/tanstackstart-react");
		Sentry.captureException(new Error("[Sentry Test] Server error capture"));
		Sentry.captureMessage("[Sentry Test] Server message");
		await Sentry.flush(3000);
		return { success: true };
	},
);

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
	const [isGenerating, setIsGenerating] = useState(false);
	const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [searchInput, setSearchInput] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [simStage, setSimStage] = useState<SimulationStage | "">("");

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
			const body: { simulationStage?: string } = {};
			if (simStage) {
				body.simulationStage = simStage;
			}

			const response = await fetch("/api/leaderboard/calculate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});

			const data = (await response.json()) as {
				updated?: number;
				simulated?: boolean;
				error?: string;
			};

			if (response.ok) {
				const label = simStage
					? `(simulated: ${STAGE_CONFIG[simStage].label})`
					: "(live data)";
				setMessage({
					type: "success",
					text: `Recalculated scores for ${data.updated} users ${label}.`,
				});
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

	const handleGenerateTestUser = async () => {
		setIsGenerating(true);
		setMessage(null);

		try {
			const result = await generateTestUserFn();
			if (result.success) {
				setMessage({
					type: "success",
					text: `Created ${result.name} with ${result.predictionsCount} predictions.`,
				});
				fetchData(pagination.page, searchQuery);
			} else {
				setMessage({
					type: "error",
					text: result.error || "Failed to generate test user",
				});
			}
		} catch {
			setMessage({ type: "error", text: "Failed to generate test user" });
		} finally {
			setIsGenerating(false);
		}
	};

	const handleDeleteUser = async (userId: string, userName: string) => {
		if (!confirm(`Delete ${userName} and all their associated data?`)) return;
		setDeletingUserId(userId);
		setMessage(null);

		try {
			const result = await deleteUserFn({ data: { userId } });
			if (result.success) {
				setMessage({
					type: "success",
					text: `Deleted ${result.name} and all associated data.`,
				});
				fetchData(pagination.page, searchQuery);
			} else {
				setMessage({
					type: "error",
					text: result.error || "Failed to delete user",
				});
			}
		} catch {
			setMessage({ type: "error", text: "Failed to delete user" });
		} finally {
			setDeletingUserId(null);
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
				<StatCard label="Users with Picks" value={stats.usersWithPicks} />
			</div>

			{message && (
				<div className={`admin-message ${message.type}`}>{message.text}</div>
			)}

			<div className="admin-actions">
				<div className="admin-action-group">
					<select
						className="admin-select"
						value={simStage}
						onChange={(e) =>
							setSimStage(e.target.value as SimulationStage | "")
						}
					>
						<option value="">Live Data</option>
						{SIMULATION_STAGES.map((stage) => (
							<option key={stage} value={stage}>
								Sim: {STAGE_CONFIG[stage].label}
							</option>
						))}
					</select>
					<button
						type="button"
						className="admin-btn"
						onClick={handleRecalculateScores}
						disabled={isCalculating}
					>
						{isCalculating ? "Calculating..." : "Recalculate All Scores"}
					</button>
				</div>
				<button
					type="button"
					className="admin-btn"
					onClick={handleGenerateTestUser}
					disabled={isGenerating}
				>
					{isGenerating ? "Generating..." : "Generate Test User"}
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
							<th>Picks</th>
							<th>Score</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{users.length === 0 ? (
							<tr>
								<td colSpan={4} className="no-results">
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
									<td className="numeric">
										{user.predictionsCount}/{TOTAL_GAMES}
									</td>
									<td className="numeric">{user.totalScore}</td>
									<td className="actions-cell">
										{user.username && (
											<Link
												to="/bracket/$username"
												params={{ username: user.username }}
												className="view-bracket-link"
											>
												View
											</Link>
										)}
										<button
											type="button"
											className="delete-user-btn"
											onClick={() => handleDeleteUser(user.id, user.name)}
											disabled={deletingUserId === user.id}
										>
											{deletingUserId === user.id ? "..." : "Delete"}
										</button>
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

			<SentryDiagnostics />
		</div>
	);
}

function SentryDiagnostics() {
	const [status, setStatus] = useState<string | null>(null);

	const testClientError = () => {
		Sentry.captureException(new Error("[Sentry Test] Client error capture"));
		setStatus("Client error sent — check Sentry Issues");
	};

	const testServer = async () => {
		setStatus("Sending...");
		const result = await testSentryServerFn();
		setStatus(
			result.success
				? "Server error + message sent — check Sentry Issues"
				: "Server test failed",
		);
	};

	return (
		<div className="admin-actions" style={{ marginTop: "2rem" }}>
			<h2>Sentry Diagnostics</h2>
			<div className="admin-action-group">
				<button type="button" className="admin-btn" onClick={testClientError}>
					Test Client Error
				</button>
				<button type="button" className="admin-btn" onClick={testServer}>
					Test Server Error
				</button>
			</div>
			{status && <div className="admin-message success">{status}</div>}
		</div>
	);
}

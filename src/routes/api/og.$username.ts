import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { ImageResponse } from "workers-og";
import { type Player, players } from "@/data/players";
import { createDb } from "@/db";
import * as schema from "@/db/schema";

export const Route = createFileRoute("/api/og/$username")({
	server: {
		handlers: {
			GET: async ({ params, request }) => {
				const { username } = params;
				const url = new URL(request.url);
				const db = createDb(env.DB);

				// Find user by username
				const users = await db
					.select({
						id: schema.user.id,
						name: schema.user.name,
						image: schema.user.image,
						username: schema.user.username,
					})
					.from(schema.user)
					.where(eq(schema.user.username, username))
					.limit(1);

				if (users.length === 0 || !users[0].username) {
					return new Response("User not found", { status: 404 });
				}

				const user = users[0];

				// Check if bracket is locked
				const bracketStatus = await db
					.select()
					.from(schema.userBracketStatus)
					.where(eq(schema.userBracketStatus.userId, users[0].id))
					.limit(1);

				if (!bracketStatus[0]?.isLocked) {
					return new Response("Bracket not locked", { status: 403 });
				}

				// Get ALL predictions
				const predictions = await db
					.select({
						gameId: schema.userPrediction.gameId,
						predictedWinnerId: schema.userPrediction.predictedWinnerId,
					})
					.from(schema.userPrediction)
					.where(eq(schema.userPrediction.userId, users[0].id));

				// Build prediction map
				const predictionMap = new Map<string, string>();
				for (const p of predictions) {
					predictionMap.set(p.gameId, p.predictedWinnerId);
				}

				// Helper to get player by id
				const getPlayer = (id: string): Player | null =>
					players.find((p) => p.id === id) ?? null;

				// Get predicted winner for a game
				const getWinner = (gameId: string): Player | null => {
					const winnerId = predictionMap.get(gameId);
					return winnerId ? getPlayer(winnerId) : null;
				};

				// Build absolute URLs
				const baseUrl = `${url.protocol}//${url.host}`;
				const logoUrl = `${baseUrl}/mad-css-logo.png`;
				const bgImageUrl = `${baseUrl}/madcss-wide.jpg`;
				const userAvatarUrl = user.image || "";

				const getPhotoUrl = (player: Player | null): string => {
					if (!player) return "";
					return player.photo.startsWith("http")
						? player.photo
						: `${baseUrl}${encodeURI(player.photo)}`;
				};

				// ============================================
				// LAYOUT CONSTANTS - Bigger avatars, full height
				// ============================================

				// Canvas: 1200 x 630
				// Avatars extend into logo/footer areas for maximum visibility
				const CENTER_X = 600;

				// Vertical positions
				const LOGO_Y = 90; // Logo center
				const CHAMP_Y = 340; // Champion center
				const USER_Y = 570; // User info center

				// R1 Y positions: expanded to use full height (Y: 50 → 582)
				const r1Y = [50, 126, 202, 278, 354, 430, 506, 582];

				// Avatar sizes (bigger for visibility)
				const SIZE_R1 = 55;
				const SIZE_QF = 65;
				const SIZE_SF = 80;
				const SIZE_FINAL = 90;
				const SIZE_CHAMP = 130;

				// X positions - adjusted for bigger avatars
				const X_R1_L = 50;
				const X_QF_L = 150;
				const X_SF_L = 270;
				const X_FINAL_L = 400;

				const X_R1_R = 1150;
				const X_QF_R = 1050;
				const X_SF_R = 930;
				const X_FINAL_R = 800;

				// Junction X positions for lines
				const JUNC_R1_QF_L = 100;
				const JUNC_QF_SF_L = 210;
				const JUNC_SF_FINAL_L = 335;

				const JUNC_R1_QF_R = 1100;
				const JUNC_QF_SF_R = 990;
				const JUNC_SF_FINAL_R = 865;

				// ============================================
				// HELPER FUNCTIONS
				// ============================================

				const avatar = (
					player: Player | null,
					x: number,
					y: number,
					size: number,
					options?: {
						border?: number;
						grayscale?: boolean;
						showName?: boolean;
					},
				) => {
					const border = options?.border ?? 3;
					const grayscale = options?.grayscale ?? false;
					const showName = options?.showName ?? false;
					const left = x - size / 2;
					const top = y - size / 2;
					const filter = grayscale ? "filter: grayscale(100%);" : "";

					let html = "";
					if (!player) {
						html = `<div style="display: flex; position: absolute; left: ${left}px; top: ${top}px; width: ${size}px; height: ${size}px; border-radius: 50%; background-color: #333; border: ${border}px solid #ffae00;"></div>`;
					} else {
						html = `<img src="${getPhotoUrl(player)}" style="position: absolute; left: ${left}px; top: ${top}px; width: ${size}px; height: ${size}px; border-radius: 50%; border: ${border}px solid #ffae00; object-fit: cover; ${filter}" />`;
					}

					if (showName && player) {
						const nameY = top + size + 4;
						const name = player.name.split(" ")[0]; // First name only
						html += `<span style="position: absolute; left: ${x}px; top: ${nameY}px; transform: translateX(-50%); color: #fff; font-size: 12px; font-weight: 700; font-family: system-ui; text-shadow: 0 1px 4px #000, 0 0 8px #000; white-space: nowrap;">${name}</span>`;
					}

					return html;
				};

				const hLine = (x1: number, x2: number, y: number) =>
					`<div style="display: flex; position: absolute; left: ${Math.min(x1, x2)}px; top: ${y - 1}px; width: ${Math.abs(x2 - x1)}px; height: 3px; background-color: #ffae00;"></div>`;

				const vLine = (x: number, y1: number, y2: number) =>
					`<div style="display: flex; position: absolute; left: ${x - 1}px; top: ${Math.min(y1, y2)}px; width: 3px; height: ${Math.abs(y2 - y1)}px; background-color: #ffae00;"></div>`;

				// ============================================
				// GET BRACKET DATA
				// ============================================

				const r1Left = players.slice(0, 8);
				const r1Right = players.slice(8, 16);

				// QF winners (results of R1 games)
				const qfLeftPlayers = [0, 1, 2, 3].map((i) => getWinner(`r1-${i}`));
				const qfRightPlayers = [0, 1, 2, 3].map((i) =>
					getWinner(`r1-${i + 4}`),
				);

				// SF winners (results of QF games)
				const sfLeftPlayers = [0, 1].map((i) => getWinner(`qf-${i}`));
				const sfRightPlayers = [0, 1].map((i) => getWinner(`qf-${i + 2}`));

				// Finals players (results of SF games)
				const finalLeft = getWinner("sf-0");
				const finalRight = getWinner("sf-1");

				// Champion
				const champion = getWinner("final");

				// ============================================
				// CALCULATE Y POSITIONS FOR EACH ROUND
				// ============================================

				// QF Y positions (midpoint between R1 pairs)
				const qfY = [0, 1, 2, 3].map((i) => (r1Y[i * 2] + r1Y[i * 2 + 1]) / 2);

				// SF Y positions (midpoint between QF pairs)
				const sfY = [0, 1].map((i) => (qfY[i * 2] + qfY[i * 2 + 1]) / 2);

				// Finals Y position = Champion Y
				const finalY = CHAMP_Y;

				// ============================================
				// BUILD BRACKET HTML
				// ============================================

				let bracketHtml = "";

				// --- LEFT SIDE ---

				// R1 avatars (grayscale if not picked)
				for (let i = 0; i < 8; i++) {
					const matchIndex = Math.floor(i / 2);
					const winner = getWinner(`r1-${matchIndex}`);
					const isLoser = winner && winner.id !== r1Left[i].id;
					bracketHtml += avatar(r1Left[i], X_R1_L, r1Y[i], SIZE_R1, {
						grayscale: isLoser,
					});
				}

				// R1 to QF lines
				for (let i = 0; i < 4; i++) {
					const y1 = r1Y[i * 2];
					const y2 = r1Y[i * 2 + 1];
					const midY = (y1 + y2) / 2;
					// Horizontal from R1 to junction
					bracketHtml += hLine(X_R1_L + SIZE_R1 / 2, JUNC_R1_QF_L, y1);
					bracketHtml += hLine(X_R1_L + SIZE_R1 / 2, JUNC_R1_QF_L, y2);
					// Vertical at junction
					bracketHtml += vLine(JUNC_R1_QF_L, y1, y2);
					// Horizontal from junction to QF
					bracketHtml += hLine(JUNC_R1_QF_L, X_QF_L - SIZE_QF / 2, midY);
				}

				// QF avatars (grayscale if lost to SF winner)
				for (let i = 0; i < 4; i++) {
					const sfIndex = Math.floor(i / 2);
					const sfWinner = sfLeftPlayers[sfIndex];
					const isLoser =
						sfWinner &&
						qfLeftPlayers[i] &&
						qfLeftPlayers[i]!.id !== sfWinner.id;
					bracketHtml += avatar(qfLeftPlayers[i], X_QF_L, qfY[i], SIZE_QF, {
						grayscale: isLoser,
					});
				}

				// QF to SF lines
				for (let i = 0; i < 2; i++) {
					const y1 = qfY[i * 2];
					const y2 = qfY[i * 2 + 1];
					const midY = (y1 + y2) / 2;
					bracketHtml += hLine(X_QF_L + SIZE_QF / 2, JUNC_QF_SF_L, y1);
					bracketHtml += hLine(X_QF_L + SIZE_QF / 2, JUNC_QF_SF_L, y2);
					bracketHtml += vLine(JUNC_QF_SF_L, y1, y2);
					bracketHtml += hLine(JUNC_QF_SF_L, X_SF_L - SIZE_SF / 2, midY);
				}

				// SF avatars (with names, grayscale if lost to Finals player)
				for (let i = 0; i < 2; i++) {
					const isLoser =
						finalLeft &&
						sfLeftPlayers[i] &&
						sfLeftPlayers[i]!.id !== finalLeft.id;
					bracketHtml += avatar(sfLeftPlayers[i], X_SF_L, sfY[i], SIZE_SF, {
						showName: true,
						grayscale: isLoser,
					});
				}

				// SF to Finals lines
				{
					const y1 = sfY[0];
					const y2 = sfY[1];
					bracketHtml += hLine(X_SF_L + SIZE_SF / 2, JUNC_SF_FINAL_L, y1);
					bracketHtml += hLine(X_SF_L + SIZE_SF / 2, JUNC_SF_FINAL_L, y2);
					bracketHtml += vLine(JUNC_SF_FINAL_L, y1, y2);
					bracketHtml += hLine(
						JUNC_SF_FINAL_L,
						X_FINAL_L - SIZE_FINAL / 2,
						finalY,
					);
				}

				// Finals avatar (left, with name, grayscale if lost to champion)
				const finalLeftLost =
					champion && finalLeft && finalLeft.id !== champion.id;
				bracketHtml += avatar(finalLeft, X_FINAL_L, finalY, SIZE_FINAL, {
					showName: true,
					grayscale: finalLeftLost,
				});

				// Finals to Champion line (left)
				bracketHtml += hLine(
					X_FINAL_L + SIZE_FINAL / 2,
					CENTER_X - SIZE_CHAMP / 2,
					finalY,
				);

				// --- RIGHT SIDE ---

				// R1 avatars (grayscale if not picked)
				for (let i = 0; i < 8; i++) {
					const matchIndex = Math.floor(i / 2) + 4; // r1-4 through r1-7
					const winner = getWinner(`r1-${matchIndex}`);
					const isLoser = winner && winner.id !== r1Right[i].id;
					bracketHtml += avatar(r1Right[i], X_R1_R, r1Y[i], SIZE_R1, {
						grayscale: isLoser,
					});
				}

				// R1 to QF lines
				for (let i = 0; i < 4; i++) {
					const y1 = r1Y[i * 2];
					const y2 = r1Y[i * 2 + 1];
					const midY = (y1 + y2) / 2;
					bracketHtml += hLine(X_R1_R - SIZE_R1 / 2, JUNC_R1_QF_R, y1);
					bracketHtml += hLine(X_R1_R - SIZE_R1 / 2, JUNC_R1_QF_R, y2);
					bracketHtml += vLine(JUNC_R1_QF_R, y1, y2);
					bracketHtml += hLine(JUNC_R1_QF_R, X_QF_R + SIZE_QF / 2, midY);
				}

				// QF avatars (grayscale if lost to SF winner)
				for (let i = 0; i < 4; i++) {
					const sfIndex = Math.floor(i / 2);
					const sfWinner = sfRightPlayers[sfIndex];
					const isLoser =
						sfWinner &&
						qfRightPlayers[i] &&
						qfRightPlayers[i]!.id !== sfWinner.id;
					bracketHtml += avatar(qfRightPlayers[i], X_QF_R, qfY[i], SIZE_QF, {
						grayscale: isLoser,
					});
				}

				// QF to SF lines
				for (let i = 0; i < 2; i++) {
					const y1 = qfY[i * 2];
					const y2 = qfY[i * 2 + 1];
					const midY = (y1 + y2) / 2;
					bracketHtml += hLine(X_QF_R - SIZE_QF / 2, JUNC_QF_SF_R, y1);
					bracketHtml += hLine(X_QF_R - SIZE_QF / 2, JUNC_QF_SF_R, y2);
					bracketHtml += vLine(JUNC_QF_SF_R, y1, y2);
					bracketHtml += hLine(JUNC_QF_SF_R, X_SF_R + SIZE_SF / 2, midY);
				}

				// SF avatars (with names, grayscale if lost to Finals player)
				for (let i = 0; i < 2; i++) {
					const isLoser =
						finalRight &&
						sfRightPlayers[i] &&
						sfRightPlayers[i]!.id !== finalRight.id;
					bracketHtml += avatar(sfRightPlayers[i], X_SF_R, sfY[i], SIZE_SF, {
						showName: true,
						grayscale: isLoser,
					});
				}

				// SF to Finals lines
				{
					const y1 = sfY[0];
					const y2 = sfY[1];
					bracketHtml += hLine(X_SF_R - SIZE_SF / 2, JUNC_SF_FINAL_R, y1);
					bracketHtml += hLine(X_SF_R - SIZE_SF / 2, JUNC_SF_FINAL_R, y2);
					bracketHtml += vLine(JUNC_SF_FINAL_R, y1, y2);
					bracketHtml += hLine(
						JUNC_SF_FINAL_R,
						X_FINAL_R + SIZE_FINAL / 2,
						finalY,
					);
				}

				// Finals avatar (right, with name, grayscale if lost to champion)
				const finalRightLost =
					champion && finalRight && finalRight.id !== champion.id;
				bracketHtml += avatar(finalRight, X_FINAL_R, finalY, SIZE_FINAL, {
					showName: true,
					grayscale: finalRightLost,
				});

				// Finals to Champion line (right)
				bracketHtml += hLine(
					X_FINAL_R - SIZE_FINAL / 2,
					CENTER_X + SIZE_CHAMP / 2,
					finalY,
				);

				// --- CHAMPION (yellow border only, no orange ring) ---
				const champLeft = CENTER_X - SIZE_CHAMP / 2;
				const champTop = CHAMP_Y - SIZE_CHAMP / 2;

				if (champion) {
					bracketHtml += `
						<img src="${getPhotoUrl(champion)}" style="position: absolute; left: ${champLeft}px; top: ${champTop}px; width: ${SIZE_CHAMP}px; height: ${SIZE_CHAMP}px; border-radius: 50%; border: 4px solid #ffae00; object-fit: cover;" />
					`;
				} else {
					bracketHtml += `
						<div style="display: flex; position: absolute; left: ${champLeft}px; top: ${champTop}px; width: ${SIZE_CHAMP}px; height: ${SIZE_CHAMP}px; border-radius: 50%; background-color: #333; border: 4px solid #ffae00;"></div>
					`;
				}

				// Champion name (24px font)
				bracketHtml += `
					<span style="position: absolute; left: ${CENTER_X}px; top: ${CHAMP_Y + SIZE_CHAMP / 2 + 8}px; transform: translateX(-50%); color: #fff; font-size: 24px; font-weight: 900; font-family: system-ui; text-shadow: 0 2px 8px #000, 0 0 20px #000;">${champion?.name ?? "Champion"}</span>
				`;

				// ============================================
				// FULL HTML
				// ============================================

				const html = `
				<div style="display: flex; width: 1200px; height: 630px; position: relative;">
					<!-- Background -->
					<img src="${bgImageUrl}" style="position: absolute; top: 0; left: 0; width: 1200px; height: 630px; object-fit: cover;" />

					<!-- Dark overlay -->
					<div style="display: flex; position: absolute; top: 0; left: 0; width: 1200px; height: 630px; background-color: #000; opacity: 0.5;"></div>

					<!-- Logo (top center, 120px height, centered at Y=90) -->
					<img src="${logoUrl}" style="position: absolute; left: ${CENTER_X}px; top: ${LOGO_Y - 60}px; transform: translateX(-50%); height: 120px;" />

					<!-- User info (bottom center, 60px avatar, 28px text, Y=570) -->
					<div style="display: flex; position: absolute; left: ${CENTER_X}px; top: ${USER_Y}px; transform: translate(-50%, -50%); align-items: center; gap: 12px;">
						${
							userAvatarUrl
								? `<img src="${userAvatarUrl}" style="width: 60px; height: 60px; border-radius: 50%; border: 3px solid #ffae00;" />`
								: `<div style="display: flex; width: 60px; height: 60px; border-radius: 50%; background-color: #f3370e; align-items: center; justify-content: center; border: 3px solid #ffae00;">
									<span style="color: #fff; font-size: 24px; font-weight: 900; font-family: system-ui;">${user.username?.charAt(0).toUpperCase() || "?"}</span>
								</div>`
						}
						<span style="color: #fff; font-size: 28px; font-weight: 700; font-family: system-ui; text-shadow: 0 2px 8px #000;">@${user.username}'s picks</span>
					</div>

					<!-- Bracket -->
					${bracketHtml}
				</div>`;

				const response = new ImageResponse(html, {
					width: 1200,
					height: 630,
				});

				response.headers.set(
					"Cache-Control",
					"public, max-age=3600, s-maxage=86400",
				);

				return response;
			},
		},
	},
});

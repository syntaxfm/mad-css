import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { ImageResponse } from "workers-og";
import { bracket, type Player, players } from "@/data/players";
import { createDb } from "@/db";
import * as schema from "@/db/schema";

// Generate a basic OG image for cases where user doesn't exist or bracket isn't locked
function generateBasicOgImage(baseUrl: string): Response {
	const logoUrl = `${baseUrl}/mad-css-logo.png`;
	const bgImageUrl = `${baseUrl}/madcss-wide.jpg`;

	const html = `
	<div style="display: flex; width: 1200px; height: 630px; position: relative; flex-direction: column; align-items: center; justify-content: center;">
		<!-- Background -->
		<img src="${bgImageUrl}" width="1200" height="630" style="position: absolute; top: 0; left: 0; width: 1200px; height: 630px; object-fit: cover;" />

		<!-- Dark overlay -->
		<div style="display: flex; position: absolute; top: 0; left: 0; width: 1200px; height: 630px; background-color: #000; opacity: 0.6;"></div>

		<!-- Logo (top center) -->
		<img src="${logoUrl}" width="160" height="160" style="position: absolute; top: 80px; left: 520px; width: 160px; height: 160px;" />

		<!-- Main text -->
		<span style="position: absolute; top: 280px; color: #fff; font-size: 72px; font-weight: 900; font-family: system-ui; text-shadow: 0 4px 16px #000;">March Mad CSS</span>

		<!-- Subtext -->
		<span style="position: absolute; top: 380px; color: #ffae00; font-size: 42px; font-weight: 700; font-family: system-ui; text-shadow: 0 2px 8px #000;">Fill out your bracket!</span>
	</div>`;

	const response = new ImageResponse(html, {
		width: 1200,
		height: 630,
	});

	response.headers.set("Cache-Control", "public, max-age=3600, s-maxage=86400");

	return response;
}

export const Route = createFileRoute("/api/og/$username")({
	server: {
		handlers: {
			GET: async ({ params, request }) => {
				const { username } = params;
				const url = new URL(request.url);
				const baseUrl = `${url.protocol}//${url.host}`;
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
					return generateBasicOgImage(baseUrl);
				}

				const user = users[0];

				// Check if bracket is locked
				const bracketStatus = await db
					.select()
					.from(schema.userBracketStatus)
					.where(eq(schema.userBracketStatus.userId, users[0].id))
					.limit(1);

				if (!bracketStatus[0]?.isLocked) {
					return generateBasicOgImage(baseUrl);
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
				const logoUrl = `${baseUrl}/mad-css-logo.png`;
				const bgImageUrl = `${baseUrl}/madcss-wide.jpg`;
				const userAvatarUrl = user.image || "";

				const getPhotoUrl = (player: Player | null): string => {
					if (!player) return "";
					if (player.photo.startsWith("http")) return player.photo;
					// Photos are stored as /avatars/name.png but actual files are in /avatars/color/name.png
					const filename = player.photo.replace("/avatars/", "");
					return `${baseUrl}/avatars/color/${encodeURI(filename)}`;
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
						borderColor?: string;
						backgroundColor?: string;
					},
				) => {
					const border = options?.border ?? 3;
					const grayscale = options?.grayscale ?? false;
					const showName = options?.showName ?? false;
					const borderColor = options?.borderColor ?? "#ffae00";
					const backgroundColor = options?.backgroundColor ?? "#ffae00";
					const filter = grayscale ? "filter: grayscale(100%);" : "";

					// Background circle with colored border
					const bgLeft = x - size / 2;
					const bgTop = y - size / 2;
					let html = `<div style="display: flex; position: absolute; left: ${bgLeft}px; top: ${bgTop}px; width: ${size}px; height: ${size}px; border-radius: 50%; background-color: ${backgroundColor}; border: ${border}px solid ${borderColor};"></div>`;

					// Image is taller and positioned higher so head pops out top
					const popOut = Math.round(size * 0.15); // head pops out ~15% of size
					const imgHeight = size + popOut;
					const imgLeft = x - size / 2;
					const imgTop = y - size / 2 - popOut; // shift up so head pops out

					if (!player) {
						html += `<div style="display: flex; position: absolute; left: ${bgLeft}px; top: ${bgTop}px; width: ${size}px; height: ${size}px; border-radius: 50%; background-color: #333; border: ${border}px solid ${borderColor};"></div>`;
					} else {
						// Satori requires width/height as HTML attributes, not just CSS
						html += `<img src="${getPhotoUrl(player)}" width="${size}" height="${imgHeight}" style="position: absolute; left: ${imgLeft}px; top: ${imgTop}px; width: ${size}px; height: ${imgHeight}px; border-radius: 50%; object-fit: cover; object-position: top; ${filter}" />`;
					}

					if (showName && player) {
						const nameY = bgTop + size + 4;
						const name = player.name.split(" ")[0]; // First name only
						html += `<span style="position: absolute; left: ${x}px; top: ${nameY}px; transform: translateX(-50%); color: #fff; font-size: 12px; font-weight: 700; font-family: system-ui; text-shadow: 0 1px 4px #000, 0 0 8px #000; white-space: nowrap;">${name}</span>`;
					}

					return html;
				};

				const hLine = (x1: number, x2: number, y: number) =>
					`<div style="display: flex; position: absolute; left: ${Math.min(x1, x2)}px; top: ${y - 1}px; width: ${Math.abs(x2 - x1)}px; height: 3px; background-color: #fff;"></div>`;

				const vLine = (x: number, y1: number, y2: number) =>
					`<div style="display: flex; position: absolute; left: ${x - 1}px; top: ${Math.min(y1, y2)}px; width: 3px; height: ${Math.abs(y2 - y1)}px; background-color: #fff;"></div>`;

				// ============================================
				// GET BRACKET DATA
				// ============================================

				// Get R1 players from actual bracket structure (not players array)
				// Left side: games 0-3, each has player1 and player2
				const r1Left: (Player | undefined)[] = [];
				for (let i = 0; i < 4; i++) {
					const game = bracket.round1[i];
					r1Left.push(game.player1, game.player2);
				}

				// Right side: games 4-7, each has player1 and player2
				const r1Right: (Player | undefined)[] = [];
				for (let i = 4; i < 8; i++) {
					const game = bracket.round1[i];
					r1Right.push(game.player1, game.player2);
				}

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

				// Side colors
				const COLOR_LEFT = "#0f73ff"; // Blue
				const COLOR_RIGHT = "#f3370e"; // Red
				const BG_PICKED = "#ffae00"; // Yellow/orange for picked players
				const BG_UNPICKED = "#666"; // Gray for unpicked players

				// --- LEFT SIDE ---

				// R1 avatars (gray background if not picked)
				for (let i = 0; i < 8; i++) {
					const matchIndex = Math.floor(i / 2);
					const winner = getWinner(`r1-${matchIndex}`);
					const player = r1Left[i];
					const isUnpicked = winner && player && winner.id !== player.id;
					bracketHtml += avatar(player ?? null, X_R1_L, r1Y[i], SIZE_R1, {
						grayscale: isUnpicked,
						borderColor: COLOR_LEFT,
						backgroundColor: isUnpicked ? BG_UNPICKED : BG_PICKED,
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

				// QF avatars (gray background if not picked for this QF game)
				for (let i = 0; i < 4; i++) {
					const qfGameIndex = Math.floor(i / 2);
					const qfWinner = getWinner(`qf-${qfGameIndex}`);
					const isUnpicked =
						qfWinner &&
						qfLeftPlayers[i] &&
						qfLeftPlayers[i]?.id !== qfWinner.id;
					bracketHtml += avatar(qfLeftPlayers[i], X_QF_L, qfY[i], SIZE_QF, {
						grayscale: isUnpicked,
						borderColor: COLOR_LEFT,
						backgroundColor: isUnpicked ? BG_UNPICKED : BG_PICKED,
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

				// SF avatars (with names, gray background if not picked for SF-0)
				for (let i = 0; i < 2; i++) {
					const sfWinner = getWinner("sf-0");
					const isUnpicked =
						sfWinner &&
						sfLeftPlayers[i] &&
						sfLeftPlayers[i]?.id !== sfWinner.id;
					bracketHtml += avatar(sfLeftPlayers[i], X_SF_L, sfY[i], SIZE_SF, {
						showName: true,
						grayscale: isUnpicked,
						borderColor: COLOR_LEFT,
						backgroundColor: isUnpicked ? BG_UNPICKED : BG_PICKED,
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

				// Finals avatar (left, with name, gray background if not picked as champion)
				const finalLeftUnpicked =
					champion && finalLeft && finalLeft.id !== champion.id;
				bracketHtml += avatar(finalLeft, X_FINAL_L, finalY, SIZE_FINAL, {
					showName: true,
					grayscale: finalLeftUnpicked,
					borderColor: COLOR_LEFT,
					backgroundColor: finalLeftUnpicked ? BG_UNPICKED : BG_PICKED,
				});

				// Finals to Champion line (left)
				bracketHtml += hLine(
					X_FINAL_L + SIZE_FINAL / 2,
					CENTER_X - SIZE_CHAMP / 2,
					finalY,
				);

				// --- RIGHT SIDE ---

				// R1 avatars (gray background if not picked)
				for (let i = 0; i < 8; i++) {
					const matchIndex = Math.floor(i / 2) + 4; // r1-4 through r1-7
					const winner = getWinner(`r1-${matchIndex}`);
					const player = r1Right[i];
					const isUnpicked = winner && player && winner.id !== player.id;
					bracketHtml += avatar(player ?? null, X_R1_R, r1Y[i], SIZE_R1, {
						grayscale: isUnpicked,
						borderColor: COLOR_RIGHT,
						backgroundColor: isUnpicked ? BG_UNPICKED : BG_PICKED,
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

				// QF avatars (gray background if not picked for this QF game)
				for (let i = 0; i < 4; i++) {
					const qfGameIndex = Math.floor(i / 2) + 2; // qf-2 and qf-3 for right side
					const qfWinner = getWinner(`qf-${qfGameIndex}`);
					const isUnpicked =
						qfWinner &&
						qfRightPlayers[i] &&
						qfRightPlayers[i]?.id !== qfWinner.id;
					bracketHtml += avatar(qfRightPlayers[i], X_QF_R, qfY[i], SIZE_QF, {
						grayscale: isUnpicked,
						borderColor: COLOR_RIGHT,
						backgroundColor: isUnpicked ? BG_UNPICKED : BG_PICKED,
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

				// SF avatars (with names, gray background if not picked for SF-1)
				for (let i = 0; i < 2; i++) {
					const sfWinner = getWinner("sf-1");
					const isUnpicked =
						sfWinner &&
						sfRightPlayers[i] &&
						sfRightPlayers[i]?.id !== sfWinner.id;
					bracketHtml += avatar(sfRightPlayers[i], X_SF_R, sfY[i], SIZE_SF, {
						showName: true,
						grayscale: isUnpicked,
						borderColor: COLOR_RIGHT,
						backgroundColor: isUnpicked ? BG_UNPICKED : BG_PICKED,
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

				// Finals avatar (right, with name, gray background if not picked as champion)
				const finalRightUnpicked =
					champion && finalRight && finalRight.id !== champion.id;
				bracketHtml += avatar(finalRight, X_FINAL_R, finalY, SIZE_FINAL, {
					showName: true,
					grayscale: finalRightUnpicked,
					borderColor: COLOR_RIGHT,
					backgroundColor: finalRightUnpicked ? BG_UNPICKED : BG_PICKED,
				});

				// Finals to Champion line (right)
				bracketHtml += hLine(
					X_FINAL_R - SIZE_FINAL / 2,
					CENTER_X + SIZE_CHAMP / 2,
					finalY,
				);

				// --- CHAMPION (with yellow background, head pops out) ---
				const champLeft = CENTER_X - SIZE_CHAMP / 2;
				const champTop = CHAMP_Y - SIZE_CHAMP / 2;

				// Yellow background circle for champion
				bracketHtml += `<div style="display: flex; position: absolute; left: ${champLeft}px; top: ${champTop}px; width: ${SIZE_CHAMP}px; height: ${SIZE_CHAMP}px; border-radius: 50%; background-color: #ffae00; border: 4px solid #ffae00;"></div>`;

				// Champion image - taller with head popping out
				const champPopOut = Math.round(SIZE_CHAMP * 0.15);
				const champImgHeight = SIZE_CHAMP + champPopOut;
				const champImgTop = champTop - champPopOut;

				if (champion) {
					bracketHtml += `
						<img src="${getPhotoUrl(champion)}" width="${SIZE_CHAMP}" height="${champImgHeight}" style="position: absolute; left: ${champLeft}px; top: ${champImgTop}px; width: ${SIZE_CHAMP}px; height: ${champImgHeight}px; border-radius: 50%; object-fit: cover; object-position: top;" />
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
					<img src="${bgImageUrl}" width="1200" height="630" style="position: absolute; top: 0; left: 0; width: 1200px; height: 630px; object-fit: cover;" />

					<!-- Dark overlay -->
					<div style="display: flex; position: absolute; top: 0; left: 0; width: 1200px; height: 630px; background-color: #000; opacity: 0.5;"></div>

					<!-- Logo (top center, 120px square, centered at Y=90) -->
					<img src="${logoUrl}" width="120" height="120" style="position: absolute; left: ${CENTER_X}px; top: ${LOGO_Y - 60}px; transform: translateX(-50%); width: 120px; height: 120px;" />

					<!-- User info (bottom center, 60px avatar, 28px text, Y=570) -->
					<div style="display: flex; position: absolute; left: ${CENTER_X}px; top: ${USER_Y}px; transform: translate(-50%, -50%); align-items: center; gap: 12px;">
						${
							userAvatarUrl
								? `<img src="${userAvatarUrl}" width="60" height="60" style="width: 60px; height: 60px; border-radius: 50%; border: 3px solid #ffae00;" />`
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

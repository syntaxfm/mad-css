import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

export const { signIn, signOut, useSession } = authClient;

// Client-side admin check - FOR UI DISPLAY ONLY, NOT FOR SECURITY
// Actual authorization must always be done server-side via isAdminUser()
export const ADMIN_GITHUB_IDS = [
	"176013", // wesbos
	"669383", // stolinski
	"14241866", // w3cj
	"3760543", // sergical
] as const;

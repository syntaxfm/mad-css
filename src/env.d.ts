/// <reference types="vite/client" />

declare module "cloudflare:workers" {
	interface CloudflareEnv {
		DB: D1Database;
		ASSETS: { fetch: typeof fetch };
		GITHUB_CLIENT_ID: string;
		GITHUB_CLIENT_SECRET: string;
		BETTER_AUTH_SECRET: string;
		BETTER_AUTH_URL: string;
	}
	export const env: CloudflareEnv;
}

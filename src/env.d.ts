/// <reference types="vite/client" />

declare module "cloudflare:workers" {
	interface CloudflareEnv {
		DB: import("@cloudflare/workers-types").D1Database;
	}
	export const env: CloudflareEnv;
}

import { defineConfig } from "vitest/config";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [
		tsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
	],
	test: {
		include: ["src/**/*.test.ts"],
		environment: "node",
	},
});

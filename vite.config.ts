import { execSync } from 'node:child_process'
import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import { cloudflare } from '@cloudflare/vite-plugin'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { sentryTanstackStart } from '@sentry/tanstackstart-react'

const SENTRY_RELEASE =
  process.env.SENTRY_RELEASE ||
  execSync('git rev-parse HEAD').toString().trim()

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    tsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    cloudflare({
      viteEnvironment: { name: 'ssr' },
    }),
    tanstackStart(),
    viteReact(),
    sentryTanstackStart({
      org: "syntax-fm",
      project: "mad-css",
      authToken: process.env.SENTRY_AUTH_TOKEN,
      release: {
        name: SENTRY_RELEASE,
      },
    }),
  ],
})

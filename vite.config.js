import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
  server: {
    // The Veronica API is served by the Cloudflare Worker in production
    // (same origin). In dev, proxy /api to a running worker — `npx wrangler dev`
    // on :8787 by default, or set DEV_API_TARGET to the deployed worker URL.
    proxy: {
      '/api': {
        target: process.env.DEV_API_TARGET || 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
    },
  },
})

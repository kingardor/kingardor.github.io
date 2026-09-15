# akashjames.com

Personal portfolio site for Akash James — AI Architect. React 19 + Vite + Tailwind CSS 4, served from a single Cloudflare Worker that also hosts **Veronica**, the site's AI aide.

Live at **https://akashjames.com** (fallback: `akash-portfolio.akash-james2096.workers.dev`).

## Getting started

```bash
npm install
npm run dev          # Vite dev server → http://localhost:5173
npm run worker:dev   # (separate shell) Worker on :8787 — dev proxies /api/* to it
```

The Worker needs `OPENROUTER_API_KEY` for chat. For local dev, put it in a `.dev.vars` file (gitignored):

```
OPENROUTER_API_KEY=sk-or-...
```

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Vite dev server; `/api/*` is proxied to the Worker (`DEV_API_TARGET` overrides the target) |
| `npm run worker:dev` | Run the Worker locally with wrangler (`:8787`) |
| `npm run build` | Production build to `dist/` |
| `npm run prerender` | Snapshot `dist/index.html` with headless Chrome (needs `PUPPETEER_EXECUTABLE_PATH`) |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint (site + Worker) |
| `npm run deploy` | Build → prerender → `wrangler deploy` using `.env.cloudflare` |

## Architecture

```
akashjames.com ──▶ Cloudflare Worker `akash-portfolio` (wrangler.jsonc)
                     ├─ /api/*     → worker/index.js  (Veronica API)
                     ├─ /story/*   → worker/index.js  (byte-range video serving)
                     └─ everything else → static assets from dist/ (SPA fallback)
```

- **Site** — `src/`. Hash-routed SPA (`/#/chat` is the Veronica chat). Scroll-driven story videos in `public/story/`. See `CLAUDE.md` for the design system and component map.
- **Worker** — `worker/index.js`. Ported from the old Python proxy; no framework.
  - `GET /api/chat?text=…&history=…` — SSE stream. Runs an OpenRouter tool-calling loop (bio, career, projects, skills, publications, honours, YouTube), then streams the answer as typed events `{t: text|thinking|tool|block}` ending in `[DONE]`.
  - `GET /api/youtube-feed` — channel RSS → JSON, edge-cached 10 min. Retries and refuses to cache YouTube's occasional bad 200 bodies.
  - `GET /api/health`
  - `/story/*` — answers HTTP Range requests with 206. Workers static assets return full 200s, and Safari won't seek `<video>` without ranges.
- **Config** — `wrangler.jsonc`: static assets (`not_found_handling: single-page-application`, `run_worker_first` for `/api/*` and `/story/*`), custom domains, and vars (`YT_CHANNEL_ID`, `YT_MAX`, `MODEL`, `TEMPERATURE`). Secret: `OPENROUTER_API_KEY` via `npx wrangler secret put`.

## Stack

- **React 19** + **Vite 7** — UI and build
- **Tailwind CSS 4** — styling (Obsidian Monolith tokens in `src/index.css`)
- **Framer Motion**, **GSAP**, **Lenis** — motion and smooth scroll
- **Three.js** (`@react-three/fiber`) — 3D orb in the chat
- **Cloudflare Workers** + **Wrangler** — hosting, static assets, API
- **OpenRouter** — LLM for Veronica (`nvidia/nemotron-3-nano-30b-a3b`)

## Deployment

Pushes to `main` run `.github/workflows/deploy.yml`: build → prerender (headless Chrome) → `wrangler deploy`. Repo secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.

Local: `npm run deploy` does the same, reading credentials from a gitignored `.env.cloudflare`:

```
CLOUDFLARE_API_TOKEN=...
CLOUDFLARE_ACCOUNT_ID=...
```

DNS and TLS live on Cloudflare (zone `akashjames.com`, Always Use HTTPS on). `kingardor.github.io` is kept as a redirect to the new domain via the `gh-pages` branch.

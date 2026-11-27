# akashjames.com

Personal portfolio site for Akash James — Director AI - BLUE. React 19 + Vite + Tailwind CSS 4, served from a single Cloudflare Worker that also hosts **Veronica**, the site's AI aide.

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
| `npm run sequences` | Rebuild the old story-film frames (needs ffmpeg) |
| `npm run deploy` | Build → prerender → `wrangler deploy` using `.env.cloudflare` |

## Architecture

```
akashjames.com ──▶ Cloudflare Worker `akash-portfolio` (wrangler.jsonc)
                     ├─ /api/*     → worker/index.js  (Veronica API)
                     ├─ /story/*, /media/* → worker/index.js  (byte-range video serving)
                     └─ everything else → static assets from dist/ (SPA fallback)
```

- **Site** — `src/`. Hash-routed SPA. `/` is an edition picker over a lit, layered studio portrait: **Mint in Box** (`/#/mint`) and **Versus** (`/#/versus`) are two complete designs in peer review, with a switch between them. `/#/chat` is the Veronica chat, `/#/classic` the previous homepage, `/#/lab` where the redesign was built. See `CLAUDE.md` for the full component map.
- **Worker** — `worker/index.js`. Ported from the old Python proxy; no framework.
  - `POST /api/chat` with `{ text, history }` — SSE stream. Runs a streamed OpenRouter tool-calling loop (bio, career, projects, skills, publications, honours, YouTube) and emits typed events `{t: text|thinking|tool|block|error}` ending in `[DONE]`. Same-origin only, rate-limited per IP (`CHAT_LIMITER`), 64KB body cap.
  - `GET /api/youtube-feed` — channel RSS → JSON, edge-cached 10 min. Retries and refuses to cache YouTube's occasional bad 200 bodies.
  - `GET /api/health`
  - `/story/*` — answers HTTP Range requests with 206. Workers static assets return full 200s, and Safari won't seek `<video>` without ranges.
- **Config** — `wrangler.jsonc`: static assets (`not_found_handling: single-page-application`, `run_worker_first` for `/api/*` and `/story/*`), custom domains, and vars (`YT_CHANNEL_ID`, `YT_MAX`, `MODEL`, `TEMPERATURE`). Secret: `OPENROUTER_API_KEY` via `npx wrangler secret put`.

## Portrait background

The studio portrait is split into lit layers by `scripts/portrait/` (macOS only: an Apple Vision matte plus numpy/Pillow) from `media-src/portrait/portrait-{wide,tall}.png` into `public/portrait/`. Re-run it only when the photos change:

```bash
for SET in wide tall; do
  swift scripts/portrait/matte.swift media-src/portrait/portrait-$SET.png /tmp/portrait-$SET.png
  python3 scripts/portrait/build_portrait.py $SET /tmp/portrait-$SET.person.png
done
```

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

DNS and TLS live on Cloudflare (zone `akashjames.com`, Always Use HTTPS on). `kingardor.github.io` is kept as a redirect to the new domain via the `gh-pages` branch. Cloudflare Web Analytics is on; its beacon is allowed in the CSP (`public/_headers`).

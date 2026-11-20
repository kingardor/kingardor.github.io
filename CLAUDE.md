# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Build frame sequences (cached) + Vite dev server (localhost:5173)
npm run build      # Frame sequences (cached) + production build → dist/
npm run sequences  # Rebuild story frame sequences only (needs ffmpeg; --force to ignore cache)
npm run prerender  # Snapshot dist/index.html via headless Chrome (needs PUPPETEER_EXECUTABLE_PATH)
npm run lint       # ESLint
npm run preview    # Preview production build locally
```

## Architecture

**Personal portfolio SPA** for Akash James (AI Architect). React 19 + Vite + Tailwind CSS 4. Design system: **Obsidian Monolith** — void black `#050505`, bone white `#ece9e2`, single ember accent `#ff3d00`. Tokens are `--ob-*` in `src/index.css`; legacy `--nm-*`/`--bg`/`--accent` names are aliases onto them (chat surfaces consume `--nm-*`). Fonts are self-hosted in `public/fonts/` (Clash Display, General Sans, JetBrains Mono) with `@font-face` in `index.html`.

### Routing

Hash-based via the custom `useHashPath` hook — no React Router. `App.jsx` branches: `/#/chat` → lazy ChatPage, everything else → `Home`. Route swaps go through `src/shared/utils/navigate.js`, which wraps the hash change in the View Transitions API (clip-wipe + blur; instant fallback).

### The Story Layer (scroll-scrubbed footage centerpiece)

A fixed full-viewport canvas (`src/components/story/SequenceCanvas.jsx`) behind all home content. Eight AI-generated segments tell one continuous transformation — Akash's real selfie at the Golden Gate progressively becoming a half-chrome cyborg (ember palette), themed per section: circuits wake (hero/manifesto), armor assembles (career), PCB head reveal (skills), schematics (projects), red eye + REC (signals), glyph rain (notes), mirror polish (honours), final-form push-in (contact).

- **Footage is an image sequence, never a `<video>`.** Seeking video per scroll frame was the old bottleneck (≈9 visible updates/s, Safari worse in reverse). `scripts/build-sequences.mjs` (run by `npm run dev`/`build`, cached by source hash) turns `media-src/story/<name>.mp4` (+ `-m` mobile) into 15fps AVIF q45 frames under `public/seq/<name>-<hash>/{d,m}/` (gitignored, immutable-cached via `_headers`) plus `src/components/story/sequences.generated.json`. Per-sequence byte budgets fail the build. CI caches the output and installs ffmpeg only on a miss.
- **Frame = f(scroll).** `ACTS` maps section ids → sequences; act *k* owns `[start_k, start_k+1)` (start ≈ section top − 0.85vh) and P = k + progress. A light exponential follow smooths wheel steps; jumps > 1.5 acts cut instead of scrubbing; adjacent frames crossfade by the fractional position. Missing sections are simply skipped (acts are explicit, never index-shifted). Consecutive segments share boundary keyframes, so act handoffs are invisible.
- `sequenceStore.js`: compressed blobs fetched coarse-to-fine (every 8th frame first), active act + neighbours prioritised; small decoded seek previews cover every act. Full-resolution decodes run three at a time, centered on the playhead, with stale bitmaps closed after a jump.
- `src/shared/scroll/scrollStore.js` is the single rAF for scroll-driven visuals: woken by `scroll`/`resize`, sleeps when no subscriber is still easing — an idle page draws nothing.
- Reduced motion / prerender / no AVIF decode → static poster (`.story-poster`). `?seqdebug` exposes `window.__seq` (act, frame, frac, act ranges).
- Asset pipeline (regeneration): keyframes via Higgsfield `nano_banana_pro` chained edits — every generation references the previous keyframe PLUS TWO ground-truth photos of Akash's face (¾ `public/hero.webp` + a frontal selfie) so identity holds through head turns; the storyboard alternates front ↔ ¾ angles per section for camera/head motion (never full profiles — no profile GT exists). Never let prompts "re-compose/zoom/re-center" (causes likeness drift); state head angle + framing explicitly. Segments via `wan2_7` with `start_image`/`end_image` and motion described in the prompt (turns, bows, ignitions). Drop masters into `media-src/story/` and rebuild — no hand encoding.

### Sections

The homepage is composed in `src/components/portfolio/Home.jsx`. It retains `HeroSection` and the eight-act story canvas. After the hero, `PortfolioSections.jsx` presents the work gallery, experience, toolkit, projects, talks, writing, recognition and contact. `portfolio.css` reserves a film column on desktop and full-width reading space after the hero on phones. Search opens the command palette. The live video feed falls back to the curated talks in `src/content/index.js`.

### Veronica OS layer (`src/components/os/`)

- `CommandPalette.jsx` — ⌘K/Ctrl+K/`/`; fuzzy index (`usePaletteIndex.js`, scorer in `shared/utils/fuzzy.js`) over sections/projects/posts/socials/commands; unmatched queries route to the chat as a seeded question.
- `GuidedTour.jsx` + `tourScript.js` — canned Veronica captions, Lenis-driven autopilot; wheel pauses, Esc exits; entries: palette, `?tour=1`. Disabled on mobile/reduced-motion.

### Content / Data

All content lives in `src/content/index.js` — the single source imported by both the SPA and the Worker (Veronica's tools read it, so the page and the agent can't drift). `src/components/prototype/dataAdapter.js` only reshapes it for the home sections (career chapters, curated projects with Veronica pinned first, honours keys, writing rows, manifesto words, stats). Projects are curated there — no GitHub repo auto-listing.

### Chat ("Veronica" AI)

- `POST /api/chat` `{ text, history }` via `src/shared/utils/streamChat.js` (fetch + ReadableStream, inactivity timeout); typed SSE events (text/thinking/tool/block/error) render rich blocks in `src/sections/Chat/blocks/`. A stop, timeout or dropped stream keeps whatever already streamed.
- The Worker streams every round (tool calls are stitched from deltas) — one generation per answer. `/api/chat` guards: foreign browser `Origin` → 403 (`ALLOWED_ORIGINS` + same-origin), per-IP `CHAT_LIMITER` rate limit → 429, 64KB body cap → 413, history sanitised to user/assistant string messages. Owner Mode is server-checked against the optional `OWNER_TOKEN` secret; the token never reaches the model.
- Seeding: hero prompt bar / palette set `sessionStorage 'chat:seed'` + `#/chat?q=…`; only a stashed seed auto-sends — a bare `?q=` (e.g. a third-party link) just pre-fills the input
- Styled entirely by the `--nm-*` token aliases — recolor by editing tokens, not components

### Loading Screen

Pure CSS splash in `index.html` (`#loader`). Dismissed by `main.jsx` after the active layout’s story frames and sparse seek previews load (12s without progress releases the page), the ~1.7s minimum, and `window.__resolveHeroReady` (called by `HeroSection` once Clash Display is loaded; 4s safety timeout). `window.__PRERENDER` skips dismissal during the prerender snapshot.

### Deployment (Cloudflare Workers)

One Worker, `akash-portfolio`, serves everything: `dist/` as static assets (`not_found_handling: single-page-application`) and the Veronica API from `worker/index.js` (`run_worker_first: ["/api/*", "/story/*", "/media/*"]` — the media paths get byte-range 206s for Safari video). Config in `wrangler.jsonc`.

- GitHub Actions (`.github/workflows/deploy.yml`): build → prerender (headless Chrome) → `wrangler deploy`. Needs repo secrets `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`. Local: `npm run deploy` (`scripts/deploy.sh`: sources gitignored `.env.cloudflare`, build → prerender if Chrome is present → deploy).
- Worker vars: `YT_CHANNEL_ID`, `YT_MAX`, `MODEL`, `TEMPERATURE`, `ALLOWED_ORIGINS` (in `wrangler.jsonc`); rate-limit binding `CHAT_LIMITER`. Secrets via `npx wrangler secret put`: `OPENROUTER_API_KEY` (required), `OWNER_TOKEN` (optional — enables `/admin <token>` Owner Mode).
- Custom domains attach via `routes` with `custom_domain: true` once the zone is on Cloudflare. workers.dev URL: `https://akash-portfolio.akash-james2096.workers.dev`.
- The API is same-origin in production (no CORS headers); `API_BASE` in `ChatPage.jsx` / `prefetch.js` is `VITE_API_BASE ?? ''`. Dev: Vite proxies `/api` to `npm run worker:dev` (:8787, runs with `DEV_LOOPBACK=1` so localhost origins pass) or `DEV_API_TARGET`; the proxy strips `Origin`.
- Security headers (CSP etc.) and `/assets/*` immutable caching live in `public/_headers` (applies to static-asset responses only). No inline scripts — the loader timestamp is `public/boot.js`. `main.jsx` uses `createRoot` (never hydrate): the prerender snapshot is post-effect and can't match a first render.
- History: previously GitHub Pages (`pages.yml`) + a Python/FastAPI proxy on Vercel (`kingardor/veronica-proxy-vercel`), ported 1:1 into `worker/index.js` (OpenRouter agentic loop → typed SSE, YouTube RSS → JSON).

### External APIs

- **CounterAPI** — visitor counter (`src/shared/hooks/useSiteViews.js`)
- **GitHub API** — public events ticker only (`shared/utils/telemetry.js`)
- **YouTube feed** — `/api/youtube-feed` on the Worker (`shared/utils/prefetch.js`)
- **Chat endpoint** — `POST /api/chat` on the Worker → OpenRouter (the Veronica chat agent)

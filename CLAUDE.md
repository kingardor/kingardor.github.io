# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server (localhost:5173)
npm run build      # Production build → dist/
npm run prerender  # Snapshot dist/index.html via headless Chrome (needs PUPPETEER_EXECUTABLE_PATH)
npm run lint       # ESLint
npm run preview    # Preview production build locally
```

## Architecture

**Personal portfolio SPA** for Akash James (AI Architect). React 19 + Vite + Tailwind CSS 4. Design system: **Obsidian Monolith** — void black `#050505`, bone white `#ece9e2`, single ember accent `#ff3d00`. Tokens are `--ob-*` in `src/index.css`; legacy `--nm-*`/`--bg`/`--accent` names are aliases onto them (chat surfaces consume `--nm-*`). Fonts are self-hosted in `public/fonts/` (Clash Display, General Sans, JetBrains Mono) with `@font-face` in `index.html`.

### Routing

Hash-based via the custom `useHashPath` hook — no React Router. `App.jsx` branches: `/#/chat` → lazy ChatPage, everything else → `Home`. Route swaps go through `src/shared/utils/navigate.js`, which wraps the hash change in the View Transitions API (clip-wipe + blur; instant fallback).

### The Story Layer (scroll-driven video centerpiece)

A fixed full-viewport video layer (`src/components/story/StoryScrub.jsx`) behind all home content. Eight AI-generated segments (`public/story/story-{1..8}.mp4` + `-m` mobile variants) tell one continuous transformation — Akash's real selfie at the Golden Gate progressively becoming a half-chrome cyborg (ember palette), themed per section: circuits wake (hero/manifesto), armor assembles (career), PCB head reveal (skills), schematics (projects), red eye + REC (signals), glyph rain (notes), mirror polish (honours), final-form push-in (contact).

- Scroll space is partitioned contiguously: segment *i* owns `[anchor_i, anchor_i+1)` (anchor ≈ section top − 0.85vh) — but anchors only pick the ACTIVE scene. Playback is event-driven, not positional: entering a section plays its snippet from the shared boundary keyframe through to the far end at the cinematic rate (`MAX_RATE` 1.5× cap, exponential chase) — identically for short and tall/pinned sections. Scrolling up rewinds; a direction flip needs `DIR_PX` of intentional counter-scroll so jitter can't reverse a scene. Consecutive segments share boundary keyframes, so handoffs are pixel-identical.
- Mobile machinery ported from the old hero: iOS gesture priming (all videos primed in the first `touchstart`), single-seek-in-flight gating per video, decoder wake on tab restore. Mobile uses the `-m` encodes (720px, 15fps, `-g 5` for fast seeks).
- Reduced-motion / prerender renders a static poster (`.story-poster`, hero.webp).
- Asset pipeline (regeneration): keyframes via Higgsfield `nano_banana_pro` chained edits — every generation references the previous keyframe PLUS TWO ground-truth photos of Akash's face (¾ `public/hero.webp` + a frontal selfie) so identity holds through head turns; the storyboard alternates front ↔ ¾ angles per section for camera/head motion (never full profiles — no profile GT exists). Never let prompts "re-compose/zoom/re-center" (causes likeness drift); state head angle + framing explicitly. Segments via `wan2_7` with `start_image`/`end_image` and motion described in the prompt (turns, bows, ignitions); encode desktop `1024w CRF30 -g 6` (dense keyframes — Safari can't repaint per-frame backward seeks across long GOPs, so reverse scrubbing needs short ones), mobile `720w fps15 CRF30 -g 5`, `+faststart`, no audio.

### Sections

`src/components/sections/` — one file per section (HeroSection, CareerSection, SkillsSection, ProjectsSection, VideosSection, WritingSection, HonoursSection, ContactSection), orchestrated by `src/components/prototype/Home.jsx`. Shared helpers in `sections/lib/effects.jsx` (ScrambleText, TypewriterKicker, MagneticButton, SectionHead). Career is a pinned vertical chapter crossfade (stacked list ≤900px). Top chrome is `Chrome.jsx` (wordmark + numbered index + TOUR + ⌘K + Ask Veronica).

### Veronica OS layer (`src/components/os/`)

- `CommandPalette.jsx` — ⌘K/Ctrl+K/`/`; fuzzy index (`usePaletteIndex.js`, scorer in `shared/utils/fuzzy.js`) over sections/projects/posts/socials/commands; unmatched queries route to the chat as a seeded question.
- `GuidedTour.jsx` + `tourScript.js` — canned Veronica captions, Lenis-driven autopilot; wheel pauses, Esc exits; entries: TOUR button, palette, `?tour=1`. Disabled on mobile/reduced-motion.
- `TelemetryHud.jsx` — bottom strip: GitHub events ticker (unauth API, sessionStorage TTL, hides on failure), YouTube count, CounterAPI visitors, IST clock, SYS status.
- `ContextChip.jsx` — per-section "ASK VERONICA ABOUT THIS" handoff.

### Content / Data

Site content lives in `src/data.js`, mapped to component shape by `src/components/prototype/dataAdapter.js` (career chapters, projects with Veronica pinned first, honours keys, writing rows, manifesto words, stats).

### Chat ("Veronica" AI)

- SSE via `src/shared/utils/openSSE.js` to `/api/chat` on the Worker; typed events (text/thinking/tool/block) render rich blocks in `src/sections/Chat/blocks/`
- Seeding: hero prompt bar / palette set `sessionStorage 'chat:seed'` + `#/chat?q=…`
- Styled entirely by the `--nm-*` token aliases — recolor by editing tokens, not components

### Loading Screen

Pure CSS splash in `index.html` (`#loader`). Dismissed by `main.jsx` after BOTH ~1.7s minimum AND `window.__resolveHeroReady` (called by `HeroSection` once Clash Display is loaded; 4s safety timeout). `window.__PRERENDER` skips dismissal during the prerender snapshot.

### Deployment (Cloudflare Workers)

One Worker, `akash-portfolio`, serves everything: `dist/` as static assets (`not_found_handling: single-page-application`) and the Veronica API from `worker/index.js` (`run_worker_first: ["/api/*"]`). Config in `wrangler.jsonc`.

- GitHub Actions (`.github/workflows/deploy.yml`): build → prerender (headless Chrome) → `wrangler deploy`. Needs repo secrets `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`. Local: `npm run deploy` (build + deploy, no prerender).
- Worker vars: `YT_CHANNEL_ID`, `YT_MAX`, `MODEL`, `TEMPERATURE` (in `wrangler.jsonc`). Secret: `OPENROUTER_API_KEY` via `npx wrangler secret put`.
- Custom domains attach via `routes` with `custom_domain: true` once the zone is on Cloudflare. workers.dev URL: `https://akash-portfolio.akash-james2096.workers.dev`.
- The API is same-origin in production; `API_BASE` in `ChatPage.jsx` / `prefetch.js` is `VITE_API_BASE ?? ''`. Dev: Vite proxies `/api` to `npm run worker:dev` (:8787) or `DEV_API_TARGET`.
- History: previously GitHub Pages (`pages.yml`) + a Python/FastAPI proxy on Vercel (`kingardor/veronica-proxy-vercel`), ported 1:1 into `worker/index.js` (OpenRouter agentic loop → typed SSE, YouTube RSS → JSON).

### External APIs

- **CounterAPI** — visitor counter (`src/shared/hooks/useSiteViews.js`)
- **GitHub API** — repos (`fetchGithubProjects.js`, prefetched during loader) + public events ticker (`shared/utils/telemetry.js`)
- **YouTube feed** — `/api/youtube-feed` on the Worker (`shared/utils/prefetch.js`)
- **SSE endpoint** — `/api/chat` on the Worker → OpenRouter (the Veronica chat agent)

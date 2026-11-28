# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Build frame sequences (cached) + Vite dev server (localhost:5173)
npm run build      # Frame sequences (cached) + production build → dist/
npm run sequences  # Rebuild story frame sequences only (needs ffmpeg; --force to ignore cache)
npm run prerender  # Snapshot dist/index.html via headless Chrome (needs PUPPETEER_EXECUTABLE_PATH)
npm run lint       # ESLint
npm run bench      # Scroll benchmark: both editions on no-GPU / phone / fast profiles (needs a build + Chrome; --idle for idle redraws)
npm run preview    # Preview production build locally
```

## Architecture

**Personal portfolio SPA** for Akash James (Director AI - BLUE). React 19 + Vite + Tailwind CSS 4. Design system: **Obsidian Monolith** — void black `#050505`, bone white `#ece9e2`, single ember accent `#ff3d00`. Tokens are `--ob-*` in `src/index.css`; legacy `--nm-*`/`--bg`/`--accent` names are aliases onto them (chat surfaces consume `--nm-*`). Fonts are self-hosted in `public/fonts/` (Clash Display, General Sans, JetBrains Mono) with `@font-face` in `index.html`.

### Routing

Hash-based via the custom `useHashPath` hook — no React Router. `App.jsx` branches (peer-review build): `/` → the edition picker, `/#/mint` and `/#/versus` → the two candidate designs, `/#/classic` → the pre-redesign `Home`, `/#/chat` → lazy ChatPage, `/#/lab/*` → the lab. In-page anchors (`#vs-story`, `#career`) never change the view: the hook puts the route back in the URL after the browser scrolls. Route swaps go through `src/shared/utils/navigate.js`, which wraps the hash change in the View Transitions API (clip-wipe + blur; instant fallback).

### Editions (peer-review build, `src/editions/`)

Akash can't choose between Mint in Box and Versus, so visitors pick. `EditionPicker` (at `/`) puts his portrait behind two edition cards; `?edition=mint|versus` deep-links. `EditionRoute` mounts an edition plus `EditionSwitch`, a floating bottom-centre toggle; switching keeps the story beat (the current act index → the same act in the other edition). The last edition is remembered in `localStorage['edition']` (the chat's back link uses it). Mint/Versus act lists live in `src/proposals/{mint,versus}/acts.js` so the switcher doesn't load either design.

### The Story Layer (the original cyborg film; now opt-in)

No longer the default background (the portrait stage replaced it, see below): it runs under `?bg=film` and behind Subject 001. A fixed full-viewport canvas (`src/components/story/SequenceCanvas.jsx`). Eight AI-generated segments tell one continuous transformation — Akash's real selfie at the Golden Gate progressively becoming a half-chrome cyborg (ember palette), themed per section: circuits wake (hero/manifesto), armor assembles (career), PCB head reveal (skills), schematics (projects), red eye + REC (signals), glyph rain (notes), mirror polish (honours), final-form push-in (contact).

- **Footage is an image sequence, never a `<video>`.** Seeking video per scroll frame was the old bottleneck (≈9 visible updates/s, Safari worse in reverse). `scripts/build-sequences.mjs` (run by `npm run dev`/`build`, cached by source hash) turns `media-src/story/<name>.mp4` (+ `-m` mobile) into 15fps AVIF q45 frames under `public/seq/<name>-<hash>/{d,m}/` (gitignored, immutable-cached via `_headers`) plus `src/components/story/sequences.generated.json`. Per-sequence byte budgets fail the build. CI caches the output and installs ffmpeg only on a miss.
- **Frame = f(scroll).** `ACTS` maps section ids → sequences; act *k* owns `[start_k, start_k+1)` (start ≈ section top − 0.85vh) and P = k + progress. A light exponential follow smooths wheel steps; jumps > 1.5 acts cut instead of scrubbing; adjacent frames crossfade by the fractional position. Missing sections are simply skipped (acts are explicit, never index-shifted). Consecutive segments share boundary keyframes, so act handoffs are invisible. `SequenceCanvas` takes `acts`, `compactActs`, `pane`, `layerClass`, `scrim` and `still` props (Home uses the defaults) and publishes `{ act, t, frame, rect }` through `filmPosition.js` (`onFilm`) so overlays can sync to the footage; `rect` maps 0..1 footage coordinates to the viewport.
- `sequenceStore.js`: compressed blobs fetched 16 at a time, coarse-to-fine (every 8th frame first), active act + neighbours prioritised; small decoded seek previews cover every act. Full-resolution decodes run three at a time, centered on the playhead, with stale bitmaps closed after a jump.
- `src/shared/scroll/scrollStore.js` is the single rAF for scroll-driven visuals: woken by `scroll`/`resize`, sleeps when no subscriber is still easing — an idle page draws nothing.
- **Smoothness rules** (measured Nov 2026 with `npm run bench`; the editions lagged on a Pixel 10 and on a laptop without graphics acceleration): scrolling is native everywhere (`SmoothScroll.jsx`: Lenis keeps `smoothWheel: false` and only runs scripted `scrollTo`/`stop()`; a JS-smoothed wheel stuttered whenever the main thread was busy). Never change or transition a colour every element inherits (Versus's chapter ink on `<html>`, faded over 0.8 s, restyled and repainted the whole page at each chapter change: the "banner glitch"); sections carry their own ink and only fixed layers update. Decorative loops are finite, or play while on screen via the `onscreen` ref (`src/shared/hooks/onscreen.js`, sets `is-onscreen`), because an endless loop redraws the whole screen, portrait stack included, forever. Per-frame scroll handlers write styles only when the value changed. Phones, tablets and machines without graphics acceleration get lite rendering (see Portrait stage); the next lever for weak desktops is a steady camera (no per-section zoom/pan).
- Reduced motion / prerender / no AVIF decode → static poster (`.story-poster`). `?seqdebug` exposes `window.__seq` (act, frame, frac, act ranges).
- Asset pipeline (regeneration): keyframes via Higgsfield `nano_banana_pro` chained edits — every generation references the previous keyframe PLUS TWO ground-truth photos of Akash's face (¾ `public/hero.webp` + a frontal selfie) so identity holds through head turns; the storyboard alternates front ↔ ¾ angles per section for camera/head motion (never full profiles — no profile GT exists). Never let prompts "re-compose/zoom/re-center" (causes likeness drift); state head angle + framing explicitly. Segments via `wan2_7` with `start_image`/`end_image` and motion described in the prompt (turns, bows, ignitions). Drop masters into `media-src/story/` and rebuild — no hand encoding.

### Portrait stage (the background for the new build)

The cyborg film "doesn't fit" (Akash, Nov 2026). `src/components/portrait/PortraitStage.jsx` replaces it: a drop-in for `SequenceCanvas` (same props, same `filmPosition` publish) built from two shots of one studio session, `media-src/portrait/portrait-{wide,tall}.png`. `scripts/portrait/` (macOS only: Apple Vision matte + numpy/Pillow) splits each into aligned layers under `public/portrait/{wide,tall}/` (untouched photo, clean backdrop, subject, two rim lights, slash and lens masks) and merges both sets' geometry into `portrait.meta.json`. `portraitSets.js` picks the shot by the stage's aspect ratio (tall below ≈1.15, so phones held upright get the sharper tall shot) and re-picks on rotate/resize; the other shot preloads once the first is up. Looks are authored in wide-shot units and mapped onto the tall shot through the subject's bounding box. Per-act looks set zoom, framing, ember/blue light balance, lens reflections (project covers, kept subtle) and the glasses' REC LED; a fine pointer adds three-plane parallax and steers the lights; `midground` (e.g. `FlankName`, the name tucked behind his head) renders between backdrop and subject on the wide shot only. Ambient glints are finite CSS animations, so an idle page draws nothing. Optional gel layers (`.ps-gel-*`, off by default) re-hue the wall, the slashes and the cool-side rim. Versus uses them for its "Manga Ink" palette (black, white and one spot colour per chapter, `CHAPTER_INKS` in `src/proposals/versus/data.js`, applied as `--vs-spot` by `ChapterInk.jsx`: each section wears its own ink, set once; the fixed layers, stage included, follow the act on screen; character select is the exception: each fighter sets `--vs-spot` from `FIGHTER_INKS` on its own tile, preview and VS overlay, never higher up, and BLUE is the only blue, `--vs-blue`): he stays in colour, the wall and the right-hand light take the chapter's ink (`.vs-film` in `versus.css`). The stage uses no blend modes at all (lights and gels are plain translucent layers): on a Pixel 10 (PowerVR GPU, Chrome over ANGLE/Vulkan) blend modes drew him as a flat silhouette and blanked whole cards, and a Mac GPU painted flat colour behind the key light; headless Chrome showed neither. **Lite rendering** (`src/shared/utils/lite.js`, `html.is-lite`): on touch devices and machines whose WebGL is software-only, the stage draws only backdrop + subject (the full stack overflowed the Pixel's tile memory: Chrome logged "tile memory limits exceeded" hundreds of times a second and left rectangles blank), and blend modes/backdrop blurs are off page-wide. `?stage=full|lite` forces a mode. Test real phones with `adb` (Chrome's DevTools socket via `adb forward tcp:9222 localabstract:chrome_devtools_remote`, `adb reverse` to serve a local build). `FilmStage` mounts it everywhere by default; `?bg=film` brings back the old film for comparison (and the selfie pixel-assembly intro, which only runs under the film). `/#/lab/portrait` is the showcase.

### Sections

The pre-redesign homepage, now at `/#/classic`, is composed in `src/components/portfolio/Home.jsx`. It retains `HeroSection` and the eight-act story canvas. After the hero, `PortfolioSections.jsx` presents the work gallery (the `featured` PROJECTS, data-driven), experience, toolkit, projects, talks, writing, recognition and contact. `portfolio.css` reserves a film column on desktop and full-width reading space after the hero on phones. Search opens the command palette. The live video feed falls back to the curated talks in `src/content/index.js`.

### Veronica OS layer (`src/components/os/`)

- `CommandPalette.jsx` — ⌘K/Ctrl+K/`/`; fuzzy index (`usePaletteIndex.js`, scorer in `shared/utils/fuzzy.js`) over sections/projects/posts/socials/commands; unmatched queries route to the chat as a seeded question.
- `GuidedTour.jsx` + `tourScript.js` — canned Veronica captions, Lenis-driven autopilot; wheel pauses, Esc exits; entries: palette, `?tour=1`. Disabled on mobile/reduced-motion.

### Redesign lab (`/#/lab`)

Where the redesign was built: three complete alternative homepages over the same content. Mint in Box and Versus won and are live as editions at `/#/mint` and `/#/versus` (the lab copies render the same components); `/#/lab/subject` (Subject 001), `/#/lab/mint` (Mint in Box), `/#/lab/versus` (Versus); hub at `/#/lab` (`src/proposals/LabIndex.jsx`). Each lives in `src/proposals/<slug>/` with its `BRIEF.md`; shared rules in `src/proposals/RULES.md`; shared helpers (`PixelAssembly`, `useFilm`, `useLoaderRelease`, `film.css`) in `src/proposals/shared/`. The anatomy figure "The Bench" is `src/anatomy/Bench.jsx`, reviewed at `/#/lab/bench`.

### Content / Data

All content lives in `src/content/index.js` — the single source imported by both the SPA and the Worker (Veronica's tools read it, so the page and the agent can't drift). `src/components/prototype/dataAdapter.js` only reshapes it for the home sections (career chapters, curated projects with Veronica pinned first, honours keys, writing rows, manifesto words, stats). Projects are curated there — no GitHub repo auto-listing. Content was rebuilt from LinkedIn and the project READMEs in Nov 2026: besides PROFILE/CAREER/PROJECTS/SKILLS/WRITING/HONOURS it exports BLUE_STACK (the day job), ARCHIVE (older work), TALKS, EDUCATION, ONE_LINERS, BRAGS and OFF_DUTY. There is deliberately no patent anywhere on the site (Akash's decision); don't add one, even if LinkedIn lists it. His BLUE title is "Director AI - BLUE" everywhere (never "Founding Director of AI" or "Director of AI"); "AI Architect" survives only as a playful class/product label and in his past roles. Every number in it has a public source except "50+ models shipped", which is Akash's own figure; `private: true` projects (Veronica, CopCars.in) may show screenshots but must never link or quote their repos. Project images live in `public/work/<slug>/` as WebP.

### Chat ("Veronica" AI)

- **Skins.** `/#/chat` is `ChatRoute.jsx`. It holds the engine (`useVeronica.js`: conversation, stream, seeding, history caps, `retry()`, per-turn `meta` timings) above a skin and picks the skin from `?skin=mint|versus|classic`, else the visitor's edition, else Mint. The edition switch on the chat swaps the skin in place, and the conversation survives.
  - `skins/mint/` is "Veronica, talking figure: box No.03, opened flat".
  - `skins/versus/` is "Training Room vs THE QUEEN".
  - `ChatPage.jsx` is the classic Obsidian skin.
  - Concepts, rules and killed ideas are in `skins/DESIGN.md`.
- **Answers stream** as they're written. Thinking is the longest state, about 6–8 s in two bursts around tool calls. Skins drive tool moments from new entries in `v.live.tools`, because a tool and its block arrive in the same tick.
- **Markdown** answers include tables and headings. `rehypeBreaks.js` turns the model's stray `<br>` into real line breaks and no other HTML.
- **Dev-only mock:** `#/chat?mock=1` (or `mock=slow`) replays the real event order with real-shaped blocks, at no API cost.

- `POST /api/chat` `{ text, history }` via `src/shared/utils/streamChat.js` (fetch + ReadableStream, inactivity timeout); typed SSE events (text/thinking/tool/block/error) render rich blocks in `src/sections/Chat/blocks/`. A stop, timeout or dropped stream keeps whatever already streamed.
- The Worker streams every round (tool calls are stitched from deltas) — one generation per answer. `/api/chat` guards: foreign browser `Origin` → 403 (`ALLOWED_ORIGINS` + same-origin), per-IP `CHAT_LIMITER` rate limit → 429, 64KB body cap → 413, history sanitised to user/assistant string messages. Owner Mode is server-checked against the optional `OWNER_TOKEN` secret; the token never reaches the model.
- Seeding: hero prompt bar / palette set `sessionStorage 'chat:seed'` + `#/chat?q=…`; only a stashed seed auto-sends — a bare `?q=` (e.g. a third-party link) just pre-fills the input
- Styled entirely by the `--nm-*` token aliases — recolor by editing tokens, not components

### Loading Screen

Pure CSS splash in `index.html` (`#loader`). Dismissed by `main.jsx` once the background reports ready through `window.__storyProgress` (the portrait stage after its layers: seven, or two in lite rendering; the film after the opening act’s coarse frames, ~12 files; hard cap 5s from boot), the ~1.7s minimum, and `window.__resolveHeroReady` (called by `HeroSection` once Clash Display is loaded; 4s safety timeout). `window.__PRERENDER` skips dismissal during the prerender snapshot.

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

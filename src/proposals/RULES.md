# /lab proposal rules (shared by every proposal)

Each proposal is a complete, alternative homepage for akashjames.com, viewable at
`/#/lab/<slug>`. It reuses the same content module and the same story film. Read your
`BRIEF.md`, then this file, then build.

## Scope and files
- Work only in `src/proposals/<slug>/`, plus `public/fonts/<slug>/` (self-hosted fonts) and
  `public/lab/<slug>/` (any new static assets). Do not edit anything else: not
  `src/content/index.js`, not `src/proposals/shared/*`, not `SequenceCanvas`, not
  `App.jsx`, not `index.css`. If a shared change is needed, say so in your report.
- Entry: `src/proposals/<slug>/index.jsx` default export. Import your own CSS from it.
- Every CSS selector is prefixed with your proposal prefix (`.sj-`, `.mb-`, `.vs-`),
  including keyframes and custom properties you define. No global element selectors.
- Root element: `<main className="lab-root <prefix>-root">`.
- Do not commit.

## Content
- All facts come from `src/content/index.js`: PROFILE, ONE_LINERS, CAREER, BLUE_STACK,
  PROJECTS (+ `images[]`, `facts[]`, `pitch`, `story`, `status`), ARCHIVE, SKILLS, WRITING,
  TALKS, HONOURS, EDUCATION, OFF_DUTY, VIDEOS, STATS, BRAGS, LINKS, EMAIL.
- Microcopy (labels, jokes, section names) is yours and should be loud. Numbers and claims
  are not: never invent a stat, a client, a date or a quote.
- `private: true` projects (Veronica, CopCars.in) have no public source. Never link a repo
  or show code for them. CopCars links to `copcars.in`; Veronica links to `#/chat`.
- Show all 8 PROJECTS and all 6 BLUE_STACK items somewhere; ARCHIVE can be compact.
- Voice: sassy, braggy, a bit unhinged, British spelling. One great line beats five okay ones.

## The two things that must stay
1. **Pixel-assembly hero.** Render `<PixelAssembly />` (from `../shared/PixelAssembly.jsx`)
   inside a full-viewport, `position: sticky; top: 0` (or fixed) container that sits exactly
   over the film. The Golden Gate selfie flies together from pixels and crossfades into the
   film's first frame. Don't cover it with heavy UI during its first ~1.5 s; your hero UI
   can animate in as it lands (`onAssembled`).
2. **The deconstruct film.** Render
   `<SequenceCanvas acts={ACTS} layerClass="lab-film" scrim={…} compactActs={8} pane={null} />`
   (from `../../components/story/SequenceCanvas.jsx`). `ACTS` maps eight of your section ids,
   in scroll order, to `story-1` … `story-8`. Act k scrubs while its section scrolls through.
   The film is a fixed full-viewport canvas behind `.lab-root`. Act themes:
   1 Golden Gate selfie, circuits wake on his face · 2 dusk, shoulder armour assembles ·
   3 black void, PCB opens on his head · 4 chrome face plate, drone and lens schematics float
   beside him · 5 red eye ignites, a REC badge and an audio waveform · 6 orange glyph rain ·
   7 golden light, mirror polish · 8 final form, slow push-in.
   Use `useFilm(cb)` / `useFilmAct()` from `../shared/useFilm.js` for overlays synced to it.
   `state.rect` is where the 4:3 footage is drawn (CSS px), so a feature at footage
   coordinates (u, v) is at `rect.x + u*rect.w, rect.y + v*rect.h`. Frames live in
   `public/seq/story-N-*/d/0001.avif …` (desktop) if you need to look at them (convert
   with sharp to PNG to view).
- Call `useLoaderRelease('<weight> 1rem "<Your Display Font>"')` once at the root.

## Tech
- React 19, framer-motion 12, lucide-react are available. Lenis smooth scroll is already
  global. No new npm dependencies.
- Scroll-driven visuals go through the shared loop: `subscribe((y, now, dt) => stillMoving)`
  from `src/shared/scroll/scrollStore.js`. Write styles on refs; don't re-render React per
  frame. One rAF, no per-element scroll listeners.
- Animate transform and opacity. Lazy-load images with width/height set. Pause anything
  continuous when offscreen or when the tab is hidden.
- Fonts: self-hosted only (CSP `font-src 'self'`), OFL or similar open licence, woff2,
  in `public/fonts/<slug>/` with the licence file. Get woff2 from the Google Fonts CSS2 API
  with a modern browser User-Agent, or from the font's GitHub releases. Existing fonts:
  Clash Display, General Sans, JetBrains Mono (`/fonts/…`, already declared in index.html).

## Quality bar
- Works and looks intentional at 1440×900, 768×1024 and 390×844. Phones are first-class.
- `prefers-reduced-motion: reduce` gives a static, fully readable version.
- Keyboard: every interactive element is reachable and has a visible focus style.
- Body text contrast ≥ 4.5:1 against whatever is behind it (the film moves: use scrims,
  plates or halos where text sits over footage). No information only in a canvas.
- No emoji as icons. No generic cards-in-a-grid, no bento, no glassmorphism, no marquee
  tickers, no "scroll to explore" mouse icon, no pulsing "available" dot.

## Verify like a critic
- The dev server is already running at http://localhost:5173 (shared; don't restart it).
  Use Node through the shim: `export PATH=/tmp/aj-research/bin:$PATH`.
- Don't use the Synara in-app browser (it's shared). Use headless Chrome via `puppeteer-core`
  (`executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'`) to
  capture 1440×900 and 390×844 screenshots at several scroll positions and after key
  interactions; save them in `/tmp/aj-research/shots/<slug>/`, read them, and fix what
  looks weak. Wait for the loader (`#loader` removed) before capturing. Check the console
  for errors.
- `npx eslint src/proposals/<slug>` passes with 0 errors.
- Report: what you built, the signature interactions, files, screenshot paths, known gaps.

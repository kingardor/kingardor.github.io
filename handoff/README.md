# Portfolio Redesign — Handoff Package

This folder is the **complete redesign** of `kingardor.github.io`, ready to drop into your existing React 19 + Vite + Tailwind project.

## What's inside

```
handoff/
├── README.md                    ← this file
├── CLAUDE_CODE_PROMPT.md        ← paste this into Claude Code
├── index.css                    ← new global styles (merge with existing)
├── data.js                      ← all content. REPLACE PLACEHOLDER COPY.
├── assets/
│   └── hero.webp                ← your hero photo (already exists in repo)
└── components/
    ├── Hud.jsx                  ← HUD frame, reticle cursor, boot sequence
    ├── Backgrounds.jsx          ← 4 reactive canvas backgrounds
    ├── Hero.jsx                 ← hero, marquee, manifesto
    ├── Sections.jsx             ← career scrub, skills, projects, videos, writing, honours, transmission
    ├── Chrome.jsx               ← top nav, Veronica overlay, Tweaks panel
    └── hooks.js                 ← useReveal, useCanvas
```

## How to integrate

### 1. Fonts
Add to `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
```

### 2. Styles
Either (a) replace `src/index.css` with `handoff/index.css`, or (b) merge the new CSS vars and classes into your existing file. There's overlap with your existing `--nm-*` tokens — new ones use generic names like `--bg`, `--ink`, `--accent`, so nothing should collide.

### 3. Components
Copy `handoff/components/*` to `src/components/prototype/` (or wherever you prefer). The components are standard ES-module React — no `window` globals.

### 4. Data
Copy `handoff/data.js` to `src/data.js`. **Every field with `// TODO:` is placeholder copy — replace with real content before shipping.**

### 5. App
Update `src/App.jsx` — see `CLAUDE_CODE_PROMPT.md` for the exact App component.

### 6. Keep your real backend plumbing
The Veronica chat in `Chrome.jsx` has a stub `replyFor()` function. **Replace it with your SSE call** to `veronica-proxy-vercel/api/chat`. Your existing `ChatPage.jsx` has the real streaming logic — lift it into the new `Veronica` overlay component, or keep the old `#/chat` route and make the "ASK VERONICA" button navigate there instead of opening the overlay.

Similarly:
- **Projects** → replace `DATA.projects` with your existing GitHub API fetch
- **Videos** → use your existing `/api/youtube-feed`
- **Writing** → use your existing Medium rail fetch

## The 4 reactive backgrounds

Each runs on a `<canvas>` with DPR awareness, pauses when the tab is hidden, respects `prefers-reduced-motion`, and accepts an `accent` color prop:

- **`GridMeshBG`** — hero. Grid + drifting particles, both warp toward cursor
- **`DataRainBG`** — career scrub. Matrix-style glyph rain + scanline
- **`AuroraBG`** — contact. Animated radial blobs that drift toward cursor
- **`NeuralBG`** — Veronica overlay. Constellation of stars with connecting lines; pulse ring fires on every message send (pass an incrementing `pulseKey` prop)

## Browser targets
Modern evergreen. Uses `position: sticky`, `ResizeObserver`, `IntersectionObserver`, `backdrop-filter`, `svh` units. Graceful degradation where needed.

## Known things to polish in Claude Code
1. Replace placeholder copy in `data.js`
2. Wire Veronica to real SSE endpoint
3. Wire Projects/Videos/Writing to real APIs
4. Decide: keep new Veronica overlay, or redirect "ASK VERONICA" button to `#/chat` route
5. Add analytics if you had any
6. Accessibility pass: keyboard nav for video thumbs, focus states, alt text on hero photo

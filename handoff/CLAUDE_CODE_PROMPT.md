# Claude Code — Portfolio Redesign Task

## Context

You are working in `kingardor.github.io` — a React 19 + Vite + Tailwind SPA with hash routing. The current design is dark + red/pink accent + neumorphism. The user wants to replace the homepage design with a new editorial-cinematic direction while keeping the Veronica chat route (`#/chat`) and all existing backend integrations (veronica-proxy-vercel, GitHub API, YouTube RSS, Medium rail) intact.

## Deliverables

1. **Replace the homepage** (the `#/` route rendered by `App.jsx`) with the new design.
2. **Keep `#/chat`** exactly as-is — that route still renders the existing `ChatPage.jsx`.
3. **Preserve all live data fetching** — projects from GitHub API, videos from `/api/youtube-feed`, publications from Medium.
4. **Preserve the Veronica persona and SSE streaming** — the new "ASK VERONICA" button can either (a) open an overlay that uses the existing SSE chat logic, or (b) navigate to `#/chat`. Pick (b) if simpler — the existing ChatPage is richer than the overlay stub.
5. Commit with a clear message and push to the default branch.

## Source files provided (in `handoff/`)

```
handoff/
├── index.css                    new global styles
├── data.js                      all content (PLACEHOLDER COPY — see below)
├── components/
│   ├── Hud.jsx                  HUD frame, reticle, boot
│   ├── Backgrounds.jsx          4 reactive canvas backgrounds
│   ├── Hero.jsx                 Hero, Marquee, Manifesto
│   ├── Sections.jsx             Career, Skills, Projects, Videos, Writing, Honours, Transmission
│   ├── Chrome.jsx               TopNav, Veronica overlay, Tweaks panel
│   └── hooks.js                 useReveal, useCanvas
└── assets/hero.webp             hero photo
```

## Step-by-step

### Step 1 — Fonts
Add to `index.html` in `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
```

### Step 2 — Styles
Merge `handoff/index.css` into `src/index.css`. The new `:root` vars (`--bg`, `--ink`, `--accent`, `--accent-2`, `--display`, `--mono`, `--body`) are namespaced away from your existing `--nm-*` tokens — keep both. The component class names (`.hero`, `.career`, `.skills`, `.projects`, etc.) are all new — no collisions.

### Step 3 — Components
Copy `handoff/components/*` → `src/components/prototype/`.

### Step 4 — Data
Copy `handoff/data.js` → `src/data.js`.

**CRITICAL:** `data.js` contains **placeholder copy** I wrote from inference. Every `// TODO:` marker needs real content from the user. Flag these in your PR description. For now, if real data is obviously available in the existing codebase (e.g. career timeline lives in `veronica-proxy-vercel/api/index.py`), lift it. But do NOT guess bios or project descriptions — ask.

### Step 5 — Wire live data
Replace the static arrays in `data.js` with fetches where you already have APIs:

- `DATA.projects` → your existing GitHub repo fetch (keep featured-repo priority)
- `DATA.videos` → your existing `/api/youtube-feed` call
- `DATA.writing` → your existing Medium rail fetch
- `DATA.career`, `DATA.honours`, `DATA.skillGroups` → these live in `veronica-proxy-vercel/api/index.py`. Lift them into a shared source of truth (or keep them hardcoded in `data.js`).

### Step 6 — Veronica integration
The new `Veronica` component in `Chrome.jsx` has a demo `replyFor(q)` function. **Remove it.** Two options:

**Option A (simplest):** Make the "ASK VERONICA" button navigate to `#/chat`:
```jsx
<TopNav onAsk={() => window.location.hash = '#/chat'} />
```
And delete the `<Veronica>` overlay entirely.

**Option B:** Port the SSE streaming + tool-loop logic from `ChatPage.jsx` into the `Veronica` overlay. This gives a faster modal experience without leaving the page. More work.

Recommend **Option A** unless the user asks for the overlay.

### Step 7 — App.jsx

Wire everything together:

```jsx
import { useState, useEffect } from 'react';
import { Hud, Reticle, Boot } from './components/prototype/Hud';
import { Hero, Marquee, Manifesto } from './components/prototype/Hero';
import {
  Career, Skills, Projects, Videos, Writing, Honours, Transmission
} from './components/prototype/Sections';
import { TopNav } from './components/prototype/Chrome';
import ChatPage from './ChatPage';
import { useReveal } from './components/prototype/hooks';

function Home() {
  const [booting, setBooting] = useState(true);
  useReveal();

  useEffect(() => {
    document.body.style.overflow = booting ? 'hidden' : '';
  }, [booting]);

  const goChat = () => { window.location.hash = '#/chat'; };

  return (
    <>
      {booting && <Boot onDone={() => setBooting(false)} />}
      <Reticle />
      <Hud />
      <div className="grain" />
      <TopNav onAsk={goChat} />
      <main>
        <Hero bg={{ grid: true }} accent="#ef2b3a" />
        <Marquee />
        <Manifesto />
        <Career bg={{ rain: true }} accent="#ef2b3a" />
        <Skills />
        <Projects />
        <Videos />
        <Writing />
        <Honours />
        <Transmission onAsk={goChat} bg={{ aurora: true }} accent="#ef2b3a" />
      </main>
    </>
  );
}

export default function App() {
  const [route, setRoute] = useState(window.location.hash || '#/');
  useEffect(() => {
    const on = () => setRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  if (route.startsWith('#/chat')) return <ChatPage />;
  return <Home />;
}
```

### Step 8 — Assets
`handoff/assets/hero.webp` goes to `public/hero.webp` (already exists — verify paths in CSS: `background-image: url('/hero.webp')`).

### Step 9 — Remove legacy
The old homepage sections are no longer used. Delete or archive:
- The old Hero / About / Timeline / SkillsChart / Skills / Projects / Talks / YouTube / Publications / Honours / Contact / ChatFAB components from `App.jsx`
- Keep `ChatPage.jsx` untouched

### Step 10 — Verify
- `npm run dev` — homepage renders, scroll works, career pins correctly
- Click "ASK VERONICA" → routes to `#/chat` → existing chat still works
- No console errors
- Mobile: career stacks vertically instead of horizontal scrub
- All 4 canvas backgrounds render (check `document.querySelectorAll('canvas').length === 4`)

### Step 11 — Commit & push
```bash
git add -A
git commit -m "Redesign: editorial-cinematic homepage with reactive backgrounds

- New hero with scan-in AKASH JAMES + boot sequence
- Scroll-driven manifesto
- Pinned horizontal career scrub
- Oversized-type skills section
- Mission-files project grid
- CRT video stack
- 4 reactive canvas backgrounds (grid mesh, data rain, aurora, neural)
- Preserves #/chat route and all existing API integrations

See handoff/README.md for details."
git push
```

## Things to flag to the user in your PR

1. **Placeholder copy** — list every `TODO` in `data.js`. Get real copy before merging.
2. **Stat numbers** (12+ years, 50+ models, etc.) — confirm.
3. **Career dates and orgs** — confirm.
4. **Email address** — confirm the contact address.
5. **Social handles** — confirm usernames.
6. **Which Veronica strategy** — you picked Option A (redirect to `#/chat`). Confirm that's what they want.

## Hard constraints

- Do NOT modify the veronica-proxy-vercel backend.
- Do NOT change the `#/chat` route.
- Do NOT invent bio/project copy — use TODO markers if unknown.
- Keep all existing integrations working.

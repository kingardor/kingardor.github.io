# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server (localhost:5173)
npm run build     # Production build → dist/
npm run lint      # ESLint
npm run preview   # Preview production build locally
```

## Architecture

**Personal portfolio SPA** for Akash James (AI Architect). Built with React 19 + Vite + Tailwind CSS 4.

### Routing

Hash-based routing via the custom `useHashPath` hook — no React Router. The main router lives in `App.jsx`. Hash `/#/chat` loads the Chat page; all other hashes are anchors within the single scrolling page.

### Section Layout

`App.jsx` renders all sections vertically. Sections are in `src/sections/`, each as its own folder with an `index.jsx`. Heavy sections (`Chat`, `YouTube`) are lazy-loaded via `React.lazy`.

### Content / Data

All site content (roles, projects, social links, skill data, highlights) lives in `src/data.js`. Edit this file to update portfolio content without touching components.

### Chat ("Veronica" AI)

- Triggered via a floating action button (`ChatFAB`) or the hero prompt bar
- Uses **Server-Sent Events** (SSE) via `src/shared/utils/openSSE.js`
- Chat history persisted in session storage (`src/shared/utils/chatHistory.js`)
- Responses rendered as Markdown via `react-markdown` + `remark-gfm`
- Seeding a prompt from the hero bar uses `sessionStorage` to pass it to the Chat section

### Background Effects

`BgFX.jsx` integrates **Vanta.js** (loaded via CDN in `index.html` alongside p5.js). The `window.VANTA` global is used directly — no npm package.

### Skills Radar

Rendered with **Recharts** `RadarChart` inside the Skills/Timeline section. Data comes from `data.js`.

### Animations

Framer Motion configs (variants, transitions) are centralized in `src/shared/utils/motion.js`. Import from there rather than defining inline.

### Deployment

GitHub Actions (`.github/workflows/pages.yml`) builds on push to `main` and deploys to GitHub Pages. `dist/404.html` is a copy of `dist/index.html` to support SPA hash routing fallback.

### External APIs

- **CounterAPI** — site visit counter (`useSiteViews` hook)
- **YouTube Data API** — fetched in `fetchYoutubeVideos.js`
- **GitHub API** — fetched in `fetchGithubProjects.js`
- **SSE endpoint** — powers the Veronica chat assistant

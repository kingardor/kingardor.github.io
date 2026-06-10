import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import './shared/utils/prefetch.js' // kick off API fetches during loader window
import App from './App.jsx'
import { LenisProvider } from './shared/components/SmoothScroll'

// Prefetch the Chat chunk while the loader is showing so it's ready on first click
import('./sections/Chat/ChatPage').catch(() => {})

const loader = document.getElementById('loader')
const rootEl = document.getElementById('root')

const isPrerendered = rootEl.hasChildNodes()
const MIN_MS = 1700 // minimum loader display time so CSS animations complete

// Resolved by HeroSection.jsx once the display font is usable; 4s safety-release
const heroReadyPromise = new Promise(resolve => {
  window.__resolveHeroReady = resolve
  setTimeout(resolve, 4000)
})

const app = (
  <StrictMode>
    <LenisProvider>
      <App />
    </LenisProvider>
  </StrictMode>
)

if (isPrerendered) {
  hydrateRoot(rootEl, app)
} else {
  createRoot(rootEl).render(app)
}

// Skip loader dismissal during build-time prerender so the snapshot includes the
// loader div. window.__PRERENDER is injected by prerender.mjs via evaluateOnNewDocument
// and is never present in real browsers.
if (loader && !window.__PRERENDER) {
  const elapsed = Date.now() - (window.__LOADER_START ?? Date.now())
  const remaining = Math.max(0, MIN_MS - elapsed)
  Promise.all([
    new Promise(r => setTimeout(r, remaining)),
    heroReadyPromise,
  ]).then(() => {
    loader.style.opacity = '0'
    loader.style.pointerEvents = 'none'
    setTimeout(() => loader.remove(), 600)
  })
}

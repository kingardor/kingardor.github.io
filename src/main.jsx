import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './shared/utils/prefetch.js' // kick off API fetches during loader window
import App from './App.jsx'
import { LenisProvider } from './shared/components/SmoothScroll'
import { currentEdition, lastEdition } from './editions/editions.js'

const loader = document.getElementById('loader')
const rootEl = document.getElementById('root')

const MIN_MS = 1700 // minimum loader display time so CSS animations complete

// Resolved by HeroSection.jsx once the display font is usable; 4s safety-release
const heroReadyPromise = new Promise(resolve => {
  window.__resolveHeroReady = resolve
  setTimeout(resolve, 4000)
})

// Wait for the opening act's coarse frames (see sequenceStore) on the first
// home visit — never longer than STORY_CAP_MS from boot, however slow the link.
const STORY_CAP_MS = 5000
const isChat = () => location.hash.startsWith('#/chat')
// Pages without the story film: the chat, and the /lab index of design proposals
const noFilm = () => isChat() || /^#\/lab(\/bench)?\/?$/.test(location.hash)
const storyReady = new Promise(resolve => {
  if (!loader || window.__PRERENDER || noFilm()) { resolve(); return }
  const bar = loader.querySelector('.loader-bar-fill')
  const sinceBoot = Date.now() - (window.__LOADER_START ?? Date.now())
  const timer = setTimeout(finish, Math.max(0, STORY_CAP_MS - sinceBoot))
  function finish() {
    clearTimeout(timer)
    window.removeEventListener('hashchange', routeChanged)
    delete window.__storyProgress
    resolve()
  }
  function routeChanged() { if (isChat()) finish() }
  window.addEventListener('hashchange', routeChanged)
  window.__storyProgress = (done, total) => {
    if (bar) {
      bar.style.animation = 'none'
      bar.style.width = (100 * done / total) + '%'
    }
    if (done >= total) finish()
  }
})

const app = (
  <StrictMode>
    <LenisProvider>
      <App />
    </LenisProvider>
  </StrictMode>
)

// The prerendered markup in #root exists for crawlers and no-JS visitors. It is
// a snapshot taken after effects ran (live clock, fetched data, finished
// intros), so it can never match a first client render — hydrating it always
// failed (React #418) and re-rendered anyway. Render fresh instead: React
// replaces the snapshot on first commit, hidden under the loader.
createRoot(rootEl).render(app)

// Warm the chat the moment a visitor reaches for a chat link (hover, focus or
// touch), so it opens fast without loading half a megabyte of chat code while
// they scroll: the route plus the skin they will see (their edition).
function warmChat() {
  if (isChat()) return
  let done = false
  const go = (e) => {
    if (done || !e.target?.closest?.('a[href^="#/chat"]')) return
    done = true
    for (const t of ['pointerover', 'focusin', 'touchstart']) document.removeEventListener(t, go, true)
    import('./sections/Chat/ChatRoute.jsx').catch(() => {})
    const ed = currentEdition() || lastEdition() || 'mint'
    if (ed === 'versus') import('./sections/Chat/skins/versus/VersusChat.jsx').catch(() => {})
    else import('./sections/Chat/skins/mint/MintChat.jsx').catch(() => {})
  }
  for (const t of ['pointerover', 'focusin', 'touchstart']) document.addEventListener(t, go, { capture: true, passive: true })
}

// Skip loader dismissal during build-time prerender so the snapshot includes the
// loader div. window.__PRERENDER is injected by prerender.mjs via evaluateOnNewDocument
// and is never present in real browsers.
if (loader && !window.__PRERENDER) {
  const elapsed = Date.now() - (window.__LOADER_START ?? Date.now())
  const remaining = Math.max(0, MIN_MS - elapsed)
  Promise.all([
    new Promise(r => setTimeout(r, remaining)),
    isChat() ? Promise.resolve() : heroReadyPromise,
    storyReady,
  ]).then(() => {
    warmChat()
    loader.style.opacity = '0'
    loader.style.pointerEvents = 'none'
    setTimeout(() => loader.remove(), 600)
  })
}

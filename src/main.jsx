import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './shared/utils/prefetch.js' // kick off API fetches during loader window
import App from './App.jsx'
import { LenisProvider } from './shared/components/SmoothScroll'

const loader = document.getElementById('loader')
const rootEl = document.getElementById('root')

const MIN_MS = 1700 // minimum loader display time so CSS animations complete

// Resolved by HeroSection.jsx once the display font is usable; 4s safety-release
const heroReadyPromise = new Promise(resolve => {
  window.__resolveHeroReady = resolve
  setTimeout(resolve, 4000)
})

// Wait for the compressed sequence and its seek previews on the first home visit.
const isChat = () => location.hash.startsWith('#/chat')
const storyReady = new Promise(resolve => {
  if (!loader || window.__PRERENDER || isChat()) { resolve(); return }
  const bar = loader.querySelector('.loader-bar-fill')
  let timer
  function finish() {
    clearTimeout(timer)
    window.removeEventListener('hashchange', routeChanged)
    delete window.__storyProgress
    resolve()
  }
  function routeChanged() { if (isChat()) finish() }
  window.addEventListener('hashchange', routeChanged)
  window.__storyProgress = (done, total) => {
    clearTimeout(timer)
    if (bar) {
      bar.style.animation = 'none'
      bar.style.width = (100 * done / total) + '%'
    }
    if (done === total) finish()
    else timer = setTimeout(finish, 12000) // A stalled connection must leave the page usable.
  }
  window.__storyProgress(0, 1)
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
    import('./sections/Chat/ChatPage').catch(() => {})
    loader.style.opacity = '0'
    loader.style.pointerEvents = 'none'
    setTimeout(() => loader.remove(), 600)
  })
}

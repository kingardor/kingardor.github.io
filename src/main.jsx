import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './shared/contexts/ThemeContext'

const loader = document.getElementById('loader')
const rootEl = document.getElementById('root')

// When the page is pre-rendered (react-snap), #root already has child nodes
// and React only needs to hydrate (attach event handlers) — very fast.
// In that case dismiss the loader quickly.
// When rendering from scratch (CSR), keep the loader up so the CSS animations
// complete before fading out.
const isPrerendered = rootEl.hasChildNodes()
const MIN_MS = isPrerendered ? 300 : 1700

const app = (
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
)

if (isPrerendered) {
  hydrateRoot(rootEl, app)
} else {
  createRoot(rootEl).render(app)
}

if (loader) {
  const elapsed = Date.now() - (window.__LOADER_START ?? Date.now())
  const remaining = Math.max(0, MIN_MS - elapsed)
  setTimeout(() => {
    loader.style.opacity = '0'
    loader.style.pointerEvents = 'none'
    setTimeout(() => loader.remove(), 600)
  }, remaining)
}

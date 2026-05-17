import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import './shared/utils/prefetch.js' // kick off API fetches during loader window
import App from './App.jsx'
import { ThemeProvider } from './shared/contexts/ThemeContext'
import { LenisProvider } from './shared/components/SmoothScroll'

// Prefetch the Chat chunk while the loader is showing so it's ready on first click
import('./sections/Chat/ChatPage').catch(() => {})

const loader = document.getElementById('loader')
const rootEl = document.getElementById('root')

const isPrerendered = rootEl.hasChildNodes()
const MIN_MS = 1700

const app = (
  <StrictMode>
    <ThemeProvider>
      <LenisProvider>
        <App />
      </LenisProvider>
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

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './shared/contexts/ThemeContext'

const loader = document.getElementById('loader')
// Ensure the loader stays visible long enough for all CSS animations to complete
// (bar fill finishes at ~1.65s from page load, so MIN_MS covers it)
const MIN_MS = 1700

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)

if (loader) {
  const elapsed = Date.now() - (window.__LOADER_START ?? Date.now())
  const remaining = Math.max(0, MIN_MS - elapsed)
  setTimeout(() => {
    loader.style.opacity = '0'
    loader.style.pointerEvents = 'none'
    setTimeout(() => loader.remove(), 600)
  }, remaining)
}

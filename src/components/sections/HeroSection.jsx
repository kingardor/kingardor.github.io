import { useRef, useEffect, useState } from 'react'
import { DATA } from '../prototype/dataAdapter.js'
import { CHAT_SUGGESTIONS } from '../../data.js'
import DecryptedText from '../prototype/reactbits/DecryptedText.jsx'

const SEED_KEY = 'chat:seed'

// ── Scroll choreography (p = 0..1 across the 240vh zone) ────────────────────
const CONTENT_FADE_START = 0.04 // p: name/tagline/pill start fading
const CONTENT_FADE_END   = 0.30 // p: fully gone
const CUE_FADE_OUT       = 0.06 // p: scroll cue gone
const REVEAL_START       = 0.42 // p: manifesto words begin to land
const REVEAL_END         = 0.88 // p: manifesto fully shown
const STATS_FADE_START   = 0.86 // p: stat line materializes at the tail

/** Normalized scroll progress [0,1] for a sticky scroll zone. */
function calcScrollProgress(el) {
  const rect = el.getBoundingClientRect()
  return Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)))
}

function HeroChatPill() {
  const [text, setText] = useState('')
  const [ghost, setGhost] = useState('')
  const [phase, setPhase] = useState('typing')
  const [idx, setIdx] = useState(0)
  const suggestions = CHAT_SUGGESTIONS || ['Ask me anything...']

  useEffect(() => {
    const s = suggestions[idx] || ''
    let t
    if (phase === 'typing') {
      if (ghost.length < s.length) t = setTimeout(() => setGhost(s.slice(0, ghost.length + 1)), 22)
      else t = setTimeout(() => setPhase('pause'), 1200)
    } else if (phase === 'pause') {
      t = setTimeout(() => setPhase('deleting'), 300)
    } else if (phase === 'deleting') {
      if (ghost.length) t = setTimeout(() => setGhost(s.slice(0, ghost.length - 1)), 10)
      else { setIdx(i => (i + 1) % suggestions.length); setPhase('typing') }
    }
    return () => clearTimeout(t)
  }, [ghost, phase, idx, suggestions])

  const submit = (e) => {
    e.preventDefault()
    const q = text.trim()
    if (q) {
      try { sessionStorage.setItem(SEED_KEY, q) } catch { /* private mode */ }
      location.hash = `/chat?q=${encodeURIComponent(q)}`
    } else {
      location.hash = '/chat'
    }
  }

  return (
    <form className="ob-pill" onSubmit={submit}>
      <span className="ob-pill-sigil">V</span>
      <div className="ob-pill-input-wrap">
        <input
          className="ob-pill-input"
          value={text}
          onChange={e => setText(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          aria-label="Ask Veronica"
        />
        {!text && (
          <span className="ob-pill-ghost" aria-hidden>
            {ghost}<span className="ob-pill-cursor" />
          </span>
        )}
      </div>
      <button type="submit" className="ob-pill-submit" aria-label="Send">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M3 13L13 3M13 3H6M13 3V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
        </svg>
      </button>
    </form>
  )
}

export default function HeroSection() {
  const zoneRef = useRef(null)
  const coreRef = useRef(null)
  const manifestoRef = useRef(null)
  const statsRef = useRef(null)
  const cueRef = useRef(null)

  // Loader gate: release once Clash Display is usable (raced with a 3s cap)
  // so the name's first paint is the real face, not a fallback flash.
  // Cross-module contract with main.jsx (__resolveHeroReady + 4s safety).
  useEffect(() => {
    const release = () => { window.__resolveHeroReady?.(); window.__resolveHeroReady = null }
    Promise.race([
      document.fonts?.load('600 1rem "Clash Display"') ?? Promise.resolve(),
      new Promise(r => setTimeout(r, 3000)),
    ]).then(release, release)
  }, [])

  useEffect(() => {
    const zone = zoneRef.current
    const core = coreRef.current
    const manifesto = manifestoRef.current
    const stats = statsRef.current
    const cue = cueRef.current
    if (!zone) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Static fallback: everything visible, no scroll choreography
      manifesto?.querySelectorAll('.ob-mani-word').forEach(w => { w.style.opacity = '1' })
      if (stats) stats.style.opacity = '1'
      return
    }

    const onScroll = () => {
      const p = calcScrollProgress(zone)

      // Name/tagline/pill fade up and away
      const cp = Math.max(0, Math.min(1, (p - CONTENT_FADE_START) / (CONTENT_FADE_END - CONTENT_FADE_START)))
      if (core) {
        core.style.opacity = (1 - cp).toFixed(3)
        core.style.transform = `translateY(${(cp * -36).toFixed(1)}px)`
        core.style.pointerEvents = cp > 0.6 ? 'none' : ''
      }
      if (cue) cue.style.opacity = (1 - Math.min(1, p / CUE_FADE_OUT)).toFixed(3)

      // Manifesto: word-by-word materialize
      if (manifesto) {
        const words = manifesto.querySelectorAll('.ob-mani-word')
        const n = words.length
        const mP = Math.max(0, Math.min(1, (p - REVEAL_START) / (REVEAL_END - REVEAL_START)))
        // Ghost base scales with the content fade so words never bleed
        // through the name while it's still on screen
        words.forEach((w, i) => {
          const wP = Math.max(0, Math.min(1, mP * n - i))
          w.style.opacity = (cp * 0.08 + wP * 0.92).toFixed(3)
          w.style.transform = `translateY(${((1 - wP) * 14).toFixed(1)}px)`
        })
      }

      // Stat line lands last
      if (stats) {
        const sP = Math.max(0, Math.min(1, (p - STATS_FADE_START) / (1 - STATS_FADE_START)))
        stats.style.opacity = sP.toFixed(3)
        stats.style.transform = `translateY(${((1 - sP) * 10).toFixed(1)}px)`
      }
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToCareer = () => {
    document.getElementById('career')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="ob-hero" id="top" data-screen-label="01 Hero" ref={zoneRef}>
      <div className="ob-hero-pin">
        <div className="ob-hero-core" ref={coreRef}>
          <h1 className="ob-hero-name">
            <span className="ob-line"><span className="ob-line-inner">AKASH</span></span>
            <span className="ob-line"><span className="ob-line-inner d2">JAMES<span className="ob-ember">.</span></span></span>
          </h1>
          <p className="ob-hero-tag mono-ob">
            <DecryptedText
              text="AI ARCHITECT — GPU TO PROD. AGENTS THAT CLOSE LOOPS."
              animateOn="view"
              sequential
              speed={16}
            />
          </p>
          <HeroChatPill />
        </div>

        <div className="ob-hero-manifesto" ref={manifestoRef} aria-hidden="true">
          <div className="ob-mani-label mono-ob ob-mani-word">MANIFESTO · 001</div>
          <p className="ob-mani-text">
            {DATA.manifesto.flatMap((w, i) => [
              <span key={i} className={`ob-mani-word${w.accent ? ' ember' : ''}`}>{w.txt}</span>,
              ' ',
            ])}
          </p>
          <div className="ob-hero-stats mono-ob" ref={statsRef}>
            {DATA.stats
              .filter(s => s.label !== 'COFFEE UNITS')
              .map(s => `${s.num} ${s.label}`)
              .join(' · ')}
          </div>
        </div>

        <button
          className="ob-hero-cue mono-ob"
          ref={cueRef}
          onClick={scrollToCareer}
          aria-label="Scroll to career"
        >
          <span className="ob-cue-line" />
          SCROLL
        </button>
      </div>
    </section>
  )
}

/** Static keyword strip — replaces the draggable marquee. */
export function KeywordStrip() {
  const items = ['AGENTS', 'MULTIMODAL', 'VISION', 'EDGE', 'CUDA', 'LLMS', 'DEEPSTREAM', 'RAG', 'JETSON', 'TENSORRT']
  return (
    <div className="ob-keywords mono-ob" aria-hidden="true">
      {items.map((t, i) => <span key={i}>{t}</span>)}
    </div>
  )
}

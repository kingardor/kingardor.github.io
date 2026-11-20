import { useEffect, useRef, useState } from 'react'
import { subscribe, kick } from '../../shared/scroll/scrollStore.js'
import { createSequenceStore } from './sequenceStore.js'

// Scroll acts: each section scrubs its own footage. Consecutive segments
// share boundary keyframes, so act i's last frame is act i+1's first and the
// handoff is invisible.
const ACTS = [
  { id: 'top', seq: 'story-1' },      // selfie → circuits wake, dusk falls
  { id: 'career', seq: 'story-2' },   // armor assembles, blueprints
  { id: 'skills', seq: 'story-3' },   // head opens: PCB + wiring
  { id: 'projects', seq: 'story-4' }, // chrome plate completes, schematics
  { id: 'videos', seq: 'story-5' },   // red eye ignites, REC
  { id: 'writing', seq: 'story-6' },  // glyph rain
  { id: 'honours', seq: 'story-7' },  // mirror polish
  { id: 'contact', seq: 'story-8' },  // final form push-in
]

const FOLLOW = 14        // 1/s — how fast the shown frame settles onto scroll
const SNAP_ACTS = 1.5    // jumps further than this (dock, ⌘K) cut instead of scrubbing
const FOCUS_Y = 0.22     // object-position y: keep the face in frame
const MAX_DPR = 1.5

/**
 * Fixed full-viewport story layer. Footage is an image sequence drawn to a
 * canvas, and the frame is a pure function of scroll position — scroll down
 * and back to the same spot and you see the same frame. A light follow
 * smooths wheel steps; adjacent frames crossfade by the fractional position,
 * so even 15fps source reads as continuous motion. No video decoders, no
 * seeks, symmetric forwards and backwards on every browser.
 * Reduced motion / prerender / no AVIF → static poster.
 */
export default function SequenceCanvas() {
  const canvasRef = useRef(null)
  const stillRef = useRef(null)
  const [fallback, setFallback] = useState(
    () => typeof window === 'undefined' || !!window.__PRERENDER ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    if (fallback) { window.__storyProgress?.(1, 1); return }
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx || typeof createImageBitmap !== 'function') { setFallback(true); return }
    const mobile = window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches
    const store = createSequenceStore({
      variant: mobile ? 'm' : 'd',
      onProgress: (done, total) => window.__storyProgress?.(done, total),
      onError: () => setFallback(true),
    })

    // ── Timeline: act k owns [start_k, start_k+1); P = k + progress ──
    let acts = []
    const compact = window.matchMedia('(max-width: 900px), (max-width: 1000px) and (max-height: 500px)')
    let maxScroll = 1
    const measure = () => {
      const vh = window.innerHeight
      maxScroll = Math.max(1, document.documentElement.scrollHeight - vh)
      const visibleActs = compact.matches ? ACTS.slice(0, 1) : ACTS
      if (compact.matches) {
        const pane = document.querySelector('.portfolio')
        if (pane) maxScroll = Math.max(1, pane.getBoundingClientRect().top + window.scrollY)
      }
      acts = visibleActs
        .map(a => ({ ...a, el: document.getElementById(a.id) }))
        .filter(a => a.el && store.countOf(a.seq))
        .map((a, k) => ({
          ...a,
          start: k === 0 ? 0 : Math.min(maxScroll - 1, Math.max(0, a.el.getBoundingClientRect().top + window.scrollY - vh * 0.85)),
        }))
      acts.forEach((a, k) => { a.end = k < acts.length - 1 ? Math.max(a.start + 1, acts[k + 1].start) : maxScroll })
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      const width = Math.round(window.innerWidth * dpr)
      const height = Math.round(vh * dpr)
      if (canvas.width !== width) canvas.width = width
      if (canvas.height !== height) canvas.height = height
      visibleActs.forEach(a => store.load(a.seq))
      dirty = true
      kick()
    }
    const targetOf = (y) => {
      for (let k = acts.length - 1; k >= 0; k--) {
        if (y >= acts[k].start) return k + Math.min(0.9999, (y - acts[k].start) / (acts[k].end - acts[k].start))
      }
      return 0
    }

    // ── Drawing ──
    const cover = (bmp) => {
      const cw = canvas.width, ch = canvas.height
      const s = Math.max(cw / bmp.width, ch / bmp.height)
      const w = bmp.width * s, h = bmp.height * s
      return [(cw - w) / 2, (ch - h) * FOCUS_Y, w, h]
    }
    let shown = -1
    let dirty = true
    let activeAct = -1
    const debug = location.search.includes('seqdebug') ? (window.__seq = {}) : null
    const draw = (P) => {
      const k = Math.max(0, Math.min(acts.length - 1, Math.floor(P)))
      const act = acts[k]
      if (!act) return
      const n = store.countOf(act.seq)
      const f = Math.min(n - 1, Math.max(0, (P - k) * (n - 1)))
      const i0 = Math.floor(f)
      const frac = f - i0

      if (k !== activeAct) {
        activeAct = k
        const ahead = acts[k + 1]?.seq, behind = acts[k - 1]?.seq
        store.prioritise([act.seq, ahead, behind].filter(Boolean))
        store.releaseOthers([act.seq, ahead, behind].filter(Boolean))
      }
      store.focus(act.seq, i0)

      const base = store.nearest(act.seq, i0)
      if (base) {
        ctx.globalAlpha = 1
        ctx.drawImage(base.bmp, ...cover(base.bmp))
        const next = base.i === i0 && frac > 0.02 ? store.nearest(act.seq, i0 + 1) : null
        if (next && next.i === i0 + 1) {
          ctx.globalAlpha = frac
          ctx.drawImage(next.bmp, ...cover(next.bmp))
          ctx.globalAlpha = 1
        }
      }
      if (debug) Object.assign(debug, { P, k, i0, frac, base: base?.i, acts: acts.map(a => [a.id, Math.round(a.start), Math.round(a.end)]) })
      // The full-res still covers the opening frames (1024w footage reads soft)
      if (stillRef.current && base) {
        stillRef.current.style.opacity = k === 0 ? String(Math.max(0, 1 - f / 3).toFixed(3)) : '0'
      }
    }

    store.onReady = () => { dirty = true; kick() }
    const off = subscribe((y, now, dt) => {
      if (!acts.length || (compact.matches && y >= maxScroll)) return false
      const target = targetOf(y)
      const previous = shown
      if (shown < 0 || Math.abs(target - shown) > SNAP_ACTS) shown = target
      else shown += (target - shown) * (1 - Math.exp(-FOLLOW * dt))
      const settling = Math.abs(target - shown) > 1e-4
      if (!settling) shown = target
      if (shown !== previous || dirty) { dirty = false; draw(shown) }
      return settling
    })

    measure()
    store.prioritise([acts[0]?.seq, acts[1]?.seq].filter(Boolean))

    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    window.addEventListener('resize', measure)
    return () => {
      off()
      ro.disconnect()
      window.removeEventListener('resize', measure)
      store.dispose()
    }
  }, [fallback])

  if (fallback) return <div className="story-layer story-poster" aria-hidden="true" />

  return (
    <div className="story-layer" aria-hidden="true">
      <canvas ref={canvasRef} className="story-canvas" />
      <img ref={stillRef} className="story-still" src="/hero.webp" alt="" />
      <div className="story-scrim" />
    </div>
  )
}

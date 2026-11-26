// VERSUS motion kit: slams, shakes, flashes and the announcer bus.
// Everything is Web Animations on refs (no React renders per frame) and
// everything is a no-op under prefers-reduced-motion.
import { useEffect, useRef, useState } from 'react'

export const reduced = () =>
  typeof window === 'undefined' ||
  !!window.__PRERENDER ||
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Translate-only shake that decays over `ms`. */
export function shake(el, px = 6, ms = 300, delay = 0) {
  if (!el || reduced()) return
  const steps = 9
  const frames = []
  for (let i = 0; i <= steps; i++) {
    const k = 1 - i / steps
    const a = px * k * k
    const sx = i % 2 ? -1 : 1
    frames.push({ transform: `translate(${(sx * a).toFixed(2)}px, ${(-sx * a * 0.6).toFixed(2)}px)` })
  }
  frames[frames.length - 1] = { transform: 'translate(0, 0)' }
  el.animate(frames, { duration: ms, delay, easing: 'linear', composite: 'add' })
}

/** One-frame white flash on the shared flash layer. */
export function flash(strength = 0.85, color = '#fff') {
  if (reduced()) return
  const el = document.querySelector('.vs-flash')
  if (!el) return
  el.style.background = color
  el.animate(
    [{ opacity: strength }, { opacity: strength, offset: 0.35 }, { opacity: 0 }],
    { duration: 90, easing: 'steps(3, end)' },
  )
}

/** Slam: scale in with overshoot, hit-stop, then settle. */
export function slam(el, { from = 1.8, delay = 0, dur = 420, rot = 0 } = {}) {
  if (!el || reduced()) return null
  return el.animate(
    [
      { transform: `scale(${from}) rotate(${rot}deg)`, opacity: 0 },
      { transform: 'scale(0.94) rotate(0deg)', opacity: 1, offset: 0.42 },
      { transform: 'scale(0.94) rotate(0deg)', opacity: 1, offset: 0.58 }, // hit-stop (~70 ms)
      { transform: 'scale(1.03) rotate(0deg)', opacity: 1, offset: 0.78 },
      { transform: 'scale(1) rotate(0deg)', opacity: 1 },
    ],
    { duration: dur, delay, easing: 'cubic-bezier(.2,.9,.2,1)', fill: 'backwards' },
  )
}

// ── Announcer: round calls, finishers, toasts ──
const bus = new EventTarget()
export function announce(detail) {
  bus.dispatchEvent(new CustomEvent('call', { detail }))
}
/** Announce only if `el` is still on screen a beat later (fast scrolls skip it). */
export function announceIf(el, detail, delay = 160) {
  setTimeout(() => {
    const r = el?.getBoundingClientRect()
    if (r && r.top < window.innerHeight * 0.9 && r.bottom > window.innerHeight * 0.1) announce(detail)
  }, delay)
}
export function onAnnounce(fn) {
  const h = (e) => fn(e.detail)
  bus.addEventListener('call', h)
  return () => bus.removeEventListener('call', h)
}

// VS screen open state, so cut-ins and calls stay out of the way.
let vsOpen = false
export const setVsOpen = (v) => { vsOpen = v; bus.dispatchEvent(new CustomEvent('vs', { detail: v })) }
export const isVsOpen = () => vsOpen
export function useVsOpen() {
  const [open, setOpen] = useState(vsOpen)
  useEffect(() => {
    const h = (e) => setOpen(e.detail)
    bus.addEventListener('vs', h)
    return () => bus.removeEventListener('vs', h)
  }, [])
  return open
}

/**
 * Fires `onEnter` once each time the element's top crosses `line` (fraction
 * of the viewport from the top) going down, or every time it enters if
 * `repeat` is set. Returns a ref.
 */
export function useEnter(onEnter, { line = 0.6, once = true } = {}) {
  const ref = useRef(null)
  const cb = useRef(onEnter)
  useEffect(() => { cb.current = onEnter })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let done = false
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting && !(once && done)) {
          done = true
          cb.current?.(e.target)
        }
      }
    }, { rootMargin: `0px 0px -${Math.round((1 - line) * 100)}% 0px` })
    io.observe(el)
    return () => io.disconnect()
  }, [line, once])
  return ref
}

/** Boolean in-view state (for things that should only run while visible). */
export function useInView(margin = '0px') {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: margin })
    io.observe(el)
    return () => io.disconnect()
  }, [margin])
  return [ref, inView]
}

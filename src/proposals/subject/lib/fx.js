import { useEffect, useState } from 'react'

export const reducedMotion = () =>
  typeof window !== 'undefined' &&
  (!!window.__PRERENDER || window.matchMedia('(prefers-reduced-motion: reduce)').matches)

const COMPACT_Q = '(max-width: 900px), (max-width: 1000px) and (max-height: 500px)'
export function useCompact() {
  const [c, setC] = useState(() => typeof window !== 'undefined' && window.matchMedia(COMPACT_Q).matches)
  useEffect(() => {
    const mq = window.matchMedia(COMPACT_Q)
    const on = () => setC(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return c
}

export function useReduced() {
  const [r] = useState(reducedMotion)
  return r
}

const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&*+=<>/'
const DIGITS = '0123456789'
const running = new WeakMap()

/**
 * Scramble-type `text` into `el` over ~`ms`. Characters resolve left to right;
 * unresolved ones flicker through glyphs. Spaces and punctuation stay put.
 */
export function scramble(el, text, { ms = 250, digitsOnly = false } = {}) {
  if (!el) return
  const prev = running.get(el)
  if (prev) cancelAnimationFrame(prev)
  if (reducedMotion() || !text) { el.textContent = text; return }
  const pool = digitsOnly ? DIGITS : GLYPHS
  const t0 = performance.now()
  const step = (now) => {
    const p = Math.min(1, (now - t0) / ms)
    const n = Math.floor(p * text.length)
    let out = text.slice(0, n)
    for (let i = n; i < text.length; i++) {
      const c = text[i]
      if (digitsOnly ? !/\d/.test(c) : /[\s·.,:;'’()\-–—×→←#@/]/.test(c)) out += c
      else out += pool[(Math.random() * pool.length) | 0]
    }
    el.textContent = out
    if (p < 1) running.set(el, requestAnimationFrame(step))
    else { el.textContent = text; running.delete(el) }
  }
  running.set(el, requestAnimationFrame(step))
}

/** Where the film draws its 4:3 footage (cover, focus 22%) — used before the first draw. */
export function fallbackRect() {
  const vw = window.innerWidth, vh = window.innerHeight
  const w = Math.max(vw, (vh * 4) / 3), h = (w * 3) / 4
  return { x: (vw - w) / 2, y: (vh - h) * 0.22, w, h }
}

// A tiny bus: the hero tells the film overlay when the lock-on may start.
const lockSubs = new Set()
let locked = false
export const isLocked = () => locked
export function setLocked() { if (locked) return; locked = true; lockSubs.forEach(f => f()) }
export function onLocked(fn) { lockSubs.add(fn); return () => lockSubs.delete(fn) }

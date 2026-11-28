/**
 * Decorative loops (shimmers, wobbles, bobs) play a few times when their element
 * comes on screen, then rest. An endless CSS loop makes the browser redraw the
 * screen, portrait stage included, every frame for as long as the page is open,
 * even when nobody touches it (measured: Mint's hero redrew 60 times a second).
 *
 *   <span className="mb-set-foil" ref={onscreen}>…</span>
 *
 * The element gets `is-onscreen` while visible; its CSS runs a finite animation
 * only under that class, so it replays each time the element scrolls back into
 * view. A ref (not a page-wide query) so elements that mount later, like the
 * unlocked chase box, are covered too. One shared observer for the whole page.
 */
let io = null

function observer() {
  if (!io && typeof IntersectionObserver !== 'undefined') {
    io = new IntersectionObserver((entries) => {
      for (const e of entries) e.target.classList.toggle('is-onscreen', e.isIntersecting)
    }, { threshold: 0.25 })
  }
  return io
}

/** Ref callback (React 19 runs the returned cleanup on unmount). */
export function onscreen(el) {
  const o = observer()
  if (!el || !o) return undefined
  o.observe(el)
  return () => o.unobserve(el)
}

/**
 * scrollStore — the one rAF loop every scroll-driven visual shares.
 *
 * The page scrolls natively (Lenis only runs scripted scrollTo calls), and
 * both move the real scroll position, so listening to `scroll` is enough: each scroll (or resize) wakes the loop, subscribers run
 * with the current scrollY, and the loop goes back to sleep unless a
 * subscriber returns `true` (it is still easing toward its target). An idle
 * page costs zero frames.
 *
 *   const off = subscribe((y, now, dt) => { …draw…; return stillMoving })
 */

const subs = new Set()
let raf = 0
let lastNow = 0
let listening = false

function tick(now) {
  raf = 0
  const dt = lastNow ? Math.min(0.05, (now - lastNow) / 1000) : 1 / 60
  lastNow = now
  const y = window.scrollY
  let again = false
  for (const fn of subs) if (fn(y, now, dt)) again = true
  if (again) raf = requestAnimationFrame(tick)
  else lastNow = 0
}

/** Wake the loop for at least one frame. */
export function kick() {
  if (!raf && typeof window !== 'undefined') raf = requestAnimationFrame(tick)
}

export function subscribe(fn) {
  if (!listening) {
    listening = true
    window.addEventListener('scroll', kick, { passive: true })
    window.addEventListener('resize', kick)
  }
  subs.add(fn)
  kick()
  return () => { subs.delete(fn) }
}

import { useEffect } from 'react'
import { useLenis } from '../../shared/components/SmoothScroll.jsx'

// Section boundaries that demand their own scroll gesture. Free scrolling
// inside a section; crossing into the next one latches at its top until the
// current gesture's momentum dies and a fresh gesture arrives. Career then
// runs its own chapter stepper inside its pinned zone — same hold/gap feel.
const GATE_IDS = ['career', 'skills', 'projects', 'videos', 'writing', 'honours', 'contact']

const MIN_HOLD_MS = 350     // min latch time before a release is possible
const GESTURE_GAP_MS = 250  // wheel-event silence that marks a new gesture
const WHEEL_ACTIVE_MS = 200 // a crossing only latches if wheel-driven
const REARM_FRAC = 0.3      // re-arm a gate after moving 30vh away from it
const PRE_LATCH_PX = 150    // magnetic: latch from the wheel event itself
                            // when a gate is this close ahead — pre-empts
                            // CareerSection's stepper at its pin boundary

// Shared with CareerSection: its chapter stepper stands down while a gate
// holds, regardless of listener registration order.
export const gateState = { locked: false }

/**
 * Renderless: makes every section transition a discrete scroll event so the
 * page has one consistent rhythm (career chapters already step; without this,
 * every other boundary flew past in the same gesture).
 *
 * Desktop wheel only — touch, keyboard, scrollbar, dock jumps, palette
 * navigation and the guided tour all scroll programmatically or natively and
 * pass through untouched. Must mount BEFORE the sections so its capture-phase
 * wheel listener registers ahead of CareerSection's chapter stepper.
 */
export default function SectionGate() {
  const lenisRef = useLenis()

  useEffect(() => {
    if (
      window.matchMedia('(max-width: 900px)').matches ||
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) return

    let gates = []
    const measure = () => {
      gates = GATE_IDS
        .map(id => {
          const el = document.getElementById(id)
          return el ? el.getBoundingClientRect().top + window.scrollY : null
        })
        .filter(g => g !== null)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)

    let lock = null       // { y, at, lastWheelAt } while latched at a gate
    let suppressed = null // just-released gate, ignored until we move away
    let lastWheelAt = 0
    let prevY = window.scrollY

    const latch = (g) => {
      lock = { y: g, at: performance.now(), lastWheelAt: performance.now() }
      gateState.locked = true
      lenisRef.current?.scrollTo(g, { immediate: true })
    }

    const onScroll = () => {
      const y = window.scrollY
      if (lock) {
        // Residual Lenis momentum drifts past the latch — clamp every frame
        if (Math.abs(y - lock.y) > 2) lenisRef.current?.scrollTo(lock.y, { immediate: true })
        prevY = lock.y
        return
      }
      if (suppressed !== null && Math.abs(y - suppressed) > window.innerHeight * REARM_FRAC) {
        suppressed = null
      }
      const wheelDriven = performance.now() - lastWheelAt < WHEEL_ACTIVE_MS
      if (wheelDriven && y !== prevY) {
        const lo = Math.min(prevY, y)
        const hi = Math.max(prevY, y)
        const g = gates.find(g => g > lo && g <= hi && g !== suppressed)
        if (g !== undefined) latch(g)
      }
      prevY = y
    }

    const onWheel = (e) => {
      lastWheelAt = performance.now()
      if (!lock) {
        // Magnetic pre-latch: if this gesture is about to carry across a
        // nearby gate, claim it now — before any later handler can act
        const y = window.scrollY
        const dir = e.deltaY > 0 ? 1 : -1
        const g = gates.find(g =>
          g !== suppressed &&
          (dir > 0 ? g > y && g - y <= PRE_LATCH_PX : g < y && y - g <= PRE_LATCH_PX)
        )
        if (g === undefined) return // free scroll
        latch(g)
        e.preventDefault()
        e.stopImmediatePropagation()
        return
      }
      e.preventDefault()
      e.stopImmediatePropagation()
      const now = performance.now()
      if (now - lock.at >= MIN_HOLD_MS && now - lock.lastWheelAt >= GESTURE_GAP_MS) {
        suppressed = lock.y // fresh gesture: open the gate, don't re-latch it
        lock = null
        gateState.locked = false
        return
      }
      lock.lastWheelAt = now
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('wheel', onWheel, { passive: false, capture: true })
    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('wheel', onWheel, { capture: true })
    }
  }, [lenisRef])

  return null
}

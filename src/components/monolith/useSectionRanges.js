import { useEffect, useRef } from 'react'
import { STOPS } from './keyframes.js'

/**
 * Resolves the keyframe STOPS against the live DOM: measures each section's
 * scroll range and precomputes a global progress `p` (0..1, same scale as
 * Lenis progress) for every stop. Re-measures on layout changes.
 *
 * Returns a ref whose .current is the sorted, resolved stop list.
 */
export default function useSectionRanges() {
  const stopsRef = useRef([])

  useEffect(() => {
    const measure = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      const vh = window.innerHeight
      const resolved = []
      for (const stop of STOPS) {
        const el = document.getElementById(stop.id)
        if (!el) continue
        const rect = el.getBoundingClientRect()
        const top = rect.top + window.scrollY
        // t=0 → section top enters viewport bottom; t=1 → section bottom leaves top.
        const enter = top - vh
        const span = rect.height + vh
        const scrollPos = Math.min(maxScroll, Math.max(0, enter + stop.t * span))
        resolved.push({ ...stop, p: scrollPos / maxScroll })
      }
      resolved.sort((a, b) => a.p - b.p)
      stopsRef.current = resolved
    }

    measure()
    // Sections lazy-load content (GitHub repos, YouTube thumbs) → heights shift
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  return stopsRef
}

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { LenisContext, ScrollProgressContext } from './lenisContext.js'

export function LenisProvider({ children }) {
  const lenisRef = useRef(null)
  const scrollProgressRef = useRef(0)

  // Detect mobile once on mount (don't re-run on resize — Lenis teardown is expensive)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  useEffect(() => {
    // Desktop gets cinematic smoothing (heavy lag suits the monolith choreography);
    // mobile stays on native scroll — no rubber-band conflicts, no wasted frames.
    const lenis = new Lenis({
      lerp: isMobile ? 1 : 0.09,
      smoothWheel: !isMobile,
      smoothTouch: false,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
    })

    lenisRef.current = lenis

    // Write scroll progress (0–1) to ref — no React re-renders, just mutable ref
    lenis.on('scroll', ({ progress }) => {
      scrollProgressRef.current = progress
    })

    let rafId
    function raf(time) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    // Keep the scroll limit in step with content that grows mid-scroll (lazy
    // images, layouts that build as you scroll). Lenis' own observer is
    // debounced 250 ms, so it never settles while anything resizes every
    // frame, and the page hits an invisible floor. Refresh the measurements
    // only (lenis.resize() would also reset the scroll target), once a frame.
    let measureId = 0
    const growth = new ResizeObserver(() => {
      if (measureId) return
      measureId = requestAnimationFrame(() => {
        measureId = 0
        lenis.dimensions?.resize?.()
      })
    })
    growth.observe(document.documentElement)

    return () => {
      cancelAnimationFrame(rafId)
      cancelAnimationFrame(measureId)
      growth.disconnect()
      lenis.destroy()
      lenisRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <LenisContext.Provider value={lenisRef}>
      <ScrollProgressContext.Provider value={scrollProgressRef}>
        {children}
      </ScrollProgressContext.Provider>
    </LenisContext.Provider>
  )
}

import { createContext, useContext, useEffect, useRef } from 'react'
import Lenis from 'lenis'

// Default value is a ref-like object so BgFX works even without the provider
const ScrollProgressContext = createContext({ current: 0 })
const LenisContext = createContext({ current: null })

export function LenisProvider({ children }) {
  const lenisRef = useRef(null)
  const scrollProgressRef = useRef(0)

  // Detect mobile once on mount (don't re-run on resize — Lenis teardown is expensive)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  useEffect(() => {
    const lenis = new Lenis({
      lerp: isMobile ? 0 : 0.1,
      duration: isMobile ? 0 : 1.2,
      smoothWheel: !isMobile,
      smoothTouch: false,  // Never override native touch momentum
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

    return () => {
      cancelAnimationFrame(rafId)
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

/** Returns a mutable ref whose .current holds the Lenis instance (or null) */
export function useLenis() {
  return useContext(LenisContext)
}

/** Returns a mutable ref whose .current holds scroll progress 0–1.
 *  Read inside requestAnimationFrame or R3F useFrame — NOT in render. */
export function useScrollProgress() {
  return useContext(ScrollProgressContext)
}

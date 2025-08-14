import React from 'react'
import HALO from 'vanta/dist/vanta.halo.min'
import * as THREE from 'three'

export default function VantaHalo({ boost = false }) {
  const containerRef = React.useRef(null)
  const effectRef = React.useRef(null)

  // Respect reduced motion
  const reduceMotion = React.useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  }, [])

  // Init / cleanup
  React.useEffect(() => {
    if (reduceMotion || !containerRef.current || effectRef.current) return
    effectRef.current = HALO({
      el: containerRef.current,
      THREE,
      // Common controls
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.0,
      minWidth: 200.0,
      // Look & feel
      baseColor: 0xfb5aa7,       // inner halo (0xRRGGBB)
      backgroundColor: 0x0b0b0e, // page bg
      amplitudeFactor: 1.0,      // motion amount
      size: 1.0,                 // halo radius
    })
    return () => { effectRef.current?.destroy(); effectRef.current = null }
  }, [reduceMotion])

  // “Boost” during request → temporarily intensify motion
  React.useEffect(() => {
    const fx = effectRef.current
    if (!fx) return
    if (boost) {
      fx.setOptions({ amplitudeFactor: 1.6, size: 1.2 }) // surge
    } else {
      fx.setOptions({ amplitudeFactor: 1.0, size: 1.0 }) // back to baseline
    }
  }, [boost])

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      {!reduceMotion && <div ref={containerRef} className="w-full h-full" />}
      {/* readability overlay */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/45 to-black/70" />
    </div>
  )
}

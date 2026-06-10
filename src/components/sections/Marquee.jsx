import { useEffect, useRef } from 'react'

const ITEMS = ['AGENTS', 'MULTIMODAL', 'VISION', 'EDGE', 'CUDA', 'LLMS', 'DEEPSTREAM', 'RAG', 'JETSON', 'TENSORRT']

/**
 * Draggable physics marquee — auto-runs left, swipe to fling faster or
 * scrub backwards; velocity decays with friction after release.
 */
export default function Marquee() {
  const trackRef = useRef(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const BASE = 2.5  // px/frame base speed (~150 px/s at 60 fps)
    const MAX = 28    // cap on drag-added velocity
    const FRIC = 0.93 // velocity decay per frame (after release)

    let pos = 0, vel = 0, raf, halfW = 0
    const measure = () => { halfW = track.scrollWidth / 2 }
    measure()

    track.style.animation = 'none' // JS owns the motion now

    let active = false
    raf = requestAnimationFrame(function tick() {
      pos -= Math.max(0, BASE + vel)
      if (pos <= -halfW) pos += halfW
      track.style.transform = `translateX(${pos}px)`
      if (!active) {
        vel *= FRIC
        if (Math.abs(vel) < 0.03) vel = 0
      }
      raf = requestAnimationFrame(tick)
    })

    let px = 0, pt = 0
    const onDown = (e) => { active = true; px = e.clientX; pt = performance.now() }
    const onMove = (e) => {
      if (!active) return
      const now = performance.now(), dt = now - pt
      if (dt < 1) return
      vel = Math.max(-MAX, Math.min(MAX, -(e.clientX - px) / dt * 16))
      px = e.clientX; pt = now
    }
    const onUp = () => { active = false }

    const el = track.parentElement
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove, { passive: true })
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointerleave', onUp)

    const ro = new ResizeObserver(measure)
    ro.observe(track)

    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointerleave', onUp)
      ro.disconnect()
    }
  }, [])

  const line = ITEMS.map((t, i) => (
    <span key={i} className="ob-marquee-item">{t}<span className="sep" /></span>
  ))
  return (
    <div className="ob-marquee" aria-hidden="true">
      <div className="ob-marquee-track" ref={trackRef}>
        {line}{line}
      </div>
    </div>
  )
}

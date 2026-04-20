import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const ringRef = useRef(null)
  const dotRef  = useRef(null)

  useEffect(() => {
    // Don't render on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return

    const ring = ringRef.current
    const dot  = dotRef.current
    if (!ring || !dot) return

    // Add class to hide native cursor
    document.documentElement.classList.add('has-custom-cursor')

    let mx = window.innerWidth  / 2
    let my = window.innerHeight / 2
    let rx = mx, ry = my  // ring (slow)
    let dx = mx, dy = my  // dot  (fast)
    let isHover = false
    let rafId

    const onMove = (e) => { mx = e.clientX; my = e.clientY }

    const onOver = (e) => {
      isHover = !!e.target.closest('a, button, [role="button"], [data-cursor-hover], input, textarea, select, label')
    }

    document.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseover', onOver, { passive: true })

    function tick() {
      // Lerp: ring slow (elastic), dot fast (snappy)
      rx += (mx - rx) * 0.13
      ry += (my - ry) * 0.13
      dx += (mx - dx) * 0.42
      dy += (my - dy) * 0.42

      ring.style.transform = `translate3d(${rx - 16}px, ${ry - 16}px, 0) scale(${isHover ? 1.55 : 1})`
      ring.style.borderColor = isHover ? 'var(--nm-accent)' : 'rgba(255,255,255,0.5)'
      dot.style.transform  = `translate3d(${dx - 2.5}px, ${dy - 2.5}px, 0)`

      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.documentElement.classList.remove('has-custom-cursor')
    }
  }, [])

  return (
    <>
      {/* Outer ring */}
      <div
        ref={ringRef}
        aria-hidden
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: 32, height: 32,
          borderRadius: '50%',
          border: '1.5px solid rgba(255,255,255,0.5)',
          pointerEvents: 'none',
          zIndex: 99999,
          willChange: 'transform',
          transition: 'border-color 0.15s ease, transform 0.12s ease',
          mixBlendMode: 'difference',
        }}
      />
      {/* Inner dot */}
      <div
        ref={dotRef}
        aria-hidden
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: 5, height: 5,
          borderRadius: '50%',
          background: 'var(--nm-accent)',
          pointerEvents: 'none',
          zIndex: 99999,
          willChange: 'transform',
        }}
      />
    </>
  )
}

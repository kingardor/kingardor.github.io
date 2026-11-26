import { lazy, Suspense, useEffect, useRef, useState } from 'react'

const Bench = lazy(() => import('./Bench.jsx'))

/**
 * The Bench, loaded only when it nears the viewport (its geometry is ~85 KB
 * gzipped). Holds the figure's aspect ratio while waiting, so nothing jumps.
 */
export default function LazyBench({ className = '', style }) {
  const ref = useRef(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) { setShow(true); return }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setShow(true); io.disconnect() }
    }, { rootMargin: '800px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const hold = <div style={{ aspectRatio: '1.7', width: '100%' }} />
  return (
    <div ref={ref} className={className} style={style}>
      {show ? <Suspense fallback={hold}><Bench /></Suspense> : hold}
    </div>
  )
}

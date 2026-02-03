import React from 'react'
export default function useIsMobile(bp = 768) {
  const [m, setM] = React.useState(false)
  React.useEffect(() => {
    const q = window.matchMedia(`(max-width:${bp - 1}px)`)
    const up = () => setM(q.matches)
    up(); q.addEventListener('change', up)
    return () => q.removeEventListener('change', up)
  }, [bp])
  return m
}

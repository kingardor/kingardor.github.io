import React from 'react'
export default function useScrollSpy(hashes, offset = 160) {
  const [active, setActive] = React.useState(hashes[0]?.slice(1) || '')
  React.useEffect(() => {
    const ids = hashes.map((h) => h.slice(1))
    const handler = () => {
      const y = window.scrollY + offset
      let cur = ids[0]
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && y >= el.offsetTop) cur = id
      }
      setActive(cur)
    }
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    window.addEventListener('resize', handler)
    return () => { window.removeEventListener('scroll', handler); window.removeEventListener('resize', handler) }
  }, [hashes, offset])
  return active
}

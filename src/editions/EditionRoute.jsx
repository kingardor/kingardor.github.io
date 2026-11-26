import React, { Suspense, useEffect } from 'react'
import { useLenis } from '../shared/components/SmoothScroll'
import { EDITIONS, rememberEdition, peekPlace, clearPlace } from './editions.js'
import EditionSwitch from './EditionSwitch.jsx'

const PAGES = {
  mint: React.lazy(() => import('../proposals/mint/index.jsx')),
  versus: React.lazy(() => import('../proposals/versus/index.jsx')),
}

/** One edition, plus the switcher. Lands on the act the visitor came from. */
export default function EditionRoute({ edition }) {
  const lenis = useLenis()
  useEffect(() => {
    rememberEdition(edition)
    const act = peekPlace()
    const id = EDITIONS[edition].acts[act]?.id
    const to = (y) => {
      const l = lenis?.current
      if (l) l.scrollTo(y, { immediate: true, force: true })
      else window.scrollTo(0, y)
    }
    if (!act || !id) { clearPlace(); to(0); return }
    // The page mounts lazily and lays out over a few frames: wait for the
    // section, then land a little above it so its header is in view.
    let tries = 0
    let timer = 0
    const go = () => {
      const el = document.getElementById(id)
      if (el && document.documentElement.scrollHeight > window.innerHeight * 2) {
        to(Math.max(0, el.getBoundingClientRect().top + window.scrollY))
        clearPlace()
      } else if (tries++ < 50) timer = setTimeout(go, 100)
      else clearPlace()
    }
    timer = setTimeout(go, 250)
    return () => clearTimeout(timer)
  }, [edition, lenis])

  const Page = PAGES[edition]
  return (
    <>
      <Suspense fallback={<div style={{ minHeight: '100svh', background: '#050505' }} />}>
        <Page />
      </Suspense>
      <EditionSwitch current={edition} />
    </>
  )
}

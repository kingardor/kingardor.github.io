import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import SequenceCanvas from '../../components/story/SequenceCanvas.jsx'
import { subscribe } from '../../shared/scroll/scrollStore.js'
import { useLenis } from '../../shared/components/SmoothScroll'
import useLoaderRelease from '../shared/useLoaderRelease.js'
import { ACTS, PROJECT_BY_SLUG } from './lib/data.js'
import { initSession, startTracking, openCase, closeCase } from './lib/session.js'
import { bindLenis, lockScroll, scrollToId } from './lib/nav.js'
import { reducedMotion } from './lib/fx.js'
import Hud from './components/Hud.jsx'
import FeedBoxes from './components/FeedBoxes.jsx'
import VisitorBox from './components/VisitorBox.jsx'
import Hero from './components/Hero.jsx'
import Memory from './components/Memory.jsx'
import Identity from './components/Identity.jsx'
import Classes from './components/Classes.jsx'
import Sightings from './components/Sightings.jsx'
import CaseFile from './components/CaseFile.jsx'
import Signals from './components/Signals.jsx'
import Exhibit from './components/Exhibit.jsx'
import Moments from './components/Moments.jsx'
import Verified from './components/Verified.jsx'
import DeepScan from './components/DeepScan.jsx'
import './subject.css'

/**
 * SUBJECT 001 — the homepage as the output of a vision model watching
 * Akash, and you. The film is the camera feed; every piece of UI is
 * inference output; the visit ends written up.
 */
export default function Proposal() {
  useState(() => initSession())
  useLoaderRelease('800 1rem "SJ Archivo"')
  const lenisRef = useLenis()
  const scrimRef = useRef(null)
  const searchRef = useRef(null)
  const [caseSlug, setCaseSlug] = useState(null)
  const opener = useRef(null)

  useEffect(() => { bindLenis(lenisRef) }, [lenisRef])
  useEffect(() => startTracking(), [])

  // One subscriber: velocity widens the display type; the flank scrim
  // comes up once the hero has had its moment.
  useEffect(() => {
    const root = document.documentElement
    const still = reducedMotion()
    let lastY = window.scrollY, wdth = 62, lastW = -1, lastS = -1
    const off = subscribe((y, now, dt) => {
      const vh = window.innerHeight
      const s = Math.max(0, Math.min(1, (y - vh * 0.35) / (vh * 0.5)))
      if (Math.abs(s - lastS) > 0.004 && scrimRef.current) { lastS = s; scrimRef.current.style.opacity = s.toFixed(3) }
      if (still) return false
      const dy = Math.abs(y - lastY)
      const v = dy > 2 ? dy / Math.max(dt, 1 / 120) : 0
      lastY = y
      const target = 62 + Math.min(63, v / 45)
      wdth += (target - wdth) * Math.min(1, dt * (target > wdth ? 14 : 5))
      if (Math.abs(wdth - lastW) > 0.4) { lastW = wdth; root.style.setProperty('--sj-wdth', wdth.toFixed(1)) }
      if (Math.abs(wdth - 62) > 0.5) return true
      if (lastW !== 62) { wdth = 62; lastW = 62; root.style.setProperty('--sj-wdth', '62') }
      return false
    })
    return () => { off(); root.style.removeProperty('--sj-wdth') }
  }, [])

  const open = useCallback((slug, el) => {
    opener.current = el || document.activeElement
    openCase(slug, PROJECT_BY_SLUG[slug].name)
    setCaseSlug(slug)
    lockScroll(true)
  }, [])
  const close = useCallback(() => {
    closeCase()
    setCaseSlug(null)
    lockScroll(false)
    requestAnimationFrame(() => opener.current?.focus?.({ preventScroll: true }))
  }, [])

  const toSearch = () => {
    scrollToId('sj-moments')
    setTimeout(() => searchRef.current?.focus({ preventScroll: true }), reducedMotion() ? 50 : 1300)
  }

  const forget = () => {
    try { localStorage.removeItem('sj:visitor'); localStorage.removeItem('sj:visit') } catch {}
    location.reload()
  }

  return (
    <main className="lab-root sj-root">
      <SequenceCanvas acts={ACTS} layerClass="lab-film" scrim={false} compactActs={8} pane={null} />
      <div ref={scrimRef} className="sj-scrim" aria-hidden="true" />
      <FeedBoxes />
      <Hud onSearch={toSearch} />
      <Hero />
      <Memory />
      <Identity />
      <Classes />
      <Sightings onOpen={open} />
      <Exhibit />
      <Signals />
      <Moments ref={searchRef} onOpen={open} />
      <Verified />
      <DeepScan />
      <footer className="sj-foot">
        <span>SUBJECT 001 · akashjames.com</span>
        <span>Everything this page noticed stayed in your browser. localStorage, nothing else.</span>
        <button type="button" className="sj-link" onClick={forget}>forget me</button>
      </footer>
      <VisitorBox />
      <AnimatePresence>
        {caseSlug && <CaseFile key={caseSlug} slug={caseSlug} onClose={close} />}
      </AnimatePresence>
    </main>
  )
}

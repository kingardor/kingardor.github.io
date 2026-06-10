import { useEffect, useRef, useState } from 'react'
import { TOUR_STOPS } from './tourScript.js'
import { useLenis } from '../../shared/components/SmoothScroll.jsx'
import { isMobile, prefersReduced } from '../../shared/utils/capabilities.js'

const SCROLL_MS = 2400
const CHAR_MS = 26
const easeCine = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/**
 * Veronica-guided autopilot: scrolls the dossier stop by stop, streaming a
 * caption chip. Wheel/touch pauses, Esc exits. Entry points: TOUR button,
 * palette command (ob:tour event), ?tour=1. Disabled on mobile/reduced-motion.
 */
export default function GuidedTour() {
  const [state, setState] = useState('idle') // idle | playing | paused
  const [caption, setCaption] = useState('')
  const lenisRef = useLenis()
  const ctrl = useRef({ run: 0, paused: false, idx: 0 })
  const stateRef = useRef('idle')
  stateRef.current = state

  const disabled = isMobile || prefersReduced

  const sleep = (ms) => new Promise(r => setTimeout(r, ms))
  const aborted = (id) => ctrl.current.run !== id

  const setPhase = (s) => {
    setState(s)
    document.body.classList.toggle('ob-touring', s !== 'idle')
  }

  const exit = () => {
    ctrl.current.run++
    ctrl.current.paused = false
    setCaption('')
    setPhase('idle')
  }

  const scrollToStop = (stop) => {
    const el = document.getElementById(stop.id)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY
    const target = top + (stop.frac || 0) * Math.max(0, el.offsetHeight - window.innerHeight)
    const lenis = lenisRef?.current
    if (lenis) lenis.scrollTo(target, { duration: SCROLL_MS / 1000, easing: easeCine, lock: false })
    else window.scrollTo({ top: target, behavior: 'smooth' })
  }

  const waitWhilePaused = async (id) => {
    while (ctrl.current.paused && !aborted(id)) await sleep(120)
  }

  const playFrom = async (fromIdx) => {
    const id = ++ctrl.current.run
    ctrl.current.paused = false
    setPhase('playing')
    for (let i = fromIdx; i < TOUR_STOPS.length; i++) {
      if (aborted(id)) return
      ctrl.current.idx = i
      const stop = TOUR_STOPS[i]
      scrollToStop(stop)
      await sleep(SCROLL_MS + 150)
      if (aborted(id)) return
      await waitWhilePaused(id)
      setCaption('')
      for (let c = 1; c <= stop.caption.length; c++) {
        await sleep(CHAR_MS)
        if (aborted(id)) return
        await waitWhilePaused(id)
        setCaption(stop.caption.slice(0, c))
      }
      await sleep(stop.dwellMs ?? 2500)
      if (aborted(id)) return
      await waitWhilePaused(id)
    }
    exit()
  }

  // Entry points: ob:tour event (palette + TOUR button), ?tour=1 after load
  useEffect(() => {
    if (disabled) return
    const onTour = () => { if (stateRef.current === 'idle') playFrom(0) }
    window.addEventListener('ob:tour', onTour)
    if (/[?&]tour=1/.test(location.hash)) {
      const id = setTimeout(() => onTour(), 2600) // let the loader/intro land first
      return () => { clearTimeout(id); window.removeEventListener('ob:tour', onTour) }
    }
    return () => window.removeEventListener('ob:tour', onTour)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Interrupts: user scroll pauses, Esc exits
  useEffect(() => {
    if (state !== 'playing' && state !== 'paused') return
    const pause = () => {
      if (stateRef.current === 'playing') {
        ctrl.current.paused = true
        setPhase('paused')
      }
    }
    const onKey = (e) => { if (e.key === 'Escape') exit() }
    window.addEventListener('wheel', pause, { passive: true })
    window.addEventListener('touchstart', pause, { passive: true })
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('wheel', pause)
      window.removeEventListener('touchstart', pause)
      window.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  if (disabled || state === 'idle') return null

  const resume = () => {
    ctrl.current.paused = false
    setPhase('playing')
    scrollToStop(TOUR_STOPS[ctrl.current.idx]) // re-align after manual scroll
  }
  const skip = () => {
    const next = ctrl.current.idx + 1
    if (next >= TOUR_STOPS.length) return exit()
    playFrom(next)
  }

  return (
    <div className="ob-tour mono-ob" role="status">
      <span className="ob-tour-sigil">V</span>
      <span className="ob-tour-caption">
        {state === 'paused' ? 'PAUSED' : <>{caption}<span className="ob-pill-cursor" /></>}
      </span>
      <span className="ob-tour-controls">
        {state === 'paused' && <button onClick={resume}>RESUME</button>}
        <button onClick={skip}>SKIP</button>
        <button onClick={exit}>EXIT</button>
      </span>
    </div>
  )
}

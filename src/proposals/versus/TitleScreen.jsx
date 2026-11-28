import { useEffect, useRef } from 'react'
import PixelAssembly from '../shared/PixelAssembly.jsx'
import { useLenis } from '../../shared/components/lenisContext.js'
import { subscribe } from '../../shared/scroll/scrollStore.js'
import { slam, shake, flash, reduced, HI } from './fx.js'
import { Burst, Splat } from './Art.jsx'

const IGNORE = new Set(['Tab', 'Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Escape', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'F5', 'F12'])

export default function TitleScreen({ live, onLive }) {
  const lenis = useLenis()
  const uiRef = useRef(null)
  const nameRef = useRef(null)
  const leftRef = useRef(null)
  const rightRef = useRef(null)
  const startRef = useRef(null)
  const startedRef = useRef(false)
  const firedRef = useRef(false)

  const assembled = () => {
    if (firedRef.current) return
    firedRef.current = true
    onLive()
  }

  // The landing: slam, one-frame flash, decaying shake.
  useEffect(() => {
    if (!live || reduced()) return
    const a = slam(nameRef.current, { from: 1.8, dur: 460, rot: -3 })
    const t = setTimeout(() => { flash(0.95); shake(uiRef.current, 6, 300) }, 190)
    return () => { clearTimeout(t); a?.cancel() }
  }, [live])

  // Scrolling away splits the name and lifts the plates off the face.
  // Writes only when the split changes: past the title it stays at 1.
  useEffect(() => {
    let last = -1
    return subscribe((y) => {
      const vh = window.innerHeight
      const p = Math.min(1, Math.max(0, y / (vh * 0.9)))
      if (p === last) return false
      last = p
      const e = p * p
      if (leftRef.current) leftRef.current.style.transform = `translate3d(${(-e * 60).toFixed(2)}vw, 0, 0)`
      if (rightRef.current) rightRef.current.style.transform = `translate3d(${(e * 60).toFixed(2)}vw, 0, 0)`
      if (uiRef.current) uiRef.current.style.opacity = String(1 - Math.max(0, (p - 0.55) / 0.45))
      return false
    })
  }, [])

  // SCROLL TO START (also any key, or a click on the title): glide to Story.
  useEffect(() => {
    if (!live) return
    const go = () => {
      if (startedRef.current) return
      startedRef.current = true
      startRef.current?.classList.add('is-pressed')
      flash(0.6, HI)
      const target = document.getElementById('vs-story')
      if (!target) return
      const l = lenis?.current
      const instant = reduced()
      setTimeout(() => {
        if (l) l.scrollTo(target, { duration: instant ? 0 : 1.7, immediate: instant, easing: t => 1 - Math.pow(1 - t, 3) })
        else target.scrollIntoView({ behavior: instant ? 'auto' : 'smooth' })
      }, instant ? 0 : 220)
    }
    const atTop = () => window.scrollY < window.innerHeight * 0.3
    const onKey = (e) => {
      if (startedRef.current || !atTop() || e.metaKey || e.ctrlKey || e.altKey || IGNORE.has(e.key)) return
      const tag = e.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (tag === 'A' && e.key === 'Enter')) return
      if (e.key === ' ' || e.key === 'PageDown' || e.key === 'ArrowDown') e.preventDefault()
      go()
    }
    const onWheel = (e) => { if (e.deltaY > 0 && window.scrollY < 40) go() }
    const pin = uiRef.current?.parentElement
    const onClick = (e) => { if (!e.target.closest('a') && atTop()) go() }
    window.addEventListener('keydown', onKey)
    window.addEventListener('wheel', onWheel, { passive: true })
    pin?.addEventListener('click', onClick)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('wheel', onWheel)
      pin?.removeEventListener('click', onClick)
    }
  }, [live, lenis])

  return (
    <section id="vs-title" className="vs-title" aria-label="Title screen">
      <div className="vs-title-pin">
        <PixelAssembly onAssembled={assembled} />
        <div className={`vs-title-loading${live ? ' is-done' : ''}`} aria-hidden="true">
          <span>PLAYER 1 LOADING</span>
          <span className="vs-title-loadbar"><i /></span>
        </div>
        <div className={`vs-title-ui${live ? ' is-live' : ''}`} ref={uiRef}>
          <Splat className="vs-title-splat" seed={21} ink="spot" />
          <Burst className="vs-title-burst" seed={4} spikes={16} inks={['hi', 'p1']} />
          <h1 className="vs-title-name" ref={nameRef}>
            <span className="vs-title-line vs-mis" data-text="AKASH" ref={leftRef}>AKASH</span>
            <span className="vs-title-line vs-title-line-b vs-mis" data-text="JAMES" ref={rightRef}>JAMES</span>
          </h1>
          <p className="vs-title-sub">
            <span>CLASS: AI ARCHITECT</span><i aria-hidden="true">·</i>
            <span>STYLE: VISION + AGENTS</span><i aria-hidden="true">·</i>
            <span>DIFFICULTY: <b>UNFAIR</b></span>
          </p>
          <button type="button" className="vs-title-start" ref={startRef}>
            <span className="vs-title-start-txt">SCROLL TO START</span>
          </button>
          <span className="vs-title-corner vs-title-corner-l" aria-hidden="true">1P 2026</span>
          <span className="vs-title-corner vs-title-corner-r" aria-hidden="true">DIRECTOR AI - BLUE</span>
        </div>
      </div>
    </section>
  )
}

import { useEffect, useRef, useState } from 'react'
import { subscribe, kick } from '../../shared/scroll/scrollStore.js'
import { useFilmAct } from '../shared/useFilm.js'
import { MODES, SUPERS, ACTS, CHAPTER_INKS } from './data.js'
import { onAnnounce, reduced, shake, flash, isVsOpen, HI } from './fx.js'
import { Burst, SpeedLines } from './Art.jsx'

/** Health bar + round timer + super meter, across the top. */
export function Hud({ live }) {
  const fillRef = useRef(null)
  const lvRef = useRef(null)
  const metaRef = useRef(null)
  const filmAct = useFilmAct()
  // Reduced motion shows a still poster, so the film never reports an act:
  // follow the sections instead.
  const [rmAct, setRmAct] = useState(0)
  const act = reduced() ? rmAct : filmAct

  useEffect(() => {
    let last = ''
    let lastFill = ''
    const still = reduced()
    // The page height, measured when it changes rather than read every frame.
    let max = 1
    const measure = () => { max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight); kick() }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(document.documentElement)
    window.addEventListener('resize', measure)
    const off = subscribe((y) => {
      if (still) {
        let k = 0
        ACTS.forEach((a, i) => { const el = document.getElementById(a.id); if (el && el.getBoundingClientRect().top < window.innerHeight * 0.5) k = i })
        setRmAct(k)
      }
      const p = Math.min(1, Math.max(0, y / max))
      // full at the continue screen, not only at the very last pixel
      const fill = Math.min(1, p / 0.94)
      const tf = `scaleX(${fill.toFixed(4)})`
      if (tf !== lastFill && fillRef.current) { lastFill = tf; fillRef.current.style.transform = tf }
      const lv = fill >= 0.999 ? 'MAX' : `LV ${Math.floor(fill * 8)}`
      if (lv !== last && lvRef.current) {
        last = lv
        lvRef.current.textContent = lv
        metaRef.current?.classList.toggle('is-max', lv === 'MAX')
      }
      return false
    })
    return () => { off(); ro.disconnect(); window.removeEventListener('resize', measure) }
  }, [])

  return (
    <header className={`vs-hud${live ? ' is-live' : ''}`} aria-label="Player status">
      <div className="vs-hud-p1">
        <span className="vs-hud-tag">1P</span>
        <span className="vs-hud-name">AKASH JAMES</span>
        <div className="vs-hud-health" role="img" aria-label="Health: full. Difficulty: unfair">
          <span className="vs-hud-health-fill" />
          <span className="vs-hud-health-ticks" />
        </div>
      </div>
      <div className="vs-hud-timer" aria-live="off">
        <span className="vs-hud-inf" aria-label="Time: infinite">∞</span>
        <span className="vs-hud-mode">{String(act + 1).padStart(2, '0')} · {MODES[act]}</span>
      </div>
      <div className="vs-hud-super" ref={metaRef}>
        <div className="vs-hud-super-top">
          <span className="vs-hud-super-name">{SUPERS[act]}</span>
          <span className="vs-hud-super-lv" ref={lvRef}>LV 0</span>
        </div>
        <div className="vs-hud-meter" aria-hidden="true">
          <span className="vs-hud-meter-fill" ref={fillRef} />
          <span className="vs-hud-meter-segs" />
        </div>
      </div>
    </header>
  )
}

const RATINGS = [[90, 'ARCHITECTURAL'], [50, 'UNHINGED'], [25, 'BRUTAL'], [10, 'NICE']]
const STEP = 150 // px of fast scrolling per hit
const MIN_SPEED = 380 // px/s before scrolling counts as an attack

/** Combo meter: scroll velocity → hits, decays when idle. */
export function Combo() {
  const boxRef = useRef(null)
  const numRef = useRef(null)
  const rateRef = useRef(null)
  useEffect(() => {
    if (reduced()) return
    let hits = 0, acc = 0, lastY = null, lastMove = 0, rating = ''
    const box = boxRef.current, num = numRef.current, rate = rateRef.current
    const drop = () => {
      hits = 0; acc = 0; rating = ''
      rate.textContent = ''
      box.classList.remove('is-on')
      box.classList.add('is-drop')
      setTimeout(() => box.classList.remove('is-drop'), 500)
    }
    return subscribe((y, now, dt) => {
      if (lastY === null) { lastY = y; return false }
      const dy = Math.abs(y - lastY)
      lastY = y
      if (dy > 0.5 && dy < window.innerHeight * 3) {
        const speed = dy / Math.max(dt, 1 / 120)
        if (speed > MIN_SPEED) {
          acc += dy
          lastMove = now
          let n = 0
          while (acc >= STEP && n < 3) { acc -= STEP; hits++; n++ }
          if (acc >= STEP) acc = 0
          if (n) {
            num.textContent = hits
            if (hits >= 2) box.classList.add('is-on')
            num.animate([{ transform: 'scale(1.45)' }, { transform: 'scale(1)' }], { duration: 160, easing: 'cubic-bezier(.2,.9,.3,1.4)' })
            const r = RATINGS.find(([t]) => hits >= t)?.[1] ?? ''
            if (r !== rating) {
              rating = r
              rate.textContent = r
              if (r) {
                rate.animate([{ transform: 'scale(2) rotate(-14deg)', opacity: 0 }, { transform: 'scale(1) rotate(-8deg)', opacity: 1 }], { duration: 260, easing: 'cubic-bezier(.2,.9,.2,1)' })
                shake(box, 5, 260)
              }
            }
          }
        }
      }
      if (hits > 0 && now - lastMove > 1200) drop()
      return hits > 0
    })
  }, [])

  return (
    <div className="vs-combo" ref={boxRef} aria-hidden="true">
      <span className="vs-combo-num" ref={numRef}>0</span>
      <span className="vs-combo-hits">HITS</span>
      <span className="vs-combo-rate" ref={rateRef} />
    </div>
  )
}

/** "CREDITS 00": every click anywhere inserts a coin. */
export function Credits() {
  const ref = useRef(null)
  useEffect(() => {
    let n = 0
    const on = () => {
      n = Math.min(99, n + 1)
      if (!ref.current) return
      ref.current.textContent = String(n).padStart(2, '0')
      if (!reduced()) ref.current.animate([{ transform: 'translateY(-6px)', color: HI }, { transform: 'none' }], { duration: 220 })
    }
    document.addEventListener('pointerdown', on)
    return () => document.removeEventListener('pointerdown', on)
  }, [])
  return (
    <div className="vs-credits" aria-hidden="true">CREDITS <span ref={ref}>00</span></div>
  )
}

/** Round calls and finishers, centre screen. */
export function Announcer() {
  const [call, setCall] = useState(null)
  const act = useFilmAct()
  const boxRef = useRef(null)
  useEffect(() => {
    let t = 0
    const off = onAnnounce((c) => {
      if (reduced() || isVsOpen() || c.kind === 'toast') return
      clearTimeout(t)
      setCall({ ...c, key: Date.now() })
      t = setTimeout(() => setCall(null), c.kind === 'finisher' ? 1700 : 1350)
    })
    return () => { off(); clearTimeout(t) }
  }, [])
  useEffect(() => {
    if (!call) return
    flash(call.kind === 'finisher' ? 0.9 : 0.5, call.kind === 'finisher' ? HI : '#fff')
    shake(boxRef.current, call.kind === 'finisher' ? 10 : 6, 320, 190)
  }, [call])
  if (!call) return null
  return (
    <div className={`vs-call vs-call-${call.kind}`} key={call.key} ref={boxRef} aria-hidden="true" style={{ '--vs-spot': CHAPTER_INKS[act] ?? CHAPTER_INKS[0] }}>
      {call.kind === 'finisher' && <SpeedLines className="vs-call-speed" />}
      {call.kind !== 'round' && <Burst className="vs-call-burst" seed={call.key % 97} spikes={18} />}
      <div className="vs-call-plate">
        <span className="vs-call-big vs-mis" data-text={call.big}>{call.big}</span>
        {call.small && <span className="vs-call-small">{call.small}</span>}
      </div>
    </div>
  )
}

/** One-frame flash layer (used by fx.flash). */
export function FlashLayer() {
  return <div className="vs-flash" aria-hidden="true" />
}

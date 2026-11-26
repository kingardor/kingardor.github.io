import { useEffect, useRef, useState } from 'react'
import { useFilm } from '../../shared/useFilm.js'
import { SECTIONS, TOTAL_FRAMES, FRAMES_PER_ACT, FPS } from '../lib/data.js'
import { scramble } from '../lib/fx.js'
import { getSession, onSession } from '../lib/session.js'
import { scrollToId } from '../lib/nav.js'

/**
 * The camera's own metadata, pinned to the top of the feed: camera, scene,
 * a running timecode, how many frames of him have been read, and who is
 * watching. The ticks jump between sections.
 */
export default function Hud({ onSearch }) {
  const whereRef = useRef(null)
  const tcRef = useRef(null)
  const readRef = useRef(null)
  const frameRef = useRef(null)
  const seen = useRef(new Set())
  const lastWhere = useRef('')
  const [active, setActive] = useState('sj-acquire')
  const id = getSession().id

  useFilm((s) => {
    const k = Math.max(0, SECTIONS.findIndex(x => x.id === s.id))
    const where = (SECTIONS[k] || SECTIONS[0]).where
    if (where !== lastWhere.current) { lastWhere.current = where; scramble(whereRef.current, where, { ms: 300 }) }
    const actNo = (SECTIONS[k] || SECTIONS[0]).act
    const key = `${actNo}:${s.frame}`
    if (!seen.current.has(key)) {
      seen.current.add(key)
      getSession().frames = seen.current.size
      if (readRef.current) readRef.current.textContent = String(seen.current.size).padStart(3, '0')
    }
    if (frameRef.current) {
      const g = (actNo - 1) * FRAMES_PER_ACT + (s.frame || 0)
      const secs = g / FPS
      frameRef.current.textContent = `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(Math.floor(secs % 60)).padStart(2, '0')}:${String(g % FPS).padStart(2, '0')}`
    }
  })

  useEffect(() => onSession((S) => setActive(a => (a === S.active || !S.active ? a : S.active))), [])

  // Running wall timecode at the film's frame rate; sleeps when hidden.
  useEffect(() => {
    const t0 = performance.now()
    let iv = 0
    const draw = () => {
      const f = Math.floor(((performance.now() - t0) / 1000) * FPS)
      const s = Math.floor(f / FPS)
      const hh = String(Math.floor(s / 3600)).padStart(2, '0')
      const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
      const ss = String(s % 60).padStart(2, '0')
      if (tcRef.current) tcRef.current.textContent = `${hh}:${mm}:${ss}:${String(f % FPS).padStart(2, '0')}`
    }
    const start = () => { if (!iv) iv = setInterval(draw, 1000 / FPS) }
    const stop = () => { clearInterval(iv); iv = 0 }
    const vis = () => (document.hidden ? stop() : start())
    draw(); start()
    document.addEventListener('visibilitychange', vis)
    return () => { stop(); document.removeEventListener('visibilitychange', vis) }
  }, [])

  return (
    <header className="sj-hud">
      <div className="sj-hud-cam">
        <span className="sj-hud-live">CAM 01</span>
        <span className="sj-hud-sep">·</span>
        <span ref={whereRef} className="sj-hud-where">GOLDEN GATE</span>
        <span className="sj-hud-sep">·</span>
        <span>LIVE</span>
        <span ref={tcRef} className="sj-dot sj-hud-tc">00:00:00:00</span>
      </div>
      <div className="sj-hud-mid" aria-hidden="true">
        <span className="sj-hud-k">film</span> <span ref={frameRef} className="sj-dot">00:00:00</span>
        <span className="sj-hud-k">frames read</span> <span ref={readRef} className="sj-dot">000</span><span className="sj-hud-of">/{TOTAL_FRAMES}</span>
      </div>
      <nav className="sj-hud-nav" aria-label="Sections">
        {SECTIONS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            className={`sj-tick${active === s.id ? ' sj-tick-on' : ''}`}
            onClick={() => scrollToId(s.id)}
            aria-label={`${String(i + 1).padStart(2, '0')} ${s.name}`}
            aria-current={active === s.id ? 'true' : undefined}
          >
            <span className="sj-tick-tab">{String(i + 1).padStart(2, '0')} · {s.name.toLowerCase()}</span>
          </button>
        ))}
      </nav>
      <div className="sj-hud-right">
        <button type="button" className="sj-hud-search" onClick={onSearch}>search<span className="sj-hide-sm"> moments</span></button>
        <span className="sj-hud-subj">subject <b>{id}</b> · tracked</span>
      </div>
    </header>
  )
}

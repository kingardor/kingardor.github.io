import { useEffect, useRef, useState } from 'react'
import { PROJECTS } from '../../content/index.js'
import { subscribe, kick } from '../../shared/scroll/scrollStore.js'
import { BoxFront } from './ProjectBox.jsx'
import BoxModal from './BoxModal.jsx'
import Chase from './Chase.jsx'
import { Talker } from './parts.jsx'
import { markOpened, useCollection } from './collection.js'
import { isReduced } from './data.js'

// Hand-hung, not grid-snapped: per-box nudges (in % of the slot) and rest tilt.
const HANG = [
  { dx: 0, dy: 0, rest: -1.2, len: 1.0 },
  { dx: 6, dy: 9, rest: 0.8, len: 0.9 },
  { dx: -4, dy: -3, rest: 1.6, len: 1.1 },
  { dx: 3, dy: 12, rest: -0.6, len: 0.95 },
  { dx: -5, dy: 4, rest: 0.9, len: 1.05 },
  { dx: 4, dy: -6, rest: -1.4, len: 0.92 },
  { dx: -2, dy: 10, rest: 0.4, len: 1.08 },
  { dx: 5, dy: 1, rest: -0.9, len: 0.98 },
]

export default function Pegboard() {
  const { opened } = useCollection()
  const [open, setOpen] = useState(null) // { slug, index, rect, rest }
  const swings = useRef([])
  const sim = useRef(HANG.map(() => ({ th: 0, om: 0 })))
  const wallRef = useRef(null)
  const reduced = useRef(isReduced()).current

  // Damped pendulums, driven by scroll velocity and the cursor
  useEffect(() => {
    if (reduced) return
    let active = false, lastY = window.scrollY, vel = 0
    const io = new IntersectionObserver(([e]) => { active = e.isIntersecting; if (active) kick() }, { rootMargin: '10% 0px' })
    io.observe(wallRef.current)
    const off = subscribe((y, now, dt) => {
      const dy = y - lastY
      lastY = y
      if (!active) return false
      const v = dy / Math.max(dt, 1 / 120)
      vel += (v - vel) * 0.35
      let moving = Math.abs(dy) > 0.5
      sim.current.forEach((s, i) => {
        const h = HANG[i]
        const k = 26 / h.len, c = 1.6
        const drive = Math.max(-6, Math.min(6, -vel * 0.0011 * h.len))
        s.om += (drive - k * s.th - c * s.om) * dt
        s.th += s.om * dt
        s.th = Math.max(-0.5, Math.min(0.5, s.th))
        if (Math.abs(s.th) > 0.0006 || Math.abs(s.om) > 0.002) moving = true
        const el = swings.current[i]
        if (el) el.style.transform = `rotate(${(h.rest + (s.th * 180) / Math.PI).toFixed(3)}deg)`
      })
      return moving
    })
    return () => { off(); io.disconnect() }
  }, [reduced])

  const nudge = (i, e) => {
    if (reduced) return
    const s = sim.current[i]
    const mx = e.movementX || 0
    s.om += Math.max(-0.9, Math.min(0.9, mx * 0.012)) + (e.type === 'pointerenter' ? 0.35 * Math.sign(mx || 1) : 0)
    kick()
  }

  const pick = (p, i, e) => {
    const el = e.currentTarget.querySelector('.mb-pbox')
    markOpened(p.slug)
    setOpen({ slug: p.slug, index: i, rect: el.getBoundingClientRect(), rest: HANG[i].rest })
  }

  const homeRect = () => {
    const i = PROJECTS.findIndex(p => p.slug === open?.slug)
    return swings.current[i]?.querySelector('.mb-pbox')?.getBoundingClientRect()
  }

  return (
    <section id="mb-wall" className="mb-wall" aria-labelledby="mb-wall-title">
      <div className="mb-wall-intro">
        <Talker kicker="Act IV · the projects" title={<span id="mb-wall-title">Collect them all</span>} sub="Eight figures on one pegboard. Pick one up, flip it, tear it open. Your collection is remembered. Your dignity is not." tone="pink" />
      </div>
      <div className="mb-board" ref={wallRef}>
        <div className="mb-board-light" aria-hidden="true" />
        <ul className="mb-board-grid">
          {PROJECTS.map((p, i) => {
            const h = HANG[i]
            const out = open?.slug === p.slug
            return (
              <li key={p.slug} className={`mb-hang${out ? ' is-out' : ''}`} style={{ '--dx': `${h.dx}%`, '--dy': `${h.dy}px` }}>
                <div className="mb-swing" ref={el => { swings.current[i] = el }} style={{ transform: `rotate(${h.rest}deg)` }}>
                  <button
                    type="button" className="mb-pick"
                    aria-label={`${p.name}: ${p.pitch} Pick it up`}
                    onClick={e => pick(p, i, e)}
                    onPointerEnter={e => nudge(i, e)} onPointerMove={e => nudge(i, e)}
                  >
                    <BoxFront p={p} index={i} />
                    {opened.includes(p.slug) && <span className="mb-inspected" aria-hidden="true">INSPECTED</span>}
                  </button>
                  <span className="mb-peg" aria-hidden="true"><i /></span>
                </div>
                {out && <span className="mb-hang-gone" aria-hidden="true">IN YOUR HANDS</span>}
              </li>
            )
          })}
          <Chase />
        </ul>
      </div>
      {open && (
        <BoxModal
          key={open.slug}
          p={PROJECTS[open.index]}
          index={open.index}
          fromRect={open.rect}
          rest={open.rest}
          getHomeRect={homeRect}
          onClosed={() => {
            const i = open.index
            setOpen(null)
            requestAnimationFrame(() => {
              swings.current[i]?.querySelector('.mb-pick')?.focus({ preventScroll: true })
              sim.current[i].om += 1.4; kick()
            })
          }}
        />
      )}
    </section>
  )
}

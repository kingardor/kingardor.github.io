import { useEffect, useRef } from 'react'
import { useFilm } from '../../shared/useFilm.js'
import { getFilm } from '../../../components/story/filmPosition.js'
import { CLS, FILM_BOXES } from '../lib/data.js'
import { scramble, onLocked, isLocked, reducedMotion, fallbackRect } from '../lib/fx.js'

const SLOTS = 4
const GHOSTS = 6

const rectOf = (s) => (s?.rect?.w ? s.rect : fallbackRect())

const ease = x => x * x * (3 - 2 * x)
function at(k, t) {
  if (t <= k[0][0]) return k[0].slice(1)
  for (let i = 0; i < k.length - 1; i++) {
    const a = k[i], b = k[i + 1]
    if (t <= b[0]) {
      const f = ease((t - a[0]) / Math.max(1e-6, b[0] - a[0]))
      return [1, 2, 3, 4].map(j => a[j] + (b[j] - a[j]) * f)
    }
  }
  return k[k.length - 1].slice(1)
}

/**
 * The inference layer over the film: 1–3 detections per act, anchored to
 * features in the footage, eased between hand-placed keyframes. Labels
 * scramble in; boxes snap with a small overshoot; once in a while a box
 * holds for two frames, like a real tracker dropping a frame.
 */
export default function FeedBoxes() {
  const slots = useRef([])
  const ghosts = useRef([])
  const st = useRef({ act: null, vis: [], locked: isLocked(), hold: -1, holdN: 0, nextDrop: 0 })

  const place = (el, r, b) => {
    const x = r.x + b[0] * r.w, y = r.y + b[1] * r.h
    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
    el.style.width = `${(b[2] * r.w).toFixed(1)}px`
    el.style.height = `${(b[3] * r.h).toFixed(1)}px`
    const inside = y < 70
    el.classList.toggle('sj-tab-in', inside)
    if (inside) el.style.setProperty('--sj-tab-off', `${Math.max(0, 52 - y).toFixed(0)}px`)
  }

  const render = (s) => {
    const S = st.current
    const boxes = FILM_BOXES[s.id] || FILM_BOXES['sj-acquire']
    const r = rectOf(s)
    const actChanged = S.act !== (s.id || 'sj-acquire')
    if (actChanged) { S.act = s.id || 'sj-acquire'; S.vis = [] }
    const now = performance.now()
    if (!S.nextDrop) S.nextDrop = now + 6000
    if (!reducedMotion() && now > S.nextDrop) {
      S.nextDrop = now + 7000 + Math.random() * 8000
      if (S.hold < 0) { S.hold = (Math.random() * boxes.length) | 0; S.holdN = 2 }
    }
    for (let i = 0; i < SLOTS; i++) {
      const el = slots.current[i]
      if (!el) continue
      const b = boxes[i]
      const t = s.t || 0
      const on = !!b && S.locked && (!b.on || (t >= b.on[0] && t <= b.on[1]))
      let fresh = false
      if (on !== !!S.vis[i] || (on && actChanged)) {
        fresh = on
        S.vis[i] = on
        el.classList.toggle('sj-on', on)
        if (on) {
          el.style.setProperty('--c', CLS[b.cls])
          el.classList.remove('sj-snap'); void el.offsetWidth; el.classList.add('sj-snap')
          scramble(el.querySelector('.sj-box-label'), b.label, { ms: 260 })
        }
      }
      if (!on) continue
      // a dropped frame: hold position for two draws (never on a box's first draw)
      if (!fresh && S.hold === i && S.holdN > 0) { S.holdN--; if (!S.holdN) S.hold = -1; continue }
      place(el, r, at(b.k, t))
    }
  }

  useFilm(render)

  useEffect(() => {
    if (isLocked()) { st.current.locked = true; render(getFilm()); return }
    return onLocked(() => {
      const S = st.current
      const s = getFilm()
      const r = rectOf(s)
      const boxes = FILM_BOXES[s.id] || FILM_BOXES['sj-acquire']
      const face = at(boxes[0].k, s.t || 0)
      // NMS: jittery candidates around the face collapse into one box
      ghosts.current.forEach((g, i) => {
        if (!g) return
        const j = () => (Math.random() - 0.5)
        const cand = [face[0] + j() * 0.12, face[1] + j() * 0.1, face[2] * (0.75 + Math.random() * 0.5), face[3] * (0.75 + Math.random() * 0.45)]
        g.style.transition = 'none'
        place(g, r, cand)
        g.querySelector('.sj-box-label').textContent = `person ${(0.31 + Math.random() * 0.5).toFixed(2)}`
        g.classList.add('sj-on')
        g.style.opacity = '1'
        setTimeout(() => {
          g.classList.add('sj-jitter')
        }, 0)
        setTimeout(() => {
          g.classList.remove('sj-jitter')
          g.style.transition = 'transform 400ms cubic-bezier(.2,.9,.1,1), width 400ms cubic-bezier(.2,.9,.1,1), height 400ms cubic-bezier(.2,.9,.1,1), opacity 160ms linear 330ms'
          place(g, r, face)
          g.style.opacity = '0'
        }, 420 + i * 30)
        setTimeout(() => g.classList.remove('sj-on'), 1100 + i * 30)
      })
      setTimeout(() => { S.locked = true; render(getFilm()) }, 800)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="sj-feed" aria-hidden="true">
      {Array.from({ length: GHOSTS }, (_, i) => (
        <div key={`g${i}`} ref={el => { ghosts.current[i] = el }} className="sj-box sj-ghost" style={{ '--c': CLS.person }}>
          <span className="sj-box-tab"><span className="sj-box-label" /></span>
        </div>
      ))}
      {Array.from({ length: SLOTS }, (_, i) => (
        <div key={i} ref={el => { slots.current[i] = el }} className="sj-box sj-film-box">
          <span className="sj-box-tab"><span className="sj-box-label" /></span>
        </div>
      ))}
    </div>
  )
}

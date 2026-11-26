import { useEffect, useRef } from 'react'
import DATA from './bench/bench.data.js'
import { turretAt, cctvAt, tailSvg, TURRET, CAM } from './bench/parts.js'
import { P } from './bench/view.js'
import { axisVector } from './kit/iso-kit.mjs'
import { PROJECTS, BRAGS } from '../content/index.js'
import './kit/iso.css'
import './bench/materials.gen.css'
import './bench/bench.css'

// "The Bench": Akash's workbench as an isometric figure. Static geometry is
// precomputed by bench/build.mjs; this component only moves what moves.

const fact = (slug, i) => PROJECTS.find((p) => p.slug === slug)?.facts?.[i]?.v ?? ''
const brag = (word) => BRAGS.find((b) => b.label.includes(word))?.num ?? ''
const up = (s) => s.toUpperCase().replace(/\s+/g, ' ').trim()

const THINGS = {
  vector: { label: 'VECTOR', read: up(fact('vector', 0)) },
  noir: { label: 'NOIR', read: `${up(fact('noir', 0))} TESTS` },
  unoq: { label: 'UNO Q', read: up(fact('q-pocket', 0)) },
  jetson: { label: 'JETSON', read: `${up(brag('Jetson'))} STUDENTS` },
  tello: { label: 'TELLO', read: `${fact('hermes', 0).split('·')[0].trim()}★` },
  pad: { label: 'PAD', read: `${up(brag('FPS'))} FPS` },
  car: { label: '1:64', read: up(fact('copcars', 1)) },
  mug: { label: 'MUG', read: up(fact('noir', 2)) },
  cctv: { label: 'CCTV', read: `${up(brag('Caltrans'))} CAMS` },
}
const ORDER = DATA.objects
const REST_TEXT = `THE BENCH · ${ORDER.length} THINGS`
const LIFTS = { vector: 5, noir: 5, unoq: 4, jetson: 4, tello: 6, pad: 4, car: 4, mug: 5 }
const TAILS = { jetson: 'jetson', unoq: 'unoq' }
const UP = axisVector(P, [0, 0, 1])
const FIRST_TOUR = 1.4
const TOUR_STEP = 2.8
const QUIET = 3600
const LED = { cols: 13, rows: 8 }
// Narrow cards (phones) show a 1.6× crop of the bench top that follows the selection.
const NARROW = 640
const ZOOM = 1.6
const CROP = { w: DATA.W / ZOOM, h: (DATA.W / ZOOM) * 0.8 }

const LABEL =
  'An isometric workbench seen from the front right: an oak butcher-block top on a short orange steel frame, a steel rule along the front edge and a green cutting mat. On it sit an Anki Vector robot beside its charger, a Moorebot Scout rover called Noir looking at a mustard mug on a coaster, an Arduino UNO Q with its blue LED matrix, an NVIDIA Jetson Xavier NX developer kit with its fan, a white Tello drone, a white game controller, a hot pink 1:64 diecast car on a plinth, and a white CCTV camera on a post. A power strip at the back feeds the Jetson, the UNO Q, the charger and the camera.'

// Soft shadows that darken under a lifted thing, laid just above the mat.
const HALOS = (
  <g key="halos" className="bn-halos">
    {Object.entries(DATA.halos).map(([piece, d]) => (
      <path key={piece} className="bn-lift-halo" data-halo={piece} d={d} />
    ))}
  </g>
)
const ART = (
  <>
    <g key="back" dangerouslySetInnerHTML={{ __html: DATA.back }} />
    {DATA.items.map((item, i) => [
      <g key={i} className="bn-it" data-p={item.p} data-o={item.o} data-l={item.l} dangerouslySetInnerHTML={{ __html: item.s }} />,
      i === DATA.haloAfter ? HALOS : null,
    ])}
  </>
)

const stillness = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const smooth = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x))

export default function Bench({ fig = 'Fig 1', className = '' }) {
  const plate = useRef(null)
  const stage = useRef(null)

  useEffect(() => {
    const root = stage.current
    const card = plate.current
    if (!root || !card) return undefined
    const readout = card.querySelector('[data-readout]')
    const status = card.querySelector('[data-status]')
    const all = [...root.querySelectorAll('.bn-it')]
    const byObj = new Map()
    const byPiece = new Map()
    for (const el of all) {
      const o = el.dataset.o
      const p = el.dataset.p
      if (!byObj.has(o)) byObj.set(o, [])
      byObj.get(o).push(el)
      if (!byPiece.has(p)) byPiece.set(p, [])
      byPiece.get(p).push(el)
    }
    const live = (name) => root.querySelector(`[data-l="${name}"]`)
    const turret = live('turret')
    const cctv = live('cctv')
    const tails = Object.fromEntries(Object.keys(TAILS).map((p) => [p, live(`tail:${TAILS[p]}`)]))
    const eyes = root.querySelector('[data-eyes]')
    const fan = root.querySelector('[data-spin="fan"]')
    const props = [...root.querySelectorAll('[data-spin^="prop"]')]
    const leds = [...root.querySelectorAll('[data-led]')]
    const glows = [...root.querySelectorAll('[data-glow]')]
    const svg = root.querySelector('svg')
    const halos = Object.fromEntries([...root.querySelectorAll('[data-halo]')].map((el) => [el.dataset.halo, el]))

    const state = {
      active: null,
      user: false,
      lifts: Object.fromEntries(Object.keys(LIFTS).map((p) => [p, 0])),
      shownTail: { jetson: 0, unoq: 0 },
      clock: 0,
      tourClock: 0,
      touring: !stillness(),
      turret: TURRET.rest,
      cctv: CAM.rest,
      ledAt: -1,
      visible: false,
      narrow: false,
      view: null,
      frame: 0,
      last: 0,
    }
    let quiet = 0

    function select(obj) {
      if (state.active === obj) return
      if (state.active) for (const el of byObj.get(state.active) ?? []) delete el.dataset.on
      state.active = obj
      if (obj) for (const el of byObj.get(obj) ?? []) el.dataset.on = ''
      const text = obj ? `${THINGS[obj].label} · ${THINGS[obj].read}` : REST_TEXT
      if (readout && readout.textContent !== text) readout.textContent = text
      root.setAttribute('aria-valuetext', obj ? `${THINGS[obj].label}, ${THINGS[obj].read}` : 'Nothing selected')
      kick()
    }
    function announce() {
      if (status) status.textContent = state.active ? `${THINGS[state.active].label}, ${THINGS[state.active].read}` : ''
    }
    function takeOver() {
      state.touring = false
      state.user = true
      clearTimeout(quiet)
      quiet = setTimeout(() => {
        state.user = false
        if (stillness()) return
        state.touring = true
        state.tourClock = 0
        kick()
      }, QUIET)
    }

    function drawLeds(t) {
      // radar sweep from the matrix centre, with a burst every 7 s
      const step = Math.floor(t * 30)
      if (step === state.ledAt) return
      state.ledAt = step
      const cx = (LED.cols - 1) / 2
      const cy = (LED.rows - 1) / 2
      const sweep = (t * 1.6) % (Math.PI * 2)
      const cycle = t % 7
      const burst = cycle < 1.2 ? cycle / 1.2 : -1
      for (let i = 0; i < leds.length; i++) {
        const col = i % LED.cols
        const row = Math.floor(i / LED.cols)
        const dx = col - cx
        const dy = (row - cy) * 1.0
        const a = Math.atan2(dy, dx)
        let lag = sweep - a
        lag = ((lag % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
        let v = Math.exp(-lag * 1.5) * 0.95
        if (burst >= 0) {
          const r = Math.hypot(dx, dy * 1.4)
          v = Math.max(v * (1 - burst), Math.exp(-((r - burst * 8) ** 2) / 1.2) * (1 - burst * 0.6))
        }
        const o = (0.14 + v * 0.86).toFixed(2)
        if (leds[i].getAttribute('fill-opacity') !== o) leds[i].setAttribute('fill-opacity', o)
        const g = (v ** 1.4 * 0.9).toFixed(2)
        if (glows[i] && glows[i].getAttribute('fill-opacity') !== g) glows[i].setAttribute('fill-opacity', g)
      }
    }

    function tick(now) {
      const dt = state.last ? Math.min((now - state.last) / 1000, 1 / 30) : 1 / 60
      state.last = now
      const calm = stillness()
      let busy = false
      if (!calm) state.clock += dt
      const t = state.clock

      if (state.touring && !calm) {
        state.tourClock += dt
        const k = state.tourClock - FIRST_TOUR
        const next = k < 0 ? null : ORDER[Math.floor(k / TOUR_STEP) % ORDER.length]
        if (next !== state.active) select(next)
        busy = true
      }

      for (const [piece, height] of Object.entries(LIFTS)) {
        const target = state.active === piece ? height : 0
        const s = state.lifts
        const prev = s[piece]
        const next = calm ? target : prev + (target - prev) * (1 - Math.exp(-dt / 0.2))
        s[piece] = Math.abs(target - next) < 0.01 ? target : next
        if (s[piece] !== target) busy = true
        if (s[piece] !== prev) {
          const v = s[piece]
          const tr = v ? `translate(${(UP[0] * v).toFixed(2)} ${(UP[1] * v).toFixed(2)})` : ''
          const halo = halos[piece]
          if (halo) halo.style.opacity = (v / height).toFixed(3)
          for (const el of byPiece.get(piece) ?? []) {
            if (el.dataset.l?.startsWith('tail:')) continue
            if (tr) el.setAttribute('transform', tr)
            else el.removeAttribute('transform')
          }
          if (TAILS[piece] && tails[piece] && Math.abs(state.shownTail[piece] - v) > 0.02) {
            state.shownTail[piece] = v
            tails[piece].innerHTML = tailSvg(TAILS[piece], v)
          }
        }
      }

      if (!calm) {
        busy = true
        // Vector blinks every ~4 s, sometimes twice
        if (eyes) {
          const b = t % 4.1
          const close = Math.max(smooth(1 - Math.abs(b - 0.12) / 0.12), b > 0.5 && t % 12.3 < 4.1 ? smooth(1 - Math.abs(b - 0.42) / 0.11) : 0)
          const sy = 1 - close * 0.88
          eyes.setAttribute('transform', sy < 0.999 ? `translate(0 -35.5) scale(1 ${sy.toFixed(3)}) translate(0 35.5)` : '')
        }
        if (fan) fan.setAttribute('transform', `rotate(${((t * 150) % 360).toFixed(1)})`)
        props.forEach((el, i) => el.setAttribute('transform', `rotate(${(((t * 110 + i * 40) * Number(el.dataset.dir || 1)) % 360).toFixed(1)})`))
        drawLeds(t)
        // Noir looks round the room and back at the mug; the CCTV head sweeps
        const look = state.active === 'noir' ? 0 : 24 * Math.sin(t * 0.55) * smooth((Math.sin(t * 0.18) + 1) / 1.2)
        const pan = state.active === 'cctv' ? 86 : CAM.rest + 18 * Math.sin(t * 0.32)
        state.turret += (look - state.turret) * (1 - Math.exp(-dt / 0.35))
        state.cctv += (pan - state.cctv) * (1 - Math.exp(-dt / 0.5))
      } else {
        state.turret = TURRET.rest
        state.cctv = state.active === 'cctv' ? 86 : CAM.rest
      }
      if (state.narrow && svg) {
        const [x0, y0, x1, y1] = DATA.topBox
        const want = state.active ? DATA.centres[state.active] : [(x0 + x1) / 2, (y0 + y1) / 2]
        const clampTo = (v, lo, hi) => (lo > hi ? (lo + hi) / 2 : Math.min(hi, Math.max(lo, v)))
        const tx = clampTo(want[0], x0 - 8 + CROP.w / 2, x1 + 8 - CROP.w / 2)
        const ty = clampTo(want[1], y0 - 8 + CROP.h / 2, y1 + 8 - CROP.h / 2)
        const v = state.view ?? [tx, ty]
        const ease = calm ? 1 : 1 - Math.exp(-dt / 0.45)
        const next = [v[0] + (tx - v[0]) * ease, v[1] + (ty - v[1]) * ease]
        if (Math.abs(next[0] - tx) < 0.05 && Math.abs(next[1] - ty) < 0.05) next.splice(0, 2, tx, ty)
        else busy = true
        if (!state.view || next[0] !== v[0] || next[1] !== v[1]) svg.setAttribute('viewBox', `${(next[0] - CROP.w / 2).toFixed(1)} ${(next[1] - CROP.h / 2).toFixed(1)} ${CROP.w.toFixed(1)} ${CROP.h.toFixed(1)}`)
        state.view = next
      }
      if (turret && Math.abs(Number(turret.dataset.a ?? TURRET.rest) - state.turret) > 0.12) {
        turret.dataset.a = state.turret.toFixed(2)
        turret.innerHTML = turretAt(state.turret).svg
      }
      if (cctv && Math.abs(Number(cctv.dataset.a ?? CAM.rest) - state.cctv) > 0.12) {
        cctv.dataset.a = state.cctv.toFixed(2)
        cctv.innerHTML = cctvAt(state.cctv).svg
      }
      state.frame = state.visible && (busy || state.touring) ? requestAnimationFrame(tick) : 0
    }
    function kick() {
      if (!state.frame && state.visible) {
        state.last = 0
        state.frame = requestAnimationFrame(tick)
      }
    }

    const io = new IntersectionObserver(
      (entries) => {
        state.visible = entries[entries.length - 1].isIntersecting
        if (state.visible) kick()
        else if (state.frame) {
          cancelAnimationFrame(state.frame)
          state.frame = 0
        }
      },
      { rootMargin: '120px 0px' },
    )
    io.observe(root)

    const ro = new ResizeObserver(() => {
      const narrow = root.clientWidth < NARROW
      if (narrow === state.narrow) return
      state.narrow = narrow
      state.view = null
      if (!narrow) svg?.setAttribute('viewBox', `0 0 ${DATA.W} ${DATA.H}`)
      state.last = 0
      if (state.frame) cancelAnimationFrame(state.frame)
      state.frame = 0
      kick()
      if (!state.frame) tick(performance.now())
    })
    ro.observe(root)

    const objOf = (target) => {
      const el = target?.closest?.('.bn-it')
      const o = el?.dataset.o
      return o && THINGS[o] ? o : null
    }
    const onOver = (e) => {
      const o = objOf(e.target)
      if (!o) return
      takeOver()
      select(o)
    }
    const onLeave = () => {
      if (!state.user) return
      select(null)
    }
    const onDown = (e) => {
      let o = objOf(e.target)
      // on touch, a tap off the things steps to the next one
      if (!o && e.pointerType !== 'mouse') o = ORDER[(ORDER.indexOf(state.active) + 1) % ORDER.length]
      takeOver()
      select(o)
      announce()
    }
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const i = ORDER.indexOf(state.active)
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        takeOver()
        select(ORDER[(i + 1) % ORDER.length])
        announce()
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        takeOver()
        select(ORDER[(i - 1 + ORDER.length) % ORDER.length])
        announce()
      } else if (e.key === 'Home' || e.key === 'End') {
        e.preventDefault()
        takeOver()
        select(ORDER[e.key === 'Home' ? 0 : ORDER.length - 1])
        announce()
      } else if (e.key === 'Escape') {
        takeOver()
        select(null)
        announce()
      }
    }
    const onFocus = () => announce()
    root.addEventListener('pointerover', onOver)
    root.addEventListener('pointerleave', onLeave)
    root.addEventListener('pointerdown', onDown)
    root.addEventListener('keydown', onKey)
    root.addEventListener('focus', onFocus)
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onMedia = () => {
      state.touring = !media.matches && !state.user
      kick()
    }
    media.addEventListener('change', onMedia)
    select(null)
    kick()
    return () => {
      io.disconnect()
      ro.disconnect()
      clearTimeout(quiet)
      cancelAnimationFrame(state.frame)
      root.removeEventListener('pointerover', onOver)
      root.removeEventListener('pointerleave', onLeave)
      root.removeEventListener('pointerdown', onDown)
      root.removeEventListener('keydown', onKey)
      root.removeEventListener('focus', onFocus)
      media.removeEventListener('change', onMedia)
    }
  }, [])

  return (
    <figure className={`iso bn ${className}`.trim()}>
      <div className="iso-plate" ref={plate}>
        <div className="iso-plate-corners" aria-hidden="true">
          <span className="iso-plate-corner" data-corner="fig">{fig}</span>
          <span className="iso-plate-corner" data-corner="title">The bench</span>
          <span className="iso-plate-corner" data-corner="hint">
            <span className="bn-hint-wide">Hover a thing · ← →</span>
            <span className="bn-hint-narrow">Tap to cycle</span>
          </span>
          <span className="iso-plate-corner" data-corner="readout" data-readout="">{REST_TEXT}</span>
        </div>
        <div
          ref={stage}
          className="bn-stage"
          tabIndex={0}
          role="slider"
          aria-label="The bench. Use the arrow keys to pick a thing on it; Escape clears."
          aria-valuemin={0}
          aria-valuemax={ORDER.length}
          aria-valuenow={0}
          aria-valuetext="Nothing selected"
        >
          <svg className="iso-svg" viewBox={`0 0 ${DATA.W} ${DATA.H}`} role="img" aria-label={LABEL} focusable="false">
            {ART}
          </svg>
        </div>
        <span className="bn-sr" role="status" aria-live="polite" data-status="" />
      </div>
    </figure>
  )
}

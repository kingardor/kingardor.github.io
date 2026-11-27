import { useEffect, useRef, useState } from 'react'
import { subscribe, kick } from '../../shared/scroll/scrollStore.js'
import { setFilm } from '../story/filmPosition.js'
import { PROJECTS } from '../../content/index.js'
import { META, pickSet, setDir } from './portraitSets.js'
import './portrait.css'

// Same sections the story film scrubs through on Home.
const ACTS = [
  { id: 'top' }, { id: 'career' }, { id: 'skills' }, { id: 'projects' },
  { id: 'videos' }, { id: 'writing' }, { id: 'honours' }, { id: 'contact' },
]

/**
 * One look per act: where the camera sits and how the two lights burn.
 *   zoom   push-in over cover (keep ≤ ~1.15: the masters are 1672 / 1448 px)
 *   fx/fy  the point kept centred, in WIDE-shot units (0..1). The tall shot
 *          maps them through the subject's bounding box, so one set of looks
 *          frames the same part of him in either photo.
 *   warm   ember light from the left, cool: blue from the right (0..1)
 *   lens   reflections up in the sunglasses   rec: the glasses' LED is on
 */
const LOOKS = [
  { zoom: 1.00, fx: 0.50, fy: 0.40, warm: 0.55, cool: 0.45, lens: 0.20, rec: 0 },
  { zoom: 1.05, fx: 0.49, fy: 0.38, warm: 0.95, cool: 0.15, lens: 0.25, rec: 0 },
  { zoom: 1.12, fx: 0.50, fy: 0.33, warm: 0.45, cool: 0.55, lens: 0.85, rec: 0 },
  { zoom: 1.06, fx: 0.52, fy: 0.40, warm: 0.15, cool: 0.95, lens: 0.30, rec: 0 },
  { zoom: 1.14, fx: 0.50, fy: 0.31, warm: 0.40, cool: 0.60, lens: 0.70, rec: 1 },
  { zoom: 1.04, fx: 0.49, fy: 0.42, warm: 0.70, cool: 0.35, lens: 0.25, rec: 0 },
  { zoom: 1.09, fx: 0.50, fy: 0.36, warm: 0.60, cool: 0.60, lens: 0.75, rec: 0 },
  { zoom: 1.15, fx: 0.50, fy: 0.32, warm: 0.85, cool: 0.85, lens: 0.45, rec: 1 },
]

const FILES = ['plate.webp', 'subject.webp', 'rim-warm.webp', 'rim-cool.webp', 'slash-warm.webp', 'slash-cool.webp', 'lens.webp']
const COVERS = PROJECTS.filter(p => p.featured && p.images?.[0]).map(p => p.images[0].src)

const FOLLOW = 9          // 1/s: how fast the camera settles onto scroll
const POINTER_FOLLOW = 4  // 1/s: how fast the parallax and lights chase the cursor
const SNAP_ACTS = 1.5     // jumps further than this cut instead of travelling
const OVERSCAN = 1.05     // room for parallax at the frame edges
const PARALLAX = { back: -12, mid: 7, front: 16 } // px at full pointer deflection

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const mix = (a, b, t) => a + (b - a) * t
const smooth = (t) => t * t * (3 - 2 * t)
const pct = (u) => `${(u * 100).toFixed(3)}%`

/** Wide-shot units → the active shot, through the subject's bounding box. */
function toSet(set, u, axis) {
  if (set === 'wide') return u
  const a = META.wide.subject, b = META[set].subject
  const i = axis === 'x' ? 0 : 1
  return b[i] + ((u - a[i]) / (a[i + 2] - a[i])) * (b[i + 2] - b[i])
}

function preload(set, onEach) {
  return Promise.all(FILES.map(f => {
    const img = new Image()
    img.src = setDir(set) + f
    return img.decode().catch(() => {}).then(() => onEach?.())
  }))
}

/**
 * Drop-in alternative to SequenceCanvas: same props, same filmPosition
 * contract ({ P, act, t, frame, rect }), so layouts and overlays can switch
 * between the cyborg film and this. Two shots of one studio session are split
 * into aligned layers (scripts/portrait): `wide` for landscape screens, `tall`
 * for portrait ones, chosen by the stage's aspect ratio and re-chosen on
 * rotate/resize (the other shot preloads once the first is up). Scroll moves a
 * camera between per-act looks; a fine pointer adds depth parallax and steers
 * the lights. `midground` renders between backdrop and subject in wide-shot
 * pixels (a size container: cqw/cqh track the photo); it is hidden on the tall
 * shot. Idle = no frames drawn; ambient glints are finite CSS animations.
 * Reduced motion / prerender: one static frame.
 */
export default function PortraitStage({
  acts: ACT_LIST = ACTS,
  compactActs = 1,
  pane = '.portfolio',
  layerClass = 'story-layer',
  scrim = true,
  midground = null,
  looks = LOOKS,
  reflections = COVERS,
}) {
  const rootRef = useRef(null)
  const backRef = useRef(null)
  const midRef = useRef(null)
  const frontRef = useRef(null)
  const rimWarmRef = useRef(null)
  const rimCoolRef = useRef(null)
  const keyRef = useRef(null)
  const [set, setSet] = useState(() => typeof window === 'undefined' ? 'wide' : pickSet(window.innerWidth, window.innerHeight))
  const setRef = useRef(set)
  const [ready, setReady] = useState(false)
  const [lensSrc, setLensSrc] = useState(reflections[0] ?? null)
  const [still] = useState(() => typeof window === 'undefined' || !!window.__PRERENDER ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  // Preload the opening shot before the reveal (reporting to the boot loader),
  // then the other one in the background so a rotate swaps instantly.
  useEffect(() => {
    let alive = true
    let done = 0
    const first = setRef.current
    preload(first, () => { done += 1; window.__storyProgress?.(done, FILES.length) }).then(() => {
      if (!alive) return
      setReady(true)
      const other = first === 'wide' ? 'tall' : 'wide'
      const later = window.requestIdleCallback || ((fn) => setTimeout(fn, 1500))
      later(() => { if (alive) preload(other) })
    })
    return () => { alive = false }
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const compact = window.matchMedia('(max-width: 900px), (max-width: 1000px) and (max-height: 500px)')
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')

    let cw = 1, ch = 1, maxScroll = 1
    let acts = []
    const measure = () => {
      cw = root.clientWidth || window.innerWidth
      ch = root.clientHeight || window.innerHeight
      const next = pickSet(cw, ch)
      if (next !== setRef.current) { setRef.current = next; setSet(next) }
      const vh = window.innerHeight
      maxScroll = Math.max(1, document.documentElement.scrollHeight - vh)
      const visible = compact.matches ? ACT_LIST.slice(0, compactActs) : ACT_LIST
      if (compact.matches && pane) {
        const paneEl = document.querySelector(pane)
        if (paneEl) maxScroll = Math.max(1, paneEl.getBoundingClientRect().top + window.scrollY)
      }
      acts = visible
        .map(a => ({ ...a, el: document.getElementById(a.id) }))
        .filter(a => a.el)
        .map((a, k) => ({
          ...a,
          start: k === 0 ? 0 : Math.min(maxScroll - 1, Math.max(0, a.el.getBoundingClientRect().top + window.scrollY - vh * 0.85)),
        }))
      acts.forEach((a, k) => { a.end = k < acts.length - 1 ? Math.max(a.start + 1, acts[k + 1].start) : maxScroll })
      dirty = true
      kick()
    }
    const targetOf = (y) => {
      for (let k = acts.length - 1; k >= 0; k--) {
        if (y >= acts[k].start) return k + Math.min(0.9999, (y - acts[k].start) / (acts[k].end - acts[k].start))
      }
      return 0
    }
    const lookAt = (P) => {
      const k = clamp(Math.floor(P), 0, Math.max(0, acts.length - 1))
      const a = looks[k % looks.length]
      const b = k + 1 < acts.length ? looks[(k + 1) % looks.length] : a
      // Hold each look through most of its act, then travel to the next.
      const t = smooth(clamp((P - k - 0.55) / 0.45, 0, 1))
      const out = {}
      for (const key of Object.keys(a)) out[key] = mix(a[key], b[key], t)
      return out
    }

    // ── Pointer: target in -1..1, eased in the frame loop ──
    const ptr = { x: 0, y: 0, tx: 0, ty: 0 }
    const onPointer = (e) => {
      if (!finePointer.matches) return
      ptr.tx = clamp((e.clientX / window.innerWidth) * 2 - 1, -1, 1)
      ptr.ty = clamp((e.clientY / window.innerHeight) * 2 - 1, -1, 1)
      kick()
    }
    const onLeave = () => { ptr.tx = 0; ptr.ty = 0; kick() }

    let shown = -1
    let dirty = true
    let lastAct = -1
    const place = (P) => {
      const s_ = setRef.current
      const { width: W, height: H } = META[s_]
      const look = lookAt(P)
      const s = Math.max(cw / W, ch / H) * OVERSCAN * look.zoom
      const fw = W * s, fh = H * s
      const fx = toSet(s_, look.fx, 'x'), fy = toSet(s_, look.fy, 'y')
      const m = 18 // keep parallax from showing an edge
      const x = clamp(cw / 2 - fx * fw, cw - fw + m, -m)
      const y = clamp(ch / 2 - fy * fh, ch - fh + m, -m)
      const put = (el, d) => {
        if (el) el.style.transform = `translate3d(${(x + ptr.x * d).toFixed(2)}px, ${(y + ptr.y * d * 0.55).toFixed(2)}px, 0) scale(${s.toFixed(5)})`
      }
      put(backRef.current, PARALLAX.back)
      put(midRef.current, PARALLAX.mid)
      put(frontRef.current, PARALLAX.front)

      // Lights: each rim swells when the cursor sits on its side.
      const warm = clamp(look.warm * (1 - 0.45 * ptr.x), 0, 1.3)
      const cool = clamp(look.cool * (1 + 0.45 * ptr.x), 0, 1.3)
      if (rimWarmRef.current) rimWarmRef.current.style.opacity = (0.2 + 0.7 * warm).toFixed(3)
      if (rimCoolRef.current) rimCoolRef.current.style.opacity = (0.1 + 0.46 * cool).toFixed(3)
      if (keyRef.current) {
        // A soft key light over the subject, steered by the cursor (photo px).
        const [fcx, fcy] = META[s_].face
        const lx = W * (fcx + ptr.x * 0.32), ly = H * (fcy + 0.02 + ptr.y * 0.22)
        keyRef.current.style.transform = `translate3d(${(lx - 450).toFixed(1)}px, ${(ly - 450).toFixed(1)}px, 0)`
      }
      root.style.setProperty('--ps-warm', warm.toFixed(3))
      root.style.setProperty('--ps-cool', cool.toFixed(3))
      root.style.setProperty('--ps-lens', look.lens.toFixed(3))
      root.style.setProperty('--ps-rec', look.rec > 0.5 ? '1' : '0')
      root.classList.toggle('is-rec', look.rec > 0.5)
      root.style.setProperty('--ps-p', P.toFixed(4))

      const k = clamp(Math.floor(P), 0, Math.max(0, acts.length - 1))
      if (k !== lastAct) {
        lastAct = k
        if (reflections.length) setLensSrc(reflections[k % reflections.length])
      }
      const rx = x + ptr.x * PARALLAX.front, ry = y + ptr.y * PARALLAX.front * 0.55
      setFilm({
        P, act: k, id: acts[k]?.id ?? null, seq: null, t: P - k, frame: Math.round((P - k) * 89), n: 90,
        rect: { x: rx, y: ry, w: fw, h: fh }, set: s_,
      })
    }

    const off = still ? null : subscribe((y, now, dt) => {
      if (!acts.length) return false
      if (compact.matches && y >= maxScroll && !dirty) return false
      const target = targetOf(Math.min(y, maxScroll))
      const prev = shown
      if (shown < 0 || Math.abs(target - shown) > SNAP_ACTS) shown = target
      else shown += (target - shown) * (1 - Math.exp(-FOLLOW * dt))
      const ease = 1 - Math.exp(-POINTER_FOLLOW * dt)
      ptr.x += (ptr.tx - ptr.x) * ease
      ptr.y += (ptr.ty - ptr.y) * ease
      const moving = Math.abs(target - shown) > 1e-4 || Math.abs(ptr.tx - ptr.x) > 1e-3 || Math.abs(ptr.ty - ptr.y) > 1e-3
      if (Math.abs(target - shown) <= 1e-4) shown = target
      if (shown !== prev || moving || dirty) { dirty = false; place(shown) }
      return moving
    })

    measure()
    if (still) place(0)
    const ro = new ResizeObserver(() => { measure(); if (still) place(0) })
    ro.observe(root)
    ro.observe(document.body)
    if (!still) {
      window.addEventListener('pointermove', onPointer, { passive: true })
      document.documentElement.addEventListener('pointerleave', onLeave)
    }
    return () => {
      off?.()
      ro.disconnect()
      window.removeEventListener('pointermove', onPointer)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
    // acts/looks/pane are read once per mount: layouts pass stable module constants
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [still])

  // A set change re-renders the frames at the new photo size; re-place them.
  useEffect(() => { kick() }, [set])

  const geo = META[set]
  const [l0, l1] = geo.lenses
  const lensBox = { left: Math.min(l0[0], l1[0]), top: Math.min(l0[1], l1[1]), right: Math.max(l0[2], l1[2]), bottom: Math.max(l0[3], l1[3]) }
  const frameStyle = { width: `${geo.width}px`, height: `${geo.height}px` }
  const dir = setDir(set)

  return (
    <div ref={rootRef} data-set={set} className={`${layerClass} portrait-stage${ready ? ' is-ready' : ''}${still ? ' is-still' : ''}`} aria-hidden="true">
      <div ref={backRef} className="ps-frame ps-back" style={frameStyle}>
        <img className="ps-plate" src={`${dir}plate.webp`} alt="" draggable="false" />
        <div className="ps-gel ps-gel-wall" />
        <div className="ps-gel ps-gel-slash-warm" />
        <div className="ps-gel ps-gel-slash-cool" />
        <div className="ps-slash ps-slash-warm"><i /></div>
        <div className="ps-slash ps-slash-cool"><i /></div>
      </div>
      {midground && set === 'wide' && (
        <div ref={midRef} className="ps-frame ps-mid" style={frameStyle}>{midground}</div>
      )}
      <div ref={frontRef} className="ps-frame ps-front" style={frameStyle}>
        <img className="ps-subject" src={`${dir}subject.webp`} alt="" draggable="false" />
        <div className="ps-key"><i ref={keyRef} /></div>
        <img ref={rimWarmRef} className="ps-rim ps-rim-warm" src={`${dir}rim-warm.webp`} alt="" draggable="false" />
        <img ref={rimCoolRef} className="ps-rim ps-rim-cool" src={`${dir}rim-cool.webp`} alt="" draggable="false" />
        <div className="ps-gel ps-gel-rim-cool" />
        <div className="ps-lens">
          {lensSrc && (
            <img key={lensSrc} className="ps-lens-img" src={lensSrc} alt="" draggable="false" style={{
              left: pct(lensBox.left - 0.01), top: pct(lensBox.top - 0.012),
              width: pct(lensBox.right - lensBox.left + 0.02), height: pct(lensBox.bottom - lensBox.top + 0.024),
            }} />
          )}
          <i key={`glint:${lensSrc}`} className="ps-lens-glint" />
        </div>
        <span className="ps-led" style={{ left: pct(geo.led[0]), top: pct(geo.led[1]) }} />
      </div>
      {scrim && <div className="story-scrim" />}
    </div>
  )
}

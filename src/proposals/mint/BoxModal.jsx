import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLenis } from '../../shared/components/SmoothScroll'
import { BoxFront, BoxBack } from './ProjectBox.jsx'
import { useCollection } from './collection.js'
import { isReduced, packVars } from './data.js'

// A real spring, sampled into a CSS linear() easing (overshoot included).
function springEasing(stiff = 170, damp = 16, n = 48) {
  const pts = []
  let x = 0, v = 0
  const dt = 1 / 60
  const T = 1.1
  for (let i = 0; i <= n; i++) {
    pts.push(x)
    const steps = Math.round(T / n / dt) || 1
    for (let s = 0; s < steps; s++) { const a = stiff * (1 - x) - damp * v; v += a * dt; x += v * dt }
  }
  pts[n] = 1
  return `linear(${pts.map(p => p.toFixed(4)).join(', ')})`
}
const SPRING = typeof CSS !== 'undefined' && CSS.supports?.('transition-timing-function', 'linear(0, 1)')
  ? springEasing() : 'cubic-bezier(0.34, 1.4, 0.64, 1)'

function delta(from, to, rest = 0) {
  return `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}) rotate(${rest}deg)`
}

export default function BoxModal({ p, index, fromRect, rest, getHomeRect, onClosed }) {
  const { opened } = useCollection()
  const lenisRef = useLenis()
  const reduced = useRef(isReduced()).current
  const flyRef = useRef(null)
  const flipRef = useRef(null)
  const firstBtn = useRef(null)
  const stripRef = useRef(null)
  const [side, setSide] = useState(0) // degrees: 0 front, 180 back
  const [tear, setTear] = useState(0)
  const [torn, setTorn] = useState(false)
  const [light, setLight] = useState(null)
  const closing = useRef(false)

  // Fly from the peg to the hands
  useLayoutEffect(() => {
    const el = flyRef.current
    if (!el || reduced || !fromRect) return
    const to = el.getBoundingClientRect()
    el.animate([{ transform: delta(fromRect, to, rest) }, { transform: 'none' }], { duration: 760, easing: SPRING })
  }, [fromRect, rest, reduced])

  useEffect(() => {
    const lenis = lenisRef?.current
    lenis?.stop()
    firstBtn.current?.focus({ preventScroll: true })
    return () => lenis?.start()
  }, [lenisRef])

  const close = () => {
    if (closing.current) return
    closing.current = true
    const el = flyRef.current
    const home = getHomeRect?.()
    if (!el || reduced || !home) { onClosed(); return }
    setSide(0)
    const from = el.getBoundingClientRect()
    const a = el.animate([{ transform: 'none' }, { transform: delta(home, from, rest) }], { duration: 520, easing: 'cubic-bezier(0.5, 0, 0.75, 0)', fill: 'forwards' })
    a.onfinish = onClosed
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      e.preventDefault()
      if (light) setLight(null)
      else close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // Flip: button or drag (horizontal) on the box
  const drag = useRef(null)
  const onFlipDown = (e) => {
    if (torn || e.target.closest('a, button, .mb-tear')) return
    drag.current = { x: e.clientX, base: side, moved: false }
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }
  const onFlipMove = (e) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.x
    if (!d.moved && Math.abs(dx) < 6) return
    d.moved = true
    flipRef.current.style.transition = 'none'
    flipRef.current.style.transform = `rotateY(${d.base + dx * 0.6}deg)`
    d.cur = d.base + dx * 0.6
  }
  const onFlipUp = () => {
    const d = drag.current
    drag.current = null
    if (!d?.moved) return
    flipRef.current.style.transition = ''
    flipRef.current.style.transform = ''
    setSide(Math.round(d.cur / 180) * 180)
  }

  // Tear: drag the pull-tab along the perforation (or press it)
  const tearDrag = useRef(null)
  const finishTear = () => { setTear(1); setTimeout(() => { setTorn(true); setSide(0) }, reduced ? 0 : 420) }
  const onTearDown = (e) => {
    e.stopPropagation()
    tearDrag.current = { moved: false, x0: e.clientX }
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }
  const onTearMove = (e) => {
    if (!tearDrag.current) return
    const r = stripRef.current.getBoundingClientRect()
    const t = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width))
    if (Math.abs(e.clientX - tearDrag.current.x0) > 4) tearDrag.current.moved = true
    setTear(prev => Math.max(prev, t))
    if (t > 0.9) { tearDrag.current = null; finishTear() }
  }
  const onTearUp = () => {
    const d = tearDrag.current
    tearDrag.current = null
    if (d && !d.moved) { finishTear(); return }
    if (!torn && tear < 0.9) setTear(t => (t > 0.5 ? t : 0))
  }

  const tearStrip = (
    <div className={`mb-tear${tear > 0 ? ' is-going' : ''}${tear >= 1 ? ' is-off' : ''}`} ref={stripRef} style={{ '--t': tear }}>
      <span className="mb-tear-perf" aria-hidden="true" />
      <span className="mb-tear-done" aria-hidden="true" />
      <button
        type="button" className="mb-tear-tab"
        aria-label="Tear here: drag along the perforation, or press to tear the box open"
        onPointerDown={onTearDown} onPointerMove={onTearMove} onPointerUp={onTearUp} onPointerCancel={onTearUp}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); finishTear() } }}
      >TEAR HERE ▸</button>
    </div>
  )

  const imgs = p.images
  const cols = imgs.length >= 7 ? 4 : imgs.length === 4 ? 2 : Math.min(3, imgs.length)

  return (
    <div className={`mb-modal${torn ? ' is-torn' : ''}`} role="dialog" aria-modal="true" aria-label={`${p.name}, picked up off the wall`} style={packVars(p)}>
      <div className="mb-modal-bg" onClick={close} aria-hidden="true" />
      <div className="mb-modal-stage">
        <div className="mb-modal-hold">
          <div className="mb-modal-box" ref={flyRef}>
            <div
              className={`mb-flip${torn ? ' is-torn' : ''}`} ref={flipRef}
              style={{ transform: `rotateY(${side}deg)`, transition: `transform ${reduced ? 0 : 760}ms ${SPRING}` }}
              onPointerDown={onFlipDown} onPointerMove={onFlipMove} onPointerUp={onFlipUp} onPointerCancel={onFlipUp}
            >
              <div className="mb-flip-face mb-flip-front" aria-hidden={side % 360 !== 0}>
                <BoxFront p={p} index={index} eager tear={torn ? null : tearStrip} />
                {torn && <div className="mb-torn-lip" aria-hidden="true" />}
              </div>
              <div className="mb-flip-face mb-flip-back" aria-hidden={side % 360 === 0}>
                <BoxBack p={p} opened={opened} />
              </div>
            </div>
            {tear >= 1 && <div className="mb-lid-fly" aria-hidden="true" />}
          </div>
        </div>

        {torn && (
          <div className="mb-tray" aria-label={`Collector’s tray: ${imgs.length} pieces`}>
            <div className="mb-tray-head">
              <b>COLLECTOR’S TRAY</b><span>{imgs.length} PIECE{imgs.length > 1 ? 'S' : ''} · CLICK TO INSPECT</span>
            </div>
            <ul className="mb-tray-wells" style={{ '--cols': cols }}>
              {imgs.map((im, i) => (
                <li key={im.src} style={{ '--i': i }}>
                  <button type="button" className="mb-well" onClick={() => setLight(im)} aria-label={`View large: ${im.alt}`}>
                    <img src={im.src} width={im.w} height={im.h} alt={im.alt} loading="lazy" decoding="async" />
                    <span className="mb-well-no">{String(i + 1).padStart(2, '0')}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mb-modal-ctrl">
        <button ref={firstBtn} type="button" className="mb-btn" onClick={() => setSide(s => (Math.round(s / 180) % 2 === 0 ? s + 180 : s - 180))} disabled={torn}>
          FLIP IT ↻
        </button>
        {!torn && <button type="button" className="mb-btn mb-btn--pink" onClick={finishTear}>TEAR IT OPEN ✂</button>}
        <button type="button" className="mb-btn mb-btn--ghost" onClick={close}>BACK ON THE PEG · ESC</button>
      </div>
      <p className="mb-modal-hint" aria-hidden="true">{torn ? 'Loose, not mint. Worth it.' : 'Drag the box to flip it. Drag the pull-tab along the perforation to tear.'}</p>

      {light && (
        <div className="mb-light" role="dialog" aria-modal="true" aria-label={light.alt} onClick={() => setLight(null)}>
          <figure onClick={e => e.stopPropagation()}>
            <img src={light.src} width={light.w} height={light.h} alt={light.alt} />
            <figcaption>{light.alt}</figcaption>
          </figure>
          <button type="button" className="mb-btn mb-light-x" onClick={() => setLight(null)} autoFocus>CLOSE · ESC</button>
        </div>
      )}
    </div>
  )
}

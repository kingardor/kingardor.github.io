import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import PixelAssembly from '../shared/PixelAssembly.jsx'
import { subscribe, kick } from '../../shared/scroll/scrollStore.js'
import { PROFILE } from '../../content/index.js'
import { Barcode, Burst, PrintMarks, AgeBadge, Chrome } from './parts.jsx'
import { euroHolePath, roundRectPath } from './geometry.js'
import { isReduced } from './data.js'

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const seg = (p, a, b) => clamp((p - a) / (b - a))
const easeInOut = t => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

/**
 * The mega-box: the card slams down around his portrait (the pixel-assembly
 * intro only runs under ?bg=film). Scroll: the blister hinges open, the card
 * drops off the bottom of the screen, the portrait is left full-bleed.
 * Every frame is f(scroll).
 */
export default function HeroBox() {
  const reduced = useRef(isReduced()).current
  const [landed, setLanded] = useState(reduced)
  const secRef = useRef(null)
  const faceRef = useRef(null)
  const winRef = useRef(null)
  const cardRef = useRef(null)
  const bubbleRef = useRef(null)
  const flareRef = useRef(null)
  const outRef = useRef(null)
  const shadowRef = useRef(null)

  // Safety: if the assembly never reports (no canvas), box him anyway
  useEffect(() => {
    if (landed) return
    const id = setTimeout(() => setLanded(true), 6500)
    return () => clearTimeout(id)
  }, [landed])

  // Die-cut the window and the euro hole out of the printed card
  useLayoutEffect(() => {
    const face = faceRef.current, win = winRef.current, bubble = bubbleRef.current
    if (!face || !win) return
    const cut = () => {
      const W = face.offsetWidth, H = face.offsetHeight
      const x = win.offsetLeft, y = win.offsetTop, w = win.offsetWidth, h = win.offsetHeight
      const r = Math.min(56, w * 0.11)
      const hy = Math.min(y * 0.5, 40)
      const hw = Math.min(120, W * 0.16)
      const path = `M0 0H${W}V${H}H0Z ${roundRectPath(x, y, w, h, r)} ${euroHolePath(W / 2, hy, hw, hw * 0.2, hw * 0.17)}`
      face.style.clipPath = `path(evenodd, "${path}")`
      Object.assign(bubble.style, { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px`, borderRadius: `${r}px` })
      face.style.setProperty('--mb-hole-y', `${hy}px`)
    }
    cut()
    const ro = new ResizeObserver(cut)
    ro.observe(face)
    return () => ro.disconnect()
  }, [])

  // Scroll choreography: hinge, flare, drop
  useEffect(() => {
    if (reduced) return
    const sec = secRef.current
    let top = 0, range = 1
    const measure = () => {
      top = sec.getBoundingClientRect().top + window.scrollY
      range = Math.max(1, sec.offsetHeight - window.innerHeight)
      kick()
    }
    measure()
    window.addEventListener('resize', measure)
    let last = -1
    const off = subscribe((y) => {
      const p = clamp((y - top) / range)
      if (p === last) return false
      last = p
      const open = easeInOut(seg(p, 0.04, 0.42))
      const drop = seg(p, 0.36, 0.86)
      const ang = open * 118
      bubbleRef.current.style.transform = `perspective(1600px) rotateX(${ang.toFixed(2)}deg)`
      bubbleRef.current.style.setProperty('--mb-open', open.toFixed(3))
      flareRef.current.style.opacity = (Math.sin(Math.PI * clamp(open * 1.15)) * 0.95).toFixed(3)
      const ty = drop * drop * 122
      cardRef.current.style.transform = drop > 0 ? `translate3d(0, ${ty.toFixed(2)}vh, 0) rotate(${(drop * 6).toFixed(2)}deg)` : ''
      cardRef.current.style.visibility = drop >= 1 ? 'hidden' : ''
      shadowRef.current.style.opacity = (1 - drop).toFixed(3)
      const out = seg(p, 0.82, 0.95)
      outRef.current.style.opacity = out.toFixed(3)
      outRef.current.style.transform = `translate3d(0, ${((1 - out) * 30).toFixed(1)}px, 0) rotate(${(-6 + out * 2).toFixed(2)}deg) scale(${(0.85 + out * 0.15).toFixed(3)})`
      return false
    })
    return () => { off(); window.removeEventListener('resize', measure) }
  }, [reduced])

  // Plastic glare follows the cursor
  const onMove = (e) => {
    const b = bubbleRef.current
    if (!b) return
    const r = b.getBoundingClientRect()
    b.style.setProperty('--mx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`)
    b.style.setProperty('--my', `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`)
  }

  return (
    <section id="mb-box" ref={secRef} className={`mb-hero${reduced ? ' is-static' : ''}`} aria-label="Akash James, AI Architect action figure" onPointerMove={onMove}>
      <div className="mb-hero-pin">
        <PixelAssembly onAssembled={() => setLanded(true)} />
        <div ref={shadowRef} className={`mb-hero-vignette${landed ? ' is-on' : ''}`} aria-hidden="true" />
        <div ref={cardRef} className="mb-hero-card">
          <div className={`mb-hero-slam${landed ? ' is-landed' : ''}`}>
            <div ref={faceRef} className="mb-hero-face">
              <div className="mb-hero-art" aria-hidden="true" />
              <div className="mb-hero-grid">
                <div className="mb-hero-head">
                  <span>AKASH JAMES COLLECTIBLES</span>
                  <span className="mb-hero-head-r"><span className="mb-hide-sm">SERIES 2026 · </span>No. 001/001</span>
                </div>

                <div ref={winRef} className="mb-hero-win" aria-hidden="true" />

                <div className="mb-hero-right">
                  <ul className="mb-callouts">
                    <li className="mb-callout mb-callout--a"><b>3</b><span>VIDEO AI PLATFORMS INCLUDED<small>IRIS · VAIA · BLUE</small></span></li>
                    <li className="mb-callout mb-callout--b"><b>2×</b><span>NASA SPACE APPS WINS!<small>2019 · 2020</small></span></li>
                    <li className="mb-callout mb-callout--c"><b>8+</b><span>YEARS OF R&amp;D<small>Production, not notebooks</small></span></li>
                    <li className="mb-callout mb-callout--e"><b>50+</b><span>MODELS SHIPPED<small>Prod-grade, not demos</small></span></li>
                    <li className="mb-callout mb-callout--d"><b>1</b><span>ACQUISITION SURVIVED<small>Integration Wizards → SparkCognition</small></span></li>
                  </ul>
                  <div className="mb-hero-badges">
                    <AgeBadge />
                    <div className="mb-hero-bat">BATTERIES<br />NOT INCLUDED</div>
                    <Barcode seed="akash-james-001" className="mb-hero-barcode" />
                  </div>
                </div>

                <div className="mb-hero-foot">
                  <PrintMarks className="mb-hero-marks" />
                  <p className="mb-fine">
                    WARNING: CHOKING HAZARD. Contains small agents. Not suitable for clouds. Figure ships with opinions
                    pre-installed; colours and lighting may vary as you scroll. Made in Bengaluru, IN.
                  </p>
                  <span className="mb-hero-scrollhint">PULL TAB: SCROLL TO OPEN ▾</span>
                </div>
              </div>
            </div>

            <div ref={bubbleRef} className="mb-hero-bubble" aria-hidden="true">
              <i className="mb-glare" />
              <i className="mb-glare2" />
              <i ref={flareRef} className="mb-flare" />
            </div>

            <div className="mb-hero-grid mb-hero-over">
              <div className="mb-hero-left">
                <span className="mb-pill">COLLECTOR’S EDITION · 1:1 SCALE</span>
                <h1 className="mb-hero-logo">
                  <Chrome text="AKASH" className="mb-hero-logo-a" />
                  <Chrome text="JAMES" className="mb-hero-logo-b" />
                </h1>
                <p className="mb-hero-tape"><span>AI ARCHITECT</span> ACTION FIGURE</p>
                <div className="mb-hero-says">
                  <span className="mb-hero-says-tag">SAYS 1 PHRASE!</span>
                  <q>{PROFILE.headline}</q>
                </div>
                <p className="mb-hero-role">{PROFILE.role} · {PROFILE.location}</p>
              </div>

            </div>

            <Burst className="mb-hero-burst" fill="#FFD400" ink="#111" points={18}>
              <small>NOW WITH</small><b>VLMs!</b>
            </Burst>
          </div>
        </div>

        <div ref={outRef} className="mb-hero-out" aria-hidden={!reduced}>
          <b>OUT OF THE BOX.</b>
          <span>Value no longer mint. Value went up.</span>
        </div>
      </div>
    </section>
  )
}

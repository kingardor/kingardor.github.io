import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { isReduced } from './data.js'

// Six kiss-cut stickers. Peel one off the sheet, slap it anywhere on the
// page. Positions persist; double-click (or Delete) peels it back off.
const STICKERS = [
  { id: 'shipped', label: 'SHIPPED', title: 'Shipped: production, not notebooks' },
  { id: 'nocloud', label: 'NO CLOUD', title: 'No cloud: Noir, Vector, Veronica and Q-Pocket run local' },
  { id: 'vibe', label: 'VIBE CODED', title: 'Vibe coded: CopCars.in went straight to production' },
  { id: 'nasa', label: 'WINNER', title: 'Winner: NASA Space Apps, 2019 and 2020' },
  { id: 'gtc', label: 'GTC', title: 'NVIDIA GTC 2025 speaker' },
  { id: '98', label: '98%', title: 'Vector’s behaviour score: 98.0%' },
]

const KEY = 'mb:stickers'
const subs = new Set()
let placed = (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch { return {} } })()
function setPlaced(next) {
  placed = next
  try { localStorage.setItem(KEY, JSON.stringify(placed)) } catch { /* memory only */ }
  subs.forEach(f => f())
}
const usePlaced = () => useSyncExternalStore(f => { subs.add(f); return () => subs.delete(f) }, () => placed, () => placed)

function root() { return document.querySelector('.mb-root') }

/** The artwork, shared by the sheet, the drag ghost and the page. */
export function StickerArt({ id }) {
  switch (id) {
    case 'shipped':
      return (
        <svg viewBox="0 0 120 120" className="mb-st-svg">
          <circle cx="60" cy="60" r="57" fill="#fff" />
          <circle cx="60" cy="60" r="52" fill="none" stroke="#d8261b" strokeWidth="5" />
          <circle cx="60" cy="60" r="43" fill="none" stroke="#d8261b" strokeWidth="1.5" strokeDasharray="3 3" />
          <rect x="10" y="47" width="100" height="27" fill="#d8261b" transform="rotate(-12 60 60)" />
          <text x="60" y="67" textAnchor="middle" fill="#fff" fontFamily="MB Bungee" fontSize="19" transform="rotate(-12 60 60)">SHIPPED</text>
          <text x="60" y="35" textAnchor="middle" fill="#d8261b" fontFamily="JetBrains Mono" fontSize="7.5" fontWeight="500">TO PRODUCTION</text>
          <text x="60" y="94" textAnchor="middle" fill="#d8261b" fontFamily="JetBrains Mono" fontSize="7.5" fontWeight="500">NOT A NOTEBOOK</text>
        </svg>
      )
    case 'nocloud':
      return (
        <svg viewBox="0 0 150 100" className="mb-st-svg">
          <rect x="3" y="3" width="144" height="94" rx="47" fill="#121014" />
          <rect x="8" y="8" width="134" height="84" rx="42" fill="none" stroke="#9DFF00" strokeWidth="2" />
          <path d="M44 62h44a14 14 0 0 0 0-28 20 20 0 0 0-38-4 14 14 0 0 0-6 32z" fill="none" stroke="#fff" strokeWidth="5" strokeLinejoin="round" transform="translate(-6 -6)" />
          <path d="M34 72L98 22" stroke="#FF2E88" strokeWidth="7" strokeLinecap="round" />
          <text x="116" y="45" textAnchor="middle" fill="#9DFF00" fontFamily="MB Bungee" fontSize="15">NO</text>
          <text x="114" y="63" textAnchor="middle" fill="#9DFF00" fontFamily="MB Bungee" fontSize="11">CLOUD</text>
        </svg>
      )
    case 'vibe':
      return (
        <svg viewBox="0 0 160 80" className="mb-st-svg mb-st-holo">
          <defs>
            <linearGradient id="mbHolo" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ff9de2" /><stop offset=".25" stopColor="#a5f3ff" /><stop offset=".5" stopColor="#fff6a8" />
              <stop offset=".75" stopColor="#c6a7ff" /><stop offset="1" stopColor="#8affc1" />
            </linearGradient>
          </defs>
          <path d="M8 4h144l-6 18 6 18-6 18 6 18H8l6-18-6-18 6-18z" fill="url(#mbHolo)" stroke="#111" strokeWidth="2.5" />
          <text x="80" y="38" textAnchor="middle" fill="#111" fontFamily="MB Mona" fontStyle="italic" fontWeight="900" fontSize="24" style={{ fontStretch: '125%' }}>VIBE</text>
          <text x="80" y="60" textAnchor="middle" fill="#111" fontFamily="MB Bungee" fontSize="14">CODED</text>
        </svg>
      )
    case 'nasa':
      return (
        <svg viewBox="0 0 120 120" className="mb-st-svg">
          <defs>
            <radialGradient id="mbGold" cx=".35" cy=".3" r=".8">
              <stop offset="0" stopColor="#fff4c0" /><stop offset=".45" stopColor="#e6b43c" /><stop offset="1" stopColor="#8a5a08" />
            </radialGradient>
          </defs>
          <polygon fill="url(#mbGold)" stroke="#6b4505" strokeWidth="1.5"
            points={Array.from({ length: 48 }, (_, i) => { const a = (Math.PI * i) / 24, r = i % 2 ? 52 : 58; return `${60 + r * Math.cos(a)},${60 + r * Math.sin(a)}` }).join(' ')} />
          <circle cx="60" cy="60" r="42" fill="none" stroke="#6b4505" strokeWidth="1.2" />
          <text x="60" y="56" textAnchor="middle" fill="#4a2e00" fontFamily="MB Bungee" fontSize="17">WINNER</text>
          <text x="60" y="73" textAnchor="middle" fill="#4a2e00" fontFamily="JetBrains Mono" fontSize="8" fontWeight="500">NASA SPACE APPS</text>
          <text x="60" y="85" textAnchor="middle" fill="#4a2e00" fontFamily="JetBrains Mono" fontSize="6.5">2019 · 2020</text>
        </svg>
      )
    case 'gtc':
      return (
        <svg viewBox="0 0 110 110" className="mb-st-svg">
          <rect x="4" y="4" width="102" height="102" rx="18" fill="#121014" />
          <rect x="10" y="10" width="90" height="90" rx="13" fill="none" stroke="#FF3D00" strokeWidth="2.5" />
          <text x="55" y="38" textAnchor="middle" fill="#ece9e2" fontFamily="JetBrains Mono" fontSize="9" fontWeight="500">AS SEEN AT</text>
          <text x="55" y="70" textAnchor="middle" fill="#FF3D00" fontFamily="MB Mona" fontStyle="italic" fontWeight="900" fontSize="34" style={{ fontStretch: '125%' }}>GTC</text>
          <text x="55" y="88" textAnchor="middle" fill="#ece9e2" fontFamily="JetBrains Mono" fontSize="8">SPEAKER · 2025</text>
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 120 120" className="mb-st-svg">
          <polygon fill="#9DFF00" stroke="#111" strokeWidth="2.5"
            points={Array.from({ length: 28 }, (_, i) => { const a = (Math.PI * i) / 14 - Math.PI / 2, r = i % 2 ? 44 : 57; return `${60 + r * Math.cos(a)},${60 + r * Math.sin(a)}` }).join(' ')} />
          <text x="60" y="66" textAnchor="middle" fill="#111" fontFamily="MB Mona" fontStyle="italic" fontWeight="900" fontSize="30" style={{ fontStretch: '125%' }} transform="rotate(-8 60 60)">98%</text>
          <text x="60" y="82" textAnchor="middle" fill="#111" fontFamily="JetBrains Mono" fontSize="7" fontWeight="500" transform="rotate(-8 60 60)">BEHAVIOUR SCORE</text>
        </svg>
      )
  }
}

const rot = id => ((id.charCodeAt(0) * 37) % 24) - 12

/** Shared drag: a fixed ghost follows the pointer; drop converts to page coords. */
function useStickerDrag() {
  const [drag, setDrag] = useState(null)
  const ghost = useRef(null)
  const start = (e, id, fromSheet) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    const d = { id, fromSheet, offX: e.clientX - r.left, offY: e.clientY - r.top, w: r.width, h: r.height, x0: e.clientX, y0: e.clientY, moved: false }
    e.currentTarget.setPointerCapture?.(e.pointerId)
    const move = (ev) => {
      if (!d.moved && Math.hypot(ev.clientX - d.x0, ev.clientY - d.y0) < 5) return
      if (!d.moved) { d.moved = true; setDrag({ ...d }) }
      const g = ghost.current
      if (g) g.style.transform = `translate3d(${ev.clientX - d.offX}px, ${ev.clientY - d.offY}px, 0) rotate(${rot(id) + Math.max(-14, Math.min(14, (ev.clientX - d.x0) * 0.03))}deg)`
      d.lx = ev.clientX; d.ly = ev.clientY
    }
    const up = (ev) => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      if (!d.moved) return
      setDrag(null)
      const el = root()
      if (!el || ev.type === 'pointercancel') return
      const sheet = document.querySelector('.mb-sheet')?.getBoundingClientRect()
      if (sheet && ev.clientX > sheet.left && ev.clientX < sheet.right && ev.clientY > sheet.top && ev.clientY < sheet.bottom) {
        const next = { ...placed }; delete next[id]; setPlaced(next); return
      }
      const rr = el.getBoundingClientRect()
      setPlaced({ ...placed, [id]: { x: (ev.clientX - d.offX - rr.left) / rr.width, y: ev.clientY - d.offY - rr.top, w: d.w, t: Date.now() } })
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
  }
  useEffect(() => {
    if (!drag || !ghost.current) return
    ghost.current.style.transform = `translate3d(${drag.x0 - drag.offX}px, ${drag.y0 - drag.offY}px, 0) rotate(${rot(drag.id)}deg)`
  }, [drag])
  // Portalled to the root: the sheet is rotated, and a transformed ancestor would trap position: fixed
  const ghostEl = drag && createPortal(
    <div ref={ghost} className="mb-st-ghost" style={{ width: drag.w, height: drag.h }} aria-hidden="true">
      <div className="mb-st-peel"><StickerArt id={drag.id} /></div>
    </div>,
    root() || document.body,
  )
  return { start, ghostEl, dragging: drag?.id }
}

export function StickerSheet() {
  const p = usePlaced()
  const { start, ghostEl, dragging } = useStickerDrag()
  const place = (id) => {
    const el = root(); if (!el) return
    const rr = el.getBoundingClientRect()
    const i = STICKERS.findIndex(s => s.id === id)
    setPlaced({ ...placed, [id]: { x: 0.08 + ((i * 0.17) % 0.8), y: window.scrollY - (rr.top + window.scrollY) + window.innerHeight * (0.25 + (i % 3) * 0.15), w: 110, t: Date.now() } })
  }
  return (
    <div className="mb-sheet">
      <div className="mb-sheet-head">
        <b>FREE STICKER SHEET</b><span>Peel. Slap anywhere. Double-click to peel back.</span>
      </div>
      <ul className="mb-sheet-grid">
        {STICKERS.map(s => {
          const used = !!p[s.id] || dragging === s.id
          return (
            <li key={s.id} className={`mb-sheet-slot mb-sheet-slot--${s.id}${used ? ' is-used' : ''}`}>
              <span className="mb-sheet-cut" aria-hidden="true" />
              {!used && (
                <button
                  type="button" className="mb-st mb-st--sheet" title={s.title}
                  aria-label={`${s.label} sticker. Drag it anywhere, or press Enter to stick it on the page`}
                  onPointerDown={e => start(e, s.id, true)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); place(s.id) } }}
                  onClick={e => e.preventDefault()}
                >
                  <StickerArt id={s.id} />
                </button>
              )}
            </li>
          )
        })}
      </ul>
      <p className="mb-fine">Contents: 6 stickers. Adhesive is emotional, not structural.</p>
      {ghostEl}
    </div>
  )
}

/** Everything slapped on the page lives here, in page coordinates. */
export function StickerLayer() {
  const p = usePlaced()
  const { start, ghostEl, dragging } = useStickerDrag()
  const reduced = isReduced()
  const remove = (id) => { const next = { ...placed }; delete next[id]; setPlaced(next) }
  return (
    <div className="mb-st-layer">
      {STICKERS.filter(s => p[s.id] && dragging !== s.id).map(s => (
        <button
          key={s.id + p[s.id].t}
          type="button"
          className={`mb-st mb-st--placed${reduced ? '' : ' is-slapped'}`}
          style={{ left: `${(p[s.id].x * 100).toFixed(3)}%`, top: `${p[s.id].y}px`, width: p[s.id].w, '--r': `${rot(s.id)}deg` }}
          title={`${s.title}. Double-click to peel off`}
          aria-label={`${s.label} sticker on the page. Press Delete to peel it off`}
          onPointerDown={e => start(e, s.id, false)}
          onDoubleClick={() => remove(s.id)}
          onKeyDown={e => { if (e.key === 'Delete' || e.key === 'Backspace') remove(s.id) }}
        >
          <StickerArt id={s.id} />
        </button>
      ))}
      {ghostEl}
    </div>
  )
}

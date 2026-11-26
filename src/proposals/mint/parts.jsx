// Print-shop parts every box shares: barcode, starburst, production marks,
// age badge, euro hang hole. Pure SVG/CSS, no images.
import { createElement } from 'react'
import { hash } from './data.js'

const L = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011']
const R = L.map(c => c.replace(/./g, b => (b === '0' ? '1' : '0')))
const G = R.map(c => c.split('').reverse().join(''))
const PARITY = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG', 'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL']

/** A real EAN-13 (prefix 890, India), seeded so every box gets its own. */
function ean13(seed) {
  const n = String(hash(seed)).padStart(10, '0').slice(0, 9)
  const d = ('890' + n).split('').map(Number)
  const sum = d.reduce((s, x, i) => s + x * (i % 2 ? 3 : 1), 0)
  d.push((10 - (sum % 10)) % 10)
  return d
}

export function Barcode({ seed, className = '', ink = '#0b0b0b', paper = '#fff' }) {
  const d = ean13(seed)
  const par = PARITY[d[0]]
  let bits = '101'
  for (let i = 1; i <= 6; i++) bits += (par[i - 1] === 'L' ? L : G)[d[i]]
  bits += '01010'
  for (let i = 7; i <= 12; i++) bits += R[d[i]]
  bits += '101'
  const guard = new Set([0, 1, 2, 45, 46, 47, 48, 49, 92, 93, 94])
  const bars = []
  for (let i = 0; i < bits.length; i++) {
    if (bits[i] !== '1') continue
    let w = 1
    while (bits[i + w] === '1' && guard.has(i) === guard.has(i + w)) w++
    bars.push(<rect key={i} x={i + 9} y={2} width={w} height={guard.has(i) ? 50 : 44} fill={ink} />)
    i += w - 1
  }
  const txt = d.join('')
  return (
    <svg className={`mb-barcode ${className}`} viewBox="0 0 112 60" role="img" aria-label={`Barcode ${txt}`}>
      <rect width="112" height="60" fill={paper} />
      {bars}
      <g fill={ink} fontFamily="JetBrains Mono, monospace" fontSize="8.5" textAnchor="middle">
        <text x="4" y="57">{txt[0]}</text>
        <text x="33" y="57" letterSpacing="1.2">{txt.slice(1, 7)}</text>
        <text x="79" y="57" letterSpacing="1.2">{txt.slice(7)}</text>
      </g>
    </svg>
  )
}

function burstPoints(n, r1, r2, jitter = 0) {
  const pts = []
  for (let i = 0; i < n * 2; i++) {
    const a = (Math.PI * i) / n - Math.PI / 2
    const r = i % 2 ? r2 : r1 + (jitter ? ((i * 37) % 7) / 7 * jitter : 0)
    pts.push(`${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`)
  }
  return pts.join(' ')
}

/** Starburst with printed misregistration: the fill is offset from its keyline. */
export function Burst({ children, fill = '#FFD400', ink = '#111', points = 16, className = '', style }) {
  return (
    <div className={`mb-burst ${className}`} style={style}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <polygon points={burstPoints(points, 50, 40, 4)} fill={ink} transform="translate(1.6 1.8)" />
        <polygon points={burstPoints(points, 48, 38, 4)} fill={fill} stroke={ink} strokeWidth="1.4" />
        <polygon points={burstPoints(points, 44.5, 35, 4)} fill="none" stroke={ink} strokeWidth="0.5" strokeDasharray="1 1.6" opacity="0.5" />
      </svg>
      <div className="mb-burst-in" style={{ color: ink }}>{children}</div>
    </div>
  )
}

/** CMYK patches, tint ramp and a registration target: the bit printers trim off. */
export function PrintMarks({ vertical = false, className = '' }) {
  const sw = ['#00AEEF', '#EC008C', '#FFF200', '#111', '#555', '#999', '#ccc']
  const W = vertical ? 12 : 120, H = vertical ? 120 : 12
  return (
    <svg className={`mb-printmarks ${className}`} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      {sw.map((c, i) => vertical
        ? <rect key={c} x="2" y={22 + i * 9} width="8" height="8" fill={c} />
        : <rect key={c} x={22 + i * 9} y="2" width="8" height="8" fill={c} />)}
      <g transform={vertical ? 'translate(6 10)' : 'translate(10 6)'} fill="none" stroke="#111" strokeWidth="0.7">
        <circle r="4.2" /><circle r="2" />
        <path d="M-6 0H6M0 -6V6" />
      </g>
      <g transform={vertical ? 'translate(6 100)' : 'translate(100 6)'} fill="none" stroke="#111" strokeWidth="0.7">
        <circle r="3.6" /><path d="M-5 0H5M0 -5V5" />
      </g>
    </svg>
  )
}

export function AgeBadge({ className = '' }) {
  return (
    <div className={`mb-age ${className}`} aria-label="Ages 25 and up">
      <span>AGES</span><b>25+</b>
    </div>
  )
}

/** Section sign: a die-cut shelf talker that sticks out from the wall. */
export function Talker({ kicker, title, sub, tone = 'ember', className = '' }) {
  return (
    <header className={`mb-talker mb-talker--${tone} ${className}`}>
      <span className="mb-talker-kicker">{kicker}</span>
      <h2 className="mb-talker-title">{title}</h2>
      {sub && <p className="mb-talker-sub">{sub}</p>}
    </header>
  )
}

/** Chrome toy-logo type: the gradient face sits over an extruded duplicate. */
export function Chrome({ as: Tag = 'span', text, className = '', tone = 'chrome', style }) {
  // The wrapper may be transformed; the chrome span must not be a stacking
  // context or its extrusion (::before, z -1) would paint over its own face.
  return createElement(Tag, { className: `mb-chrome-wrap ${className}`, style },
    <span className={`mb-chrome mb-chrome--${tone}`} data-text={text}>{text}</span>)
}

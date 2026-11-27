// Drawn ink: impact bursts, splatters, speed lines and misregistered type.
// All decorative SVG is aria-hidden; text always exists as real text.

function rng(seed) {
  let s = seed >>> 0
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 }
}

function burstPath(seed, spikes, inner, outer) {
  const r = rng(seed)
  const pts = []
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i / (spikes * 2)) * Math.PI * 2 + (r() - 0.5) * 0.12
    const rad = i % 2 ? inner * (0.85 + r() * 0.3) : outer * (0.72 + r() * 0.28)
    pts.push(`${(50 + Math.cos(a) * rad).toFixed(2)},${(50 + Math.sin(a) * rad).toFixed(2)}`)
  }
  return `M${pts.join('L')}Z`
}

/** Jagged impact star. `layers` stacks offset copies in riso inks. */
export function Burst({ seed = 7, spikes = 14, className = '', inks = ['hi', 'spot'], inner = 26, outer = 50 }) {
  const d = burstPath(seed, spikes, inner, outer)
  const d2 = burstPath(seed + 3, spikes, inner * 0.8, outer * 0.78)
  return (
    <svg className={`vs-burst ${className}`} viewBox="0 0 100 100" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      <path d={d} className={`vs-fill-${inks[0]}`} />
      <path d={d2} className={`vs-fill-${inks[1]}`} transform="translate(3 2)" />
    </svg>
  )
}

/** Ink splatter: a blob plus satellite drops. */
export function Splat({ seed = 3, className = '', ink = 'spot' }) {
  const r = rng(seed)
  const n = 18
  const pts = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const rad = 22 + r() * 14 + (i % 3 === 0 ? r() * 16 : 0)
    pts.push([50 + Math.cos(a) * rad, 50 + Math.sin(a) * rad])
  }
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`
  for (let i = 0; i < n; i++) {
    const p = pts[(i + 1) % n], q = pts[i]
    const cx = (p[0] + q[0]) / 2 + (r() - 0.5) * 6, cy = (p[1] + q[1]) / 2 + (r() - 0.5) * 6
    d += `Q${cx.toFixed(1)},${cy.toFixed(1)} ${p[0].toFixed(1)},${p[1].toFixed(1)}`
  }
  const drops = Array.from({ length: 7 }, () => {
    const a = r() * Math.PI * 2, dist = 40 + r() * 9
    return { cx: 50 + Math.cos(a) * dist, cy: 50 + Math.sin(a) * dist, r: 1 + r() * 2.6 }
  })
  return (
    <svg className={`vs-splat ${className}`} viewBox="0 0 100 100" aria-hidden="true">
      <path d={d + 'Z'} className={`vs-fill-${ink}`} />
      {drops.map((c, i) => <circle key={i} cx={c.cx} cy={c.cy} r={c.r} className={`vs-fill-${ink}`} />)}
    </svg>
  )
}

/** Radial speed lines around a centre (for slams). */
export function SpeedLines({ seed = 11, count = 46, className = '' }) {
  const r = rng(seed)
  const lines = Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2 + r() * 0.08
    const r0 = 30 + r() * 12, r1 = 72 + r() * 30
    const w = 0.25 + r() * 0.9
    return { x0: 50 + Math.cos(a) * r0, y0: 50 + Math.sin(a) * r0, x1: 50 + Math.cos(a) * r1, y1: 50 + Math.sin(a) * r1, w }
  })
  return (
    <svg className={`vs-speed ${className}`} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {lines.map((l, i) => <line key={i} x1={l.x0} y1={l.y0} x2={l.x1} y2={l.y1} strokeWidth={l.w} />)}
    </svg>
  )
}

/** Horizontal speed streaks for cut-ins and wipes. */
export function Streaks({ seed = 5, count = 14, className = '' }) {
  const r = rng(seed)
  return (
    <svg className={`vs-streaks ${className}`} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => {
        const y = r() * 100, x = r() * 60, len = 20 + r() * 50
        return <rect key={i} x={x} y={y} width={len} height={0.4 + r() * 1.6} />
      })}
    </svg>
  )
}

/** Misregistered overprint: real text plus two offset ink ghosts. */
export function Mis({ children, className = '' }) {
  const text = typeof children === 'string' ? children : ''
  return <span className={`vs-mis ${className}`} data-text={text}>{children}</span>
}

/** Small SVG trophy, per rarity tier. */
export function TrophyIcon({ tier }) {
  if (tier === 'platinum') {
    return (
      <svg viewBox="0 0 64 80" className="vs-trophy-svg" aria-hidden="true">
        <path d="M32 4 L40 22 L60 24 L45 37 L50 58 L32 47 L14 58 L19 37 L4 24 L24 22Z" className="vs-t-body" />
        <path d="M32 14 L36 24 L47 25 L39 32 L41 44 L32 38 L23 44 L25 32 L17 25 L28 24Z" className="vs-t-shine" />
        <rect x="20" y="62" width="24" height="6" className="vs-t-body" />
        <rect x="14" y="70" width="36" height="7" className="vs-t-base" />
      </svg>
    )
  }
  if (tier === 'gold') {
    return (
      <svg viewBox="0 0 64 80" className="vs-trophy-svg" aria-hidden="true">
        <path d="M14 6 H50 V22 C50 36 42 44 32 45 C22 44 14 36 14 22Z" className="vs-t-body" />
        <path d="M14 10 H5 C5 24 10 30 17 31 M50 10 H59 C59 24 54 30 47 31" className="vs-t-handle" />
        <path d="M22 12 V24 C22 30 25 34 29 36" className="vs-t-shine-line" />
        <rect x="28" y="45" width="8" height="14" className="vs-t-body" />
        <rect x="18" y="59" width="28" height="6" className="vs-t-body" />
        <rect x="12" y="67" width="40" height="10" className="vs-t-base" />
      </svg>
    )
  }
  if (tier === 'silver') {
    return (
      <svg viewBox="0 0 64 80" className="vs-trophy-svg" aria-hidden="true">
        <path d="M22 4 L32 22 L42 4" className="vs-t-handle" />
        <circle cx="32" cy="42" r="20" className="vs-t-body" />
        <circle cx="32" cy="42" r="13" className="vs-t-base" />
        <path d="M32 33 L35 40 L42 40 L36.5 44.5 L38.5 51.5 L32 47 L25.5 51.5 L27.5 44.5 L22 40 L29 40Z" className="vs-t-shine" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 64 80" className="vs-trophy-svg" aria-hidden="true">
      <path d="M24 4 L32 20 L40 4" className="vs-t-handle" />
      <path d="M32 22 L50 32 L50 54 L32 64 L14 54 L14 32Z" className="vs-t-body" />
      <path d="M32 31 L42 37 L42 49 L32 55 L22 49 L22 37Z" className="vs-t-base" />
    </svg>
  )
}

/** Numpad direction → rotation of a right-pointing arrow. */
const ROT = { 6: 0, 3: 45, 2: 90, 1: 135, 4: 180, 7: 225, 8: 270, 9: 315 }

/** Input notation: arrows in rings, buttons as inked discs. Hover lights them in order. */
export function InputNotation({ input, label }) {
  return (
    <span className="vs-input" role="img" aria-label={label}>
      {input.map((t, i) => {
        const style = { '--vs-i': i }
        if (typeof t === 'number') {
          return (
            <svg key={i} className="vs-key vs-key-dir" viewBox="0 0 32 32" style={style} aria-hidden="true">
              <circle cx="16" cy="16" r="14" className="vs-key-ring" />
              <g transform={`rotate(${ROT[t]} 16 16)`}>
                <path d="M8 16 H22 M17 10 L23 16 L17 22" className="vs-key-arrow" />
              </g>
            </svg>
          )
        }
        if (t.startsWith('[')) {
          const d = Number(t.slice(1, -1))
          return (
            <svg key={i} className="vs-key vs-key-dir vs-key-charge" viewBox="0 0 44 32" style={style} aria-hidden="true">
              <rect x="2" y="2" width="40" height="28" rx="14" className="vs-key-ring" />
              <g transform={`rotate(${ROT[d]} 16 16)`}>
                <path d="M8 16 H22 M17 10 L23 16 L17 22" className="vs-key-arrow" />
              </g>
              <path d="M30 10 V22 M35 12 V20" className="vs-key-arrow" />
            </svg>
          )
        }
        return (
          <span key={i} className="vs-key-wrap" style={style}>
            {i > 0 && <span className="vs-key-plus" aria-hidden="true">+</span>}
            <svg className={`vs-key vs-key-btn vs-btn-${t}`} viewBox="0 0 32 32" style={style} aria-hidden="true">
              <circle cx="16" cy="16" r="14" />
              <text x="16" y="21.5" textAnchor="middle">{t}</text>
            </svg>
          </span>
        )
      })}
    </span>
  )
}


// Mint skin: the toy's hardware (speaker grille, battery, cassette tape,
// blister window) and the print parts (parts call-out, stamps).
import { packName, secs } from './mintData.js'

/* ── Speaker grille: concentric punched holes. It's the TRY ME button. ── */
const RINGS = [[0, 1], [9, 6], [18, 12], [27, 18], [36, 24]]
const HOLES = RINGS.flatMap(([r, n], ri) => Array.from({ length: n }, (_, i) => {
  const a = (Math.PI * 2 * i) / n + ri * 0.21
  return { x: 50 + r * Math.cos(a), y: 50 + r * Math.sin(a), ring: ri }
}))

export function Grille({ state = 'idle', onPress, disabled, label, className = '' }) {
  return (
    <button
      type="button"
      className={`mbv-grille ${className}`}
      data-state={state}
      onClick={onPress}
      disabled={disabled}
      aria-label={label}
    >
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <radialGradient id="mbv-plate" cx="38%" cy="32%" r="75%">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.35" stopColor="#d8d2e8" />
            <stop offset="0.8" stopColor="#7d76a0" />
            <stop offset="1" stopColor="#3a3452" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="#121014" />
        <circle cx="50" cy="50" r="45" fill="url(#mbv-plate)" />
        <circle className="mbv-grille-glow" cx="50" cy="50" r="42" />
        <g className="mbv-grille-holes">
          {HOLES.map((h, i) => <circle key={i} cx={h.x.toFixed(2)} cy={h.y.toFixed(2)} r="3.1" style={{ '--ring': h.ring }} />)}
        </g>
        <circle cx="50" cy="50" r="45" fill="none" stroke="#121014" strokeWidth="1.4" />
      </svg>
    </button>
  )
}

/* ── Battery: one cell per real second of waiting. ── */
export function Battery({ cells, total = 8, low = false }) {
  const on = Math.min(total, Math.max(0, cells))
  return (
    <span className={`mbv-bat${low ? ' is-low' : ''}`} aria-hidden="true">
      {Array.from({ length: total }, (_, i) => <i key={i} className={i < on ? 'on' : ''} />)}
      <b />
    </span>
  )
}

/* ── Cassette: Teddy Ruxpin's two tracks. VOICE = thinking, then talking;
 *    CTRL = a pulse wherever a part was fetched. Every position is a real time. ── */
export function Tape({ t0, thinkAt, textAt, end, tools = [], live = false }) {
  const span = Math.max(1, end - t0)
  const pct = (t) => `${Math.min(100, Math.max(0, ((t - t0) / span) * 100)).toFixed(2)}%`
  const think0 = thinkAt || null
  const think1 = textAt || end
  return (
    <div className={`mbv-tape${live ? ' is-live' : ''}`} aria-hidden="true">
      <span className="mbv-tape-k">VOICE</span>
      <span className="mbv-tape-lane">
        {think0 && <i className="mbv-tape-think" style={{ left: pct(think0), width: `calc(${pct(think1)} - ${pct(think0)})` }} />}
        {textAt && <i className="mbv-tape-talk" style={{ left: pct(textAt), width: `calc(100% - ${pct(textAt)})` }} />}
      </span>
      <span className="mbv-tape-k">CTRL</span>
      <span className="mbv-tape-lane mbv-tape-lane--ctrl">
        {tools.map(t => <i key={t.name} className="mbv-tape-pulse" style={{ left: pct(t.at) }} />)}
      </span>
    </div>
  )
}

/* ── Her figure in the blister: the holographic face from the project art. ── */
export function Window({ className = '' }) {
  return (
    <div className={`mbv-win ${className}`} aria-hidden="true">
      <img src="/work/veronica/hud.webp" width="1280" height="820" alt="" decoding="async" />
      <i className="mbv-win-blister" />
    </div>
  )
}

/* ── LEGO-style parts box: big while a part is being fetched, then a list. ── */
export function PartsBox({ tools, received, big = false }) {
  if (!tools.length) return null
  return (
    <div className={`mbv-parts${big ? ' is-big' : ''}`} role={big ? 'status' : undefined}>
      <span className="mbv-parts-h">{big ? 'PARTS NEEDED:' : 'PARTS USED:'}</span>
      <ul>
        {tools.map(name => {
          const got = received.includes(name)
          return (
            <li key={name} className={got ? 'is-got' : ''}>
              <b>1×</b>
              <span className="mbv-parts-n">{packName(name)}</span>
              {big && <i className="mbv-parts-strip" aria-hidden="true"><i /></i>}
              <span className="mbv-parts-s">{got ? 'IN THE BOX' : 'FETCHING…'}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/* ── Stamps for turns that didn't finish. ── */
export function Stamp({ kind, detail, onRetry }) {
  const stopped = kind === 'stopped'
  return (
    <div className={`mbv-stamp mbv-stamp--${kind}`} role="status">
      <div className="mbv-stamp-ink">
        <b>{stopped ? 'PULLED THE TAB' : 'LOW BATTERY'}</b>
        <span>{stopped ? 'You stopped her mid-sentence.' : 'Replace batteries and try again.'}</span>
      </div>
      {!stopped && detail && <p className="mbv-stamp-detail">{detail}</p>}
      {onRetry && (
        <button type="button" className="mbv-retry" onClick={onRetry}>
          {stopped ? 'ASK HER AGAIN ↻' : 'NEW BATTERIES ▸ TRY AGAIN'}
        </button>
      )}
    </div>
  )
}

/* ── The printed spec line under a finished answer. Real numbers only. ── */
export function SpecLine({ stats }) {
  if (!stats) return null
  const bits = []
  if (stats.firstWord != null) bits.push(['FIRST WORD', `${secs(stats.firstWord)} s`])
  if (stats.thought != null && stats.thought > 0) bits.push(['THOUGHT', `${secs(stats.thought)} s`])
  if (stats.talked != null) bits.push(['TALKED', `${secs(stats.talked)} s`])
  if (stats.words) bits.push(['WORDS', String(stats.words)])
  if (stats.parts) bits.push(['PARTS', String(stats.parts)])
  if (!bits.length) return null
  return (
    <dl className="mbv-spec">
      {bits.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
    </dl>
  )
}

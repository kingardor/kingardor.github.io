import { useState } from 'react'
import { WRITING, LINKS } from '../../content/index.js'
import { Talker } from './parts.jsx'

// Oldest is No. 01; the pile shows newest on top.
const ORDERED = WRITING.slice().reverse().map((w, i) => ({ ...w, no: i + 1 })).reverse()
const SPOT = { Medium: '#121014', 'Towards Data Science': '#1A5BA8', 'Better Programming': '#C8102E', 'Becoming Human': '#6B2FB3', IJARCS: '#1F7A4D' }
const M = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const run = d => { const [y, m] = d.split('-'); return `${M[+m - 1]} ${y}` }

// Line-art plates for the covers, picked by subject
const ART = {
  eye: <><path d="M10 60s22-34 50-34 50 34 50 34-22 34-50 34S10 60 10 60z" /><circle cx="60" cy="60" r="16" /><circle cx="60" cy="60" r="6" /><path d="M60 8v10M60 102v10M8 60h6M106 60h6" /></>,
  chip: <><rect x="30" y="30" width="60" height="60" rx="4" /><rect x="44" y="44" width="32" height="32" /><path d="M40 30V18M52 30V18M64 30V18M76 30V18M40 90v12M52 90v12M64 90v12M76 90v12M30 40H18M30 52H18M30 64H18M30 76H18M90 40h12M90 52h12M90 64h12M90 76h12" /></>,
  flame: <><path d="M60 104c-20 0-32-14-32-30 0-18 14-24 16-42 12 8 16 18 14 28 6-4 8-10 8-16 14 10 26 22 26 32 0 16-12 28-32 28z" /><path d="M60 104c-8 0-14-6-14-14 0-8 8-12 10-20 8 6 18 12 18 20s-6 14-14 14z" /></>,
  target: <><circle cx="60" cy="60" r="40" /><circle cx="60" cy="60" r="24" /><circle cx="60" cy="60" r="6" /><path d="M60 8v24M60 88v24M8 60h24M88 60h24" /></>,
  person: <><circle cx="60" cy="40" r="16" /><path d="M28 104c0-22 14-36 32-36s32 14 32 36" /><path d="M48 76l12 14 12-14" /></>,
  globe: <><circle cx="60" cy="60" r="42" /><ellipse cx="60" cy="60" rx="18" ry="42" /><path d="M18 60h84M24 38h72M24 82h72" /></>,
  glove: <><path d="M36 104V60l-8-18c-2-6 6-10 9-4l9 16V22c0-7 10-7 10 0v28V16c0-7 10-7 10 0v34V22c0-7 10-7 10 0v32V34c0-7 10-7 10 0v42c0 16-10 28-26 28z" /><circle cx="66" cy="78" r="6" /></>,
  stack: <><rect x="22" y="26" width="76" height="18" rx="3" /><rect x="22" y="50" width="76" height="18" rx="3" /><rect x="22" y="74" width="76" height="18" rx="3" /><path d="M32 35h4M32 59h4M32 83h4" /></>,
}
const artFor = t => (/Hermes|wildfire/i.test(t) ? 'flame' : /Shred|shooter/i.test(t) ? 'target' : /Oculus/i.test(t) ? 'glove'
  : /YOLO|vision|FPS|Skynet/i.test(t) ? 'eye' : /TLT|Deep Learning/i.test(t) ? 'chip' : /pandemic/i.test(t) ? 'globe'
    : /Data Science|Stack/i.test(t) ? 'stack' : 'person')

/** WRITING as a pile of instruction booklets. Hover or focus pulls one out. */
export default function Manuals() {
  const [act, setAct] = useState(0)
  const w = ORDERED[act]
  return (
    <section id="mb-manuals" className="mb-man" aria-labelledby="mb-man-title">
      <Talker kicker="Act VI · the writing" title={<span id="mb-man-title">Instruction manuals</span>} sub="Read before operating Akash. Eleven booklets, 2018 to 2024, printed by whoever would run them." tone="bone" />

      <div className="mb-man-row">
        <a className="mb-cover" href={w.url || undefined} target="_blank" rel="noreferrer" style={{ '--spot': SPOT[w.pub] || '#121014' }} aria-label={`${w.title}, ${w.pub}${w.url ? '. Read it' : ''}`} key={w.title}>
          <span className="mb-cover-top"><b>INSTRUCTION MANUAL</b><span>MANUAL No. {String(w.no).padStart(2, '0')}</span></span>
          <svg className="mb-cover-art" viewBox="0 0 120 120" aria-hidden="true">{ART[artFor(w.title)]}</svg>
          <span className="mb-cover-title">{w.title}</span>
          <span className="mb-cover-pub">PUBLISHED BY <b>{w.pub.toUpperCase()}</b></span>
          <span className="mb-cover-run">PRINT RUN: {run(w.date)} · {w.platform.toUpperCase()}</span>
          <span className="mb-cover-lang" aria-hidden="true">EN · EN-GB · ROBOT</span>
          {w.url ? <span className="mb-cover-cta">READ IT ↗</span> : <span className="mb-cover-cta is-off">PRINT ONLY · IN THE JOURNAL</span>}
        </a>

        <ol className="mb-pile" aria-label="All manuals">
          {ORDERED.map((m, i) => (
            <li key={m.title} style={{ '--i': i, '--spot': SPOT[m.pub] || '#121014', '--tw': `${((i * 53) % 7) - 3}px`, '--tr': `${((i * 31) % 5 - 2) * 0.35}deg` }}>
              <button type="button" className={`mb-strip${i === act ? ' is-on' : ''}`} onMouseEnter={() => setAct(i)} onFocus={() => setAct(i)} onClick={() => setAct(i)} aria-pressed={i === act}>
                <span className="mb-strip-no">No. {String(m.no).padStart(2, '0')}</span>
                <span className="mb-strip-t">{m.title}</span>
                <span className="mb-strip-pub">{m.pub} · {run(m.date)}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
      <p className="mb-man-more"><a href={LINKS.medium} target="_blank" rel="noreferrer">The full library lives on Medium ↗</a></p>
    </section>
  )
}

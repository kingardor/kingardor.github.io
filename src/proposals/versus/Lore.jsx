import { LORE } from './data.js'
import { ModeHeader } from './StoryMode.jsx'
import { useEnter } from './fx.js'

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const fmt = (d) => { const [y, m, day] = d.split('-'); return `${day} ${MONTHS[+m - 1]} ${y}` }

function Entry({ w, i }) {
  const ref = useEnter((el) => el.classList.add('is-in'), { line: 0.92 })
  const Tag = w.url ? 'a' : 'div'
  const props = w.url ? { href: w.url, target: '_blank', rel: 'noreferrer' } : {}
  return (
    <li className="vs-lore-entry" ref={ref} style={{ '--vs-i': i % 4 }}>
      <Tag className="vs-lore-link" {...props}>
        <span className="vs-lore-no" aria-hidden="true">#{String(w.n).padStart(2, '0')}</span>
        <span className="vs-lore-body">
          <span className="vs-lore-meta">LORE #{String(w.n).padStart(2, '0')} · {w.pub.toUpperCase()} · {fmt(w.date)}</span>
          <span className="vs-lore-title">{w.title}</span>
          <span className="vs-lore-cta">{w.url ? 'READ ENTRY ↗' : 'PRINT ONLY · PAPER'}</span>
        </span>
      </Tag>
    </li>
  )
}

export default function Lore() {
  return (
    <section id="vs-lore" className="vs-section vs-lore" aria-labelledby="vs-lore-h">
      <ModeHeader
        id="vs-lore-h"
        no={6}
        title="LORE CODEX"
        sub={`WRITING · ${LORE.length} ENTRIES · 2018 → 2024 · MEDIUM, TDS, BETTER PROGRAMMING, BECOMING HUMAN`}
        taunt="Every fighter has a backstory. His has citations."
        ink="yellow"
      />
      <ol className="vs-lore-list">
        {LORE.map((w, i) => <Entry key={w.title} w={w} i={i} />)}
      </ol>
    </section>
  )
}

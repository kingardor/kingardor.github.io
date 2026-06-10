import { DATA } from '../prototype/dataAdapter.js'
import { SectionHead } from './lib/effects.jsx'

/** Index-style ledger of field notes. */
export default function WritingSection() {
  return (
    <section className="ob-writing" id="writing" data-screen-label="06 Notes">
      <div className="ob-wrap">
        <SectionHead kicker="FIELD NOTES" index="005" title="Writing." />
        <div className="ob-ledger">
          {DATA.writing.map((w, i) => (
            <a
              className="ob-ledger-row reveal"
              key={w.idx}
              href={w.href || '#'}
              target={w.href ? '_blank' : undefined}
              rel={w.href ? 'noreferrer' : undefined}
              onClick={!w.href ? e => e.preventDefault() : undefined}
              style={{ transitionDelay: `${i * 30}ms` }}
            >
              <span className="ob-ledger-idx mono-ob">#{w.idx}</span>
              <span className="ob-ledger-title">{w.title}</span>
              <span className="ob-ledger-go mono-ob">{w.tag} <span aria-hidden="true">→</span></span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

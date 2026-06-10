import { DATA } from '../prototype/dataAdapter.js'
import { SectionHead } from './lib/effects.jsx'

/** Two-column ledger with mono category keys; the patent gets the ember rule. */
export default function HonoursSection() {
  return (
    <section className="ob-honours" id="honours" data-screen-label="07 Honours">
      <div className="ob-wrap">
        <SectionHead kicker="HONOURS" index="006" title="Notable." />
        <div className="ob-honours-grid">
          {DATA.honours.map((h, i) => {
            const Tag = h.href ? 'a' : 'div'
            const linkProps = h.href ? { href: h.href, target: '_blank', rel: 'noreferrer' } : {}
            const isPatent = h.k.startsWith('PATENT')
            return (
              <Tag
                className={`ob-honour reveal${isPatent ? ' ember-rule' : ''}`}
                key={i}
                style={{ transitionDelay: `${i * 32}ms` }}
                {...linkProps}
              >
                <span className="ob-honour-k mono-ob">{h.k}</span>
                <span className="ob-honour-t">{h.t}</span>
              </Tag>
            )
          })}
        </div>
      </div>
    </section>
  )
}

import { DATA } from '../prototype/dataAdapter.js'

/**
 * Vitals band: the five stats (coffee included) as hairline cells with
 * oversized display numerals. The ∞ runs hot.
 */
export default function StatsStrip() {
  return (
    <section className="ob-stats" aria-label="Stats">
      <div className="ob-wrap">
        <div className="ob-stats-grid">
          {DATA.stats.map((s, i) => {
            const isCoffee = s.label === 'COFFEE UNITS'
            return (
              <div
                className={`ob-stat reveal${isCoffee ? ' hot' : ''}`}
                key={s.label}
                style={{ transitionDelay: `${i * 40}ms` }}
              >
                <div className="ob-stat-num">{s.num}</div>
                <div className="ob-stat-label mono-ob">{s.label}</div>
                <div className="ob-stat-sub">{s.sub}</div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

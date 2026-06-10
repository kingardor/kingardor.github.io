import { DATA } from '../prototype/dataAdapter.js'
import { SectionHead } from './lib/effects.jsx'

/**
 * Four hairline columns over the monolith's shard moment (the canvas
 * fragments into four clusters behind this section — the DOM stays light).
 */
export default function SkillsSection() {
  const words = DATA.skillsSentence.split(' ')
  return (
    <section className="ob-skills" id="skills" data-screen-label="03 Stack">
      <div className="ob-wrap">
        <SectionHead kicker="ARSENAL" index="002" title="The stack, spoken aloud." ask="What's Akash's current tech stack?" />
        <p className="ob-skills-sentence reveal">
          {words.map((w, i) => {
            const clean = w.replace(/[.,]/g, '')
            const isKey = DATA.keyWords.includes(clean)
            return <span key={i} className={isKey ? 'ob-ember' : undefined}>{w} </span>
          })}
        </p>
        <div className="ob-skills-grid">
          {DATA.skillGroups.map((g, gi) => (
            <div className="ob-skill-col reveal" key={g.idx} style={{ transitionDelay: `${gi * 60}ms` }}>
              <div className="ob-skill-idx mono-ob">GRP · {g.idx}</div>
              <h3 className="ob-skill-name">{g.name}</h3>
              <ul className="ob-skill-items mono-ob">
                {g.items.map((it, i) => (
                  <li key={it} style={{ transitionDelay: `${gi * 60 + i * 40}ms` }}>{it}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

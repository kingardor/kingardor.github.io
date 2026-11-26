import { useState } from 'react'
import { SKILLS, SKILLS_SENTENCE } from '../../../content/index.js'
import { CLS, SKILL_TOKENS, DOMAINS, PROJECT_BY_SLUG, PROJECT_CLS, SIGHTING_ORDER } from '../lib/data.js'
import { scramble } from '../lib/fx.js'
import SecHead from './SecHead.jsx'

const DOMAIN_TOKENS = DOMAINS.map(d => ({ ...d, cls: 'person', projects: [], evidence: 0 }))

function Token({ t, hot, setHot, big }) {
  const flick = (e) => {
    setHot(t)
    const s = e.currentTarget.querySelector('.sj-tok-s')
    scramble(s, t.score.toFixed(2), { ms: 360, digitsOnly: true })
  }
  return (
    <button type="button"
      className={`sj-tok${big ? ' sj-tok-big' : ''}${hot === t ? ' sj-tok-hot' : ''}`}
      style={{ '--c': CLS[t.cls] || CLS.unknown }}
      onMouseEnter={flick} onFocus={flick}
      onMouseLeave={() => setHot(h => (h === t ? null : h))}
      aria-describedby="sj-evidence">
      <span className="sj-tok-tab"><span className="sj-tok-s">{t.score.toFixed(2)}</span>{t.years ? <span className="sj-tok-y"> · {t.years}y</span> : null}</span>
      <span className="sj-tok-n">{t.item || t.domain}</span>
    </button>
  )
}

export default function Classes() {
  const [hot, setHot] = useState(null)
  const groups = SKILLS.groups.map(g => ({ ...g, tokens: SKILL_TOKENS.filter(t => t.group === g.name) }))
  const left = groups.slice(0, 2), right = groups.slice(2)
  const matched = hot?.projects || []

  const group = (g) => (
    <div className="sj-tgroup" key={g.name}>
      <p className="sj-k">{g.name.toLowerCase()} · {g.tokens.length} classes</p>
      <div className="sj-tokfield">
        {g.tokens.map(t => <Token key={t.item} t={t} hot={hot} setHot={setHot} />)}
      </div>
    </div>
  )

  return (
    <section id="sj-classes" className="sj-sec sj-classes" aria-labelledby="sj-classes-h">
      <div className="sj-flank sj-flank-l">
        <SecHead n={4} act={3} cls="hardware" id="sj-classes-h" label="class list" title={['CLASS', 'LIST']}
          dek={<>Most video analytics ships with a fixed class list. <b>This one is open-vocabulary.</b></>} />
        <div className="sj-plate">
          <p className="sj-k">domains · self-reported confidence</p>
          <div className="sj-tokfield sj-domains">
            {DOMAIN_TOKENS.map(d => <Token key={d.domain} big t={d} hot={hot} setHot={setHot} />)}
          </div>
          {left.map(group)}
        </div>
      </div>
      <div className="sj-flank sj-flank-r">
        <div className="sj-plate">
          {right.map(group)}
        </div>
        <div className="sj-plate sj-evidence" id="sj-evidence" aria-live="polite">
          <p className="sj-k">{hot ? <>query · <b>{(hot.item || hot.domain).toLowerCase()}</b></> : 'hover a class · see where it was sighted'}</p>
          <ul className="sj-ev-row">
            {SIGHTING_ORDER.map(slug => {
              const on = matched.includes(slug)
              return (
                <li key={slug} className={on ? 'sj-ev-on' : ''} style={{ '--c': CLS[PROJECT_CLS[slug]] }}>
                  <span className="sj-ev-box" />{PROJECT_BY_SLUG[slug].name}
                </li>
              )
            })}
          </ul>
          <p className="sj-ev-sum">
            {hot
              ? hot.item
                ? <>Sighted in <b>{hot.projects.length}</b> project{hot.projects.length === 1 ? '' : 's'} and <b>{hot.roles}</b> career record{hot.roles === 1 ? '' : 's'}.{hot.years ? <> {hot.years} years on it.</> : null}</>
                : <>A whole domain. Self-scored at {Math.round(hot.score * 100)}. Modest, for him.</>
              : <>Scores are evidence, not vibes: 0.62 plus 0.07 for every project or role in his own records that uses the class.</>}
          </p>
        </div>
        <p className="sj-plate sj-fine sj-classes-note">{SKILLS_SENTENCE}</p>
      </div>
    </section>
  )
}

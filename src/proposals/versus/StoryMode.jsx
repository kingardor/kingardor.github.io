import { useRef } from 'react'
import { LADDER, FINAL, BONUS, BLUE_STACK, P1_RECORD } from './data.js'
import { announceIf, useEnter, reduced, shake } from './fx.js'
import { Burst, Mis, SpeedLines } from './Art.jsx'

export function ModeHeader({ id, no, title, sub, taunt, side = 'left', ink = 'spot', compact = false }) {
  const ref = useEnter((el) => el.classList.add('is-in'), { line: 0.85 })
  return (
    <header className={`vs-mode vs-mode-${side} vs-ink-${ink}${compact ? ' vs-mode-compact' : ''}`} ref={ref}>
      <span className="vs-mode-no">MODE {String(no).padStart(2, '0')} / 08</span>
      <h2 className="vs-mode-title" id={id}><Mis>{title}</Mis></h2>
      {sub && <p className="vs-mode-sub">{sub}</p>}
      {taunt && <p className="vs-mode-taunt">{taunt}</p>}
    </header>
  )
}

function span(c) {
  const end = c.endYear ?? new Date().getFullYear()
  return Math.max(1, end - c.startYear + (c.endYear ? 0 : 1))
}

const years = (c) => (c.endYear === c.startYear ? `${c.startYear}` : `${c.startYear} → ${c.endYear ?? 'NOW'}`)

// Stages count from the bottom of the ladder; the boss (the current job) is the top one.
const STAGES = LADDER.filter(r => !r.assist).length + 1

/** A cleared stage: one role, newest first down the page. */
function StageCard({ r, n, side }) {
  const c = r.c
  const ref = useEnter((el) => {
    el.classList.add('is-in')
    announceIf(el, { kind: 'round', big: `STAGE ${n}`, small: `CLEARED · ${r.word}` })
  }, { line: 0.62 })
  const combo = c.wins.length
  return (
    <article className={`vs-round vs-round-${side}`} ref={ref} aria-labelledby={`vs-s${n}`}>
      <span className="vs-round-ghost" aria-hidden="true">{n}</span>
      <div className="vs-round-plate">
        <p className="vs-round-kicker">
          <span className="vs-round-no">STAGE {n}</span>
          <span>{years(c)}</span>
          <span className="vs-round-clear">CLEARED</span>
          <span className="vs-round-word" aria-hidden="true">{r.word}</span>
        </p>
        <h3 className="vs-round-org" id={`vs-s${n}`}>
          <span className="vs-sr">Stage {n}, {c.period}: </span>{r.org}
        </h3>
        <p className="vs-round-role">{c.role} <span>· {c.period} · {c.location}</span></p>
        <div className="vs-round-bar" aria-hidden="true">
          <span style={{ '--vs-w': Math.min(1, span(c) / 4) }} />
          <em>{span(c)} {span(c) === 1 ? 'YEAR' : 'YEARS'} ON THE CLOCK</em>
        </div>
        <p className="vs-round-blurb">{c.blurb}</p>
        {combo > 0 && (
          <div className="vs-round-combo">
            <span className="vs-round-combo-n">{combo} HIT{combo > 1 ? 'S' : ''}</span>
            <ul>
              {c.wins.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </div>
        )}
        <p className="vs-round-tags">{c.tags.join(' / ')}</p>
      </div>
    </article>
  )
}

/** The bottom of the ladder: the oldest roles, combined into one stage. */
function OriginCard({ r, side }) {
  const stampRef = useRef(null)
  const roles = r.origin
  const first = Math.min(...roles.map(o => o.c.startYear))
  const last = Math.max(...roles.map(o => o.c.endYear ?? o.c.startYear))
  const ref = useEnter((el) => {
    el.classList.add('is-in')
    announceIf(el, { kind: 'round', big: 'STAGE 1', small: `CLEARED · ${r.word}` })
    setTimeout(() => {
      announceIf(el, { kind: 'finisher', big: r.finisher.big, small: r.finisher.small }, 0)
      stampRef.current?.classList.add('is-in')
      shake(el, 8, 320, 160)
    }, reduced() ? 0 : 1500)
  }, { line: 0.62 })
  const tags = [...new Set(roles.flatMap(o => o.c.tags))]
  return (
    <article className={`vs-round vs-origin vs-round-${side} has-finisher`} ref={ref} aria-labelledby="vs-origin-h">
      <span className="vs-round-ghost" aria-hidden="true">1</span>
      <div className="vs-round-plate">
        <p className="vs-round-kicker">
          <span className="vs-round-no">STAGE 1</span>
          <span>{first} → {last}</span>
          <span className="vs-round-clear">CLEARED</span>
        </p>
        <h3 className="vs-round-org" id="vs-origin-h">
          <span className="vs-sr">Stage 1, {first} to {last}: </span>{r.word}
        </h3>
        <p className="vs-round-role">{roles.length} roles, one acquisition <span>· Bengaluru</span></p>
        <ol className="vs-origin-list">
          {roles.map(({ c, org }) => (
            <li key={c.role + c.startYear}>
              <p className="vs-origin-when">{years(c)}</p>
              <p className="vs-origin-who"><b>{org}</b> · {c.role}</p>
              <p className="vs-origin-what">{c.blurb}</p>
            </li>
          ))}
        </ol>
        <p className="vs-round-tags">{tags.join(' / ')}</p>
      </div>
      <div className="vs-finisher" ref={stampRef}>
        <Burst className="vs-finisher-burst" seed={9} spikes={20} inks={['hi', 'spot']} />
        <span className="vs-finisher-big">ACQUIRED!</span>
        <span className="vs-finisher-small">{r.finisher.small}</span>
      </div>
    </article>
  )
}

function AssistCard({ r, side }) {
  const c = r.assist
  const ref = useEnter((el) => el.classList.add('is-in'), { line: 0.8 })
  return (
    <aside className={`vs-assist vs-assist-${side}`} ref={ref} aria-label={`Assist: ${c.role}`}>
      <span className="vs-assist-tag">{r.label} · {c.period}</span>
      <p className="vs-assist-org">{r.org}</p>
      <p className="vs-assist-role">{c.role}</p>
      <p className="vs-assist-blurb">{c.blurb}</p>
      {c.wins.length > 0 && (
        <ul className="vs-assist-wins">{c.wins.map((w, i) => <li key={i}>{w}</li>)}</ul>
      )}
    </aside>
  )
}

/** The top of the ladder: where he works now, then the side quest. */
function BossStage() {
  const ref = useEnter((el) => {
    el.classList.add('is-in')
    announceIf(el, { kind: 'final', big: 'BOSS STAGE', small: 'NOW PLAYING · BLUE' })
  }, { line: 0.55 })
  const bonusRef = useEnter((el) => {
    el.classList.add('is-in')
    announceIf(el, { kind: 'round', big: 'BONUS STAGE', small: 'IT TAKES REAL MONEY' })
  }, { line: 0.6 })
  return (
    <div className="vs-final">
      <div className="vs-final-head" ref={ref}>
        <SpeedLines className="vs-final-speed" seed={31} />
        <p className="vs-final-kicker">STAGE {STAGES} · {FINAL.startYear} → NOW · {FINAL.location.toUpperCase()}</p>
        <h3 className="vs-final-title" id="vs-final-h"><Mis>BOSS STAGE</Mis></h3>
        <p className="vs-final-vs"><span>{FINAL.role} · {FINAL.org}</span> <b>vs</b> <span>every camera that forgets</span></p>
        <p className="vs-final-blurb">{FINAL.blurb}</p>
      </div>

      <div className="vs-ults">
        <p className="vs-ults-label"><span>ULTIMATE MOVES</span> <span>6 / 6 UNLOCKED · BLUE STACK</span></p>
        <ol className="vs-ults-list">
          {BLUE_STACK.map((b, i) => <Ultimate key={b.name} b={b} i={i} />)}
        </ol>
        <a className="vs-btn vs-btn-hi vs-ults-cta" href={FINAL.orgUrl} target="_blank" rel="noreferrer">
          ENTER THE BOSS STAGE · MYBLUE.AI
        </a>
      </div>

      <aside className="vs-bonus" ref={bonusRef} aria-label="Bonus stage: CopCars.in">
        <span className="vs-bonus-tag">BONUS STAGE · {BONUS.startYear} → NOW</span>
        <p className="vs-bonus-org">{BONUS.org}</p>
        <p className="vs-bonus-role">{BONUS.role} · {BONUS.period}</p>
        <p className="vs-bonus-blurb">{BONUS.blurb}</p>
        <p className="vs-bonus-wins">{BONUS.wins[0]}</p>
        <a className="vs-btn vs-btn-spot" href={BONUS.orgUrl} target="_blank" rel="noreferrer">SHOP THE LOOT · COPCARS.IN</a>
      </aside>
    </div>
  )
}

/** The career as an arcade ladder: the boss (now) at the top, then every
 *  stage he cleared, newest first, down to the origin. */
export function StoryMode() {
  let n = STAGES
  return (
    <section id="vs-story" className="vs-section vs-story" aria-labelledby="vs-story-h">
      <ModeHeader
        id="vs-story-h"
        no={2}
        title="ARCADE LADDER"
        sub="CAREER · NOW → 2017 · THE BOSS SITS AT THE TOP"
        taunt="Eight-plus years. Zero continues used."
      />
      <dl className="vs-record" aria-label="Player 1 record">
        {P1_RECORD.map(r => (
          <div key={r.label}><dt>{r.label}</dt><dd>{r.num}</dd><span>{r.sub}</span></div>
        ))}
      </dl>
      <BossStage />
      <p className="vs-ladder-label"><span>CLEARED STAGES · NEWEST FIRST</span> <span>STAGE {STAGES - 1} → STAGE 1</span></p>
      <div className="vs-story-track">
        {LADDER.map((r, i) => {
          const s = i % 2 ? 'left' : 'right' // every card swaps sides, assists included
          if (r.assist) return <AssistCard key={r.assist.role} r={r} side={s} />
          if (r.origin) return <OriginCard key="origin" r={r} side={s} />
          n -= 1
          return <StageCard key={r.c.role + r.c.startYear} r={r} n={n} side={s} />
        })}
      </div>
    </section>
  )
}

function Ultimate({ b, i }) {
  const ref = useEnter((el) => el.classList.add('is-in'), { line: 0.88 })
  return (
    <li className="vs-ult" ref={ref} style={{ '--vs-i': i }}>
      <span className="vs-ult-no" aria-hidden="true">U{i + 1}</span>
      <div className="vs-ult-body">
        <h3 className="vs-ult-name">{b.name}</h3>
        <p className="vs-ult-kind">{b.kind}</p>
        <p className="vs-ult-line">{b.line}</p>
        {b.facts.length > 0 && (
          <ul className="vs-ult-facts">
            {b.facts.map((f, k) => <li key={k}>{f}</li>)}
          </ul>
        )}
      </div>
    </li>
  )
}

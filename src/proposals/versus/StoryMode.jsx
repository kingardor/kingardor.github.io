import { useRef } from 'react'
import { ROUNDS, FINAL, BONUS, BLUE_STACK, P1_RECORD } from './data.js'
import { announceIf, useEnter, reduced, shake } from './fx.js'
import { Burst, Mis, SpeedLines } from './Art.jsx'

export function ModeHeader({ id, no, title, sub, taunt, side = 'left', ink = 'pink', compact = false }) {
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

function RoundCard({ r, n, side }) {
  const c = r.c
  const stampRef = useRef(null)
  const ref = useEnter((el) => {
    el.classList.add('is-in')
    announceIf(el, { kind: 'round', big: `ROUND ${n}`, small: r.word })
    if (r.finisher) {
      setTimeout(() => {
        announceIf(el, { kind: 'finisher', big: r.finisher.big, small: r.finisher.small }, 0)
        stampRef.current?.classList.add('is-in')
        shake(el, 8, 320, 160)
      }, reduced() ? 0 : 1500)
    }
  }, { line: 0.62 })
  const combo = c.wins.length
  return (
    <article className={`vs-round vs-round-${side}${r.finisher ? ' has-finisher' : ''}`} ref={ref} aria-labelledby={`vs-r${n}`}>
      <span className="vs-round-ghost" aria-hidden="true">{n}</span>
      <div className="vs-round-plate">
        <p className="vs-round-kicker">
          <span className="vs-round-no">ROUND {n}</span>
          <span>{c.startYear}</span>
          <span className="vs-round-word" aria-hidden="true">{r.word}</span>
        </p>
        <h3 className="vs-round-org" id={`vs-r${n}`}>
          <span className="vs-sr">Round {n}, {c.startYear}: </span>{r.org}
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
      {r.finisher && (
        <div className="vs-finisher" ref={stampRef}>
          <Burst className="vs-finisher-burst" seed={9} spikes={20} inks={['yellow', 'pink']} />
          <span className="vs-finisher-big">ACQUIRED!</span>
          <span className="vs-finisher-small">{r.finisher.small}</span>
        </div>
      )}
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

export function StoryMode() {
  let n = 0
  let side = 0
  return (
    <section id="vs-story" className="vs-section vs-story" aria-labelledby="vs-story-h">
      <ModeHeader
        id="vs-story-h"
        no={2}
        title="STORY MODE"
        sub="CAREER · 2017 → FINAL ROUND · EVERY ROUND WON ON SITE"
        taunt="Eight-plus years. Zero continues used."
      />
      <dl className="vs-record" aria-label="Player 1 record">
        {P1_RECORD.map(r => (
          <div key={r.label}><dt>{r.label}</dt><dd>{r.num}</dd><span>{r.sub}</span></div>
        ))}
      </dl>
      <div className="vs-story-track">
        {ROUNDS.map((r) => {
          if (r.assist) return <AssistCard key={r.assist.role} r={r} side={side % 2 ? 'left' : 'right'} />
          n += 1
          side += 1
          return <RoundCard key={r.c.role + r.c.startYear} r={r} n={n} side={side % 2 ? 'left' : 'right'} />
        })}
      </div>
    </section>
  )
}

export function FinalRound() {
  const ref = useEnter((el) => {
    el.classList.add('is-in')
    announceIf(el, { kind: 'final', big: 'FINAL ROUND', small: 'BOSS STAGE: BLUE' })
  }, { line: 0.55 })
  const bonusRef = useEnter((el) => {
    el.classList.add('is-in')
    announceIf(el, { kind: 'round', big: 'BONUS STAGE', small: 'IT TAKES REAL MONEY' })
  }, { line: 0.6 })
  return (
    <section id="vs-final" className="vs-section vs-final" aria-labelledby="vs-final-h">
      <div className="vs-final-head" ref={ref}>
        <SpeedLines className="vs-final-speed" seed={31} />
        <p className="vs-final-kicker">ROUND 7 · {FINAL.startYear} → NOW · {FINAL.location.toUpperCase()}</p>
        <h2 className="vs-final-title" id="vs-final-h"><Mis>FINAL ROUND</Mis></h2>
        <p className="vs-final-vs"><span>{FINAL.role}</span> <b>vs</b> <span>every camera that forgets</span></p>
        <p className="vs-final-blurb">{FINAL.blurb}</p>
      </div>

      <div className="vs-ults">
        <p className="vs-ults-label"><span>ULTIMATE MOVES</span> <span>6 / 6 UNLOCKED · BLUE STACK</span></p>
        <ol className="vs-ults-list">
          {BLUE_STACK.map((b, i) => <Ultimate key={b.name} b={b} i={i} />)}
        </ol>
        <a className="vs-btn vs-btn-yellow vs-ults-cta" href={FINAL.orgUrl} target="_blank" rel="noreferrer">
          ENTER THE BOSS STAGE · MYBLUE.AI
        </a>
      </div>

      <aside className="vs-bonus" ref={bonusRef} aria-label="Bonus stage: CopCars.in">
        <span className="vs-bonus-tag">BONUS STAGE · {BONUS.startYear}</span>
        <p className="vs-bonus-org">{BONUS.org}</p>
        <p className="vs-bonus-role">{BONUS.role} · {BONUS.period}</p>
        <p className="vs-bonus-blurb">{BONUS.blurb}</p>
        <p className="vs-bonus-wins">{BONUS.wins[0]}</p>
        <a className="vs-btn vs-btn-pink" href={BONUS.orgUrl} target="_blank" rel="noreferrer">SHOP THE LOOT · COPCARS.IN</a>
      </aside>
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

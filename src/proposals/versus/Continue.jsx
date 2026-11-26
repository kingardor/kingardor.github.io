import { useEffect, useRef, useState } from 'react'
import { EMAIL, LINKS, PROFILE } from '../../content/index.js'
import { useInView, reduced, flash, shake } from './fx.js'
import { Burst, Mis } from './Art.jsx'

const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

function Initials({ value, onChange }) {
  const refs = useRef([])
  const set = (i, ch) => {
    const next = [...value]
    next[i] = ch
    onChange(next)
  }
  const cycle = (i, d) => {
    const cur = value[i] ? ABC.indexOf(value[i]) : (d > 0 ? -1 : 0)
    set(i, ABC[(cur + d + 26) % 26])
  }
  return (
    <fieldset className="vs-initials">
      <legend>PLAYER 2: ENTER YOUR NAME</legend>
      <div className="vs-initials-slots">
        {[0, 1, 2].map(i => (
          <div className="vs-slot" key={i}>
            <button type="button" className="vs-slot-arrow" onClick={() => cycle(i, -1)} aria-label={`Letter ${i + 1}: previous`}>
              <svg viewBox="0 0 20 12" aria-hidden="true"><path d="M2 10 L10 2 L18 10" /></svg>
            </button>
            <input
              ref={el => { refs.current[i] = el }}
              className="vs-slot-input"
              value={value[i] ?? ''}
              placeholder="–"
              maxLength={1}
              inputMode="text"
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck="false"
              aria-label={`Initial ${i + 1} of 3`}
              onChange={(e) => {
                const ch = e.target.value.slice(-1).toUpperCase()
                if (ch && !ABC.includes(ch)) return
                set(i, ch)
                if (ch && i < 2) refs.current[i + 1]?.focus()
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowUp') { e.preventDefault(); cycle(i, -1) }
                if (e.key === 'ArrowDown') { e.preventDefault(); cycle(i, 1) }
                if (e.key === 'Backspace' && !value[i] && i > 0) refs.current[i - 1]?.focus()
                if (e.key === 'ArrowRight' && i < 2) refs.current[i + 1]?.focus()
                if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus()
              }}
            />
            <button type="button" className="vs-slot-arrow is-down" onClick={() => cycle(i, 1)} aria-label={`Letter ${i + 1}: next`}>
              <svg viewBox="0 0 20 12" aria-hidden="true"><path d="M2 2 L10 10 L18 2" /></svg>
            </button>
          </div>
        ))}
      </div>
    </fieldset>
  )
}

export default function Continue() {
  const [ref, inView] = useInView('-15% 0px -15% 0px')
  const [count, setCount] = useState(() => (reduced() ? 0 : 9))
  const [initials, setInitials] = useState(['', '', ''])
  const overRef = useRef(null)
  const over = count === 0

  // Ticks only while the screen is in view; never resets.
  useEffect(() => {
    if (!inView || count === 0) return
    const t = setTimeout(() => setCount(c => Math.max(0, c - 1)), 1000)
    return () => clearTimeout(t)
  }, [inView, count])

  useEffect(() => {
    if (!over || reduced()) return
    flash(0.8, '#FF48B0')
    shake(overRef.current, 10, 380, 120)
  }, [over])

  const name = initials.join('').trim()
  const subject = name.length ? `Challenger ${name} has entered: let’s talk` : 'A challenger has entered: let’s talk'
  const mailto = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}`

  return (
    <section id="vs-continue" className="vs-section vs-continue" aria-labelledby="vs-continue-h" ref={ref}>
      <div className="vs-cont-count">
        <h2 className="vs-cont-q" id="vs-continue-h"><Mis>CONTINUE?</Mis></h2>
        {!over ? (
          <div className="vs-cont-num-wrap" aria-hidden="true">
            <span className="vs-cont-num vs-mis" key={count} data-text={count}>{count}</span>
          </div>
        ) : (
          <div className="vs-cont-over" ref={overRef}>
            <Burst className="vs-cont-burst" seed={13} spikes={18} inks={['pink', 'yellow']} />
            <p className="vs-cont-over-a">GAME OVER?</p>
            <p className="vs-cont-over-b">NEVER.</p>
          </div>
        )}
        <p className="vs-cont-status">{PROFILE.status.toUpperCase()} · {PROFILE.location.toUpperCase()} · {PROFILE.tz}</p>
      </div>

      <div className="vs-cont-panel">
        <p className="vs-cont-kicker">CONTACT · INSERT COIN TO CONTINUE</p>
        <Initials value={initials} onChange={setInitials} />
        <div className="vs-cont-btns">
          <a className="vs-btn vs-btn-big vs-btn-yellow" href={mailto}>
            <span>CHALLENGE HIM</span>
            <small>{name ? `AS ${name} · ` : ''}{EMAIL}</small>
          </a>
          <a className="vs-btn vs-btn-big vs-btn-pink" href="#/chat">
            <span>TALK TO THE BOSS</span>
            <small>VERONICA, HIS AI, ANSWERS FOR HIM</small>
          </a>
        </div>
        <ul className="vs-cont-socials">
          <li><a href={LINKS.linkedin} target="_blank" rel="noreferrer">LINKEDIN <small>{PROFILE.followers.linkedin} FOLLOWERS</small></a></li>
          <li><a href={LINKS.github} target="_blank" rel="noreferrer">GITHUB <small>@KINGARDOR</small></a></li>
          <li><a href={LINKS.youtube} target="_blank" rel="noreferrer">YOUTUBE <small>THE TAPES</small></a></li>
        </ul>
        <p className="vs-cont-foot">© {new Date().getFullYear()} AKASH JAMES · NO FRANCHISES WERE HARMED · ALL MOVES REAL</p>
      </div>
    </section>
  )
}

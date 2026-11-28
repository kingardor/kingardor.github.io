import { useEffect, useRef, useState } from 'react'
import { EMAIL, LINKS, PROFILE } from '../../content/index.js'
import { useInView, reduced, flash, shake, spot, HI } from './fx.js'
import { Burst, Mis } from './Art.jsx'

// What the visitor is bringing; sets the mail's subject line.
const MODES = [
  { key: 'project', label: 'A project', subject: 'A project' },
  { key: 'stage', label: 'A stage', subject: 'A talk or a stage' },
  { key: 'role', label: 'A role', subject: 'A role' },
  { key: 'talk', label: 'Just talk', subject: 'Just talking' },
]

/** Contact: a plain form, sent as a pre-filled mail (no backend, no tracking). */
function ChallengeForm() {
  const [mode, setMode] = useState('project')
  const [name, setName] = useState('')
  const [reach, setReach] = useState('')
  const [msg, setMsg] = useState('')
  const [sent, setSent] = useState(false)
  const [copied, setCopied] = useState(false)

  const send = (e) => {
    e.preventDefault()
    const m = MODES.find(x => x.key === mode)
    const who = name.trim() || 'Someone'
    const subject = `${m.subject}, from ${who} (via akashjames.com)`
    const lines = [msg.trim(), '', `— ${who}`]
    if (reach.trim()) lines.push(`Reach me: ${reach.trim()}`)
    const body = lines.join('\n')
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setSent(true)
    if (!reduced()) flash(0.5, HI)
  }
  const copy = async () => {
    try { await navigator.clipboard.writeText(EMAIL); setCopied(true) } catch { /* the address is on screen anyway */ }
  }

  return (
    <form className="vs-ch" onSubmit={send}>
      <h3 className="vs-ch-h"><Mis>CHALLENGE HIM</Mis></h3>
      <p className="vs-ch-sub">…or just talk. Tell him who you are and what you’ve got.</p>

      <fieldset className="vs-ch-modes">
        <legend>WHAT’S IT ABOUT?</legend>
        {MODES.map(m => (
          <label key={m.key} className={`vs-ch-mode${mode === m.key ? ' is-on' : ''}`}>
            <input type="radio" name="vs-ch-mode" value={m.key} checked={mode === m.key} onChange={() => setMode(m.key)} />
            <span>{m.label}</span>
          </label>
        ))}
      </fieldset>

      <div className="vs-ch-row">
        <label className="vs-ch-field">
          <span>YOUR NAME</span>
          <input value={name} onChange={e => setName(e.target.value)} autoComplete="name" placeholder="Ada Lovelace" />
        </label>
        <label className="vs-ch-field">
          <span>HOW TO REACH YOU</span>
          <input value={reach} onChange={e => setReach(e.target.value)} autoComplete="email" inputMode="email" placeholder="Email, phone or LinkedIn" />
        </label>
      </div>
      <label className="vs-ch-field">
        <span>THE DETAILS</span>
        <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={4} required
          placeholder={mode === 'talk' ? 'Say hi. Ask anything. He reads all of it.' : 'What you’re building, when, and where he fits in.'} />
      </label>

      <button type="submit" className="vs-btn vs-btn-big vs-btn-hi vs-ch-send">
        <span>SEND CHALLENGE ▸</span>
        <small>OPENS YOUR MAIL APP, ADDRESSED TO HIM</small>
      </button>
      <p className="vs-ch-after" aria-live="polite">
        {sent ? (
          <>Mail app didn’t open? Write to <a href={`mailto:${EMAIL}`}>{EMAIL}</a>{' '}
            <button type="button" className="vs-ch-copy" onClick={copy}>{copied ? 'COPIED' : 'COPY'}</button></>
        ) : <>Straight to <span>{EMAIL}</span>. Nothing is stored here.</>}
      </p>
    </form>
  )
}

export default function Continue() {
  const [ref, inView] = useInView('-15% 0px -15% 0px')
  const [count, setCount] = useState(() => (reduced() ? 0 : 9))
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
    flash(0.8, spot(overRef.current))
    shake(overRef.current, 10, 380, 120)
  }, [over])

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
            <Burst className="vs-cont-burst" seed={13} spikes={18} inks={['spot', 'hi']} />
            <p className="vs-cont-over-a">GAME OVER?</p>
            <p className="vs-cont-over-b">NEVER.</p>
          </div>
        )}
        <p className="vs-cont-status">{PROFILE.status.toUpperCase()} · {PROFILE.location.toUpperCase()} · {PROFILE.tz}</p>
      </div>

      <div className="vs-cont-panel">
        <p className="vs-cont-kicker">CONTACT</p>
        <ChallengeForm />
        <a className="vs-btn vs-btn-spot vs-ch-talk" href="#/chat">
          <span>OR TALK TO VERONICA ▸</span>
          <small>HIS AI ANSWERS RIGHT NOW</small>
        </a>
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

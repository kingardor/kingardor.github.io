import { useState } from 'react'
import { EMAIL, LINKS, PROFILE } from '../../content/index.js'
import { Talker, Barcode } from './parts.jsx'

/** Contact as a shipping label: fill in the sender, it ships as a mailto. */
export default function ShipLabel() {
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')
  const send = (e) => {
    e.preventDefault()
    const subject = `Parcel from ${name || 'a collector'} (via akashjames.com)`
    const body = `${msg}\n\n— ${name || 'A collector'}`
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }
  return (
    <section id="mb-ship" className="mb-ship" aria-labelledby="mb-ship-title">
      <div className="mb-ship-side">
        <Talker kicker="Act VIII · contact" title={<span id="mb-ship-title">Ship it to me</span>} sub="One of one. Not for sale. Available for the right project, the right stage, or the right argument about edge inference." tone="ember" />
      </div>

      <div className="mb-parcel">
        <span className="mb-tape mb-tape--a" aria-hidden="true">FRAGILE · CONTAINS IDEAS · FRAGILE · CONTAINS IDEAS · </span>
        <span className="mb-tape mb-tape--b" aria-hidden="true">THIS WAY UP ▲ THIS WAY UP ▲ THIS WAY UP ▲ </span>

        <form className="mb-label" onSubmit={send}>
          <div className="mb-label-top">
            <div className="mb-label-svc"><b>P1</b><span>PRIORITY<br />OVERNIGHT-ISH</span></div>
            <div className="mb-label-route"><span>ROUTE</span><b>BLR</b><span>KA · IN</span></div>
          </div>

          <div className="mb-label-to">
            <span className="mb-label-k">SHIP TO:</span>
            <b>AKASH JAMES</b>
            <span>BENGALURU · KA · IN</span>
            <span className="mb-label-mail">{EMAIL}</span>
          </div>

          <div className="mb-label-from">
            <span className="mb-label-k">FROM:</span>
            <label className="mb-field">
              <span>Name</span>
              <input value={name} onChange={e => setName(e.target.value)} autoComplete="name" placeholder="Your name, collector" />
            </label>
            <label className="mb-field">
              <span>Contents</span>
              <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={4} placeholder="What should be in the parcel? A project, a stage, a robot that needs an attitude." required />
            </label>
          </div>

          <div className="mb-label-bar">
            <Barcode seed="ship-to-akash" className="mb-label-barcode" />
            <span className="mb-label-trk">TRK 1Z-AJ-2026-0001 · {PROFILE.tz}</span>
          </div>

          <div className="mb-label-act">
            <button type="submit" className="mb-btn mb-btn--ink">SHIP IT ▸</button>
            <span className="mb-label-note">Opens your mail app, pre-addressed.</span>
          </div>

          <ul className="mb-label-links" aria-label="Elsewhere">
            <li><a href={LINKS.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></li>
            <li><a href={LINKS.github} target="_blank" rel="noreferrer">GitHub</a></li>
            <li><a href={LINKS.youtube} target="_blank" rel="noreferrer">YouTube</a></li>
            <li><a href={LINKS.medium} target="_blank" rel="noreferrer">Medium</a></li>
            <li><a href="#/chat" className="mb-label-ask">Ask Veronica ▸</a></li>
          </ul>
        </form>

        <div className="mb-stamp" aria-hidden="true"><b>PRIORITY</b><span>HANDLE LIKE A PROTOTYPE</span></div>
        <div className="mb-price" aria-label="Price: priceless, make an offer"><span>PRICELESS</span><b>MAKE AN OFFER</b></div>
      </div>

      <footer className="mb-colophon">
        <span>AKASH JAMES · AI ARCHITECT ACTION FIGURE · 1:1 SCALE · SERIES 2026 · No. 001/001</span>
        <span>© 2026 Akash James. Batteries not included. <a href="#/">Back to the regular site</a></span>
      </footer>
    </section>
  )
}

import { useState } from 'react'
import { BLUE_STACK, LINKS } from '../../content/index.js'
import { Talker, Burst, Barcode, PrintMarks } from './parts.jsx'

const MONO = ['HM', 'BA', 'HX', 'CP', 'ME', 'IO']

/** BLUE as a platinum box set: six figures in a moulded tray. */
export default function BlueSet() {
  const [sel, setSel] = useState(0)
  const item = BLUE_STACK[sel]
  return (
    <section id="mb-blue" className="mb-blue" aria-labelledby="mb-blue-title">
      <Talker kicker="Act I, continued · the day job" title={<span id="mb-blue-title">BLUE · Platinum Edition</span>} sub="Director AI - BLUE. The world’s first semantic video data lake for the CCTV you already own. Six figures, one tray, no repos (it’s the day job)." tone="navy" />

      <div className="mb-set">
        <div className="mb-set-lid">
          <div className="mb-set-brand">
            <span className="mb-set-foil">BLUE</span>
            <span className="mb-set-ed">PLATINUM<br />EDITION</span>
          </div>
          <p className="mb-set-claim">Cameras record everything and remember nothing. <b>This set fixes that.</b></p>
          <Burst className="mb-set-burst" fill="#E9ECF2" ink="#0B1E4D" points={20}>
            <b>6</b><small>FIGURES<br />INCLUDED</small>
          </Burst>
        </div>

        <div className="mb-set-body">
          <ul className="mb-set-tray" role="tablist" aria-label="BLUE products">
            {BLUE_STACK.map((b, i) => (
              <li key={b.name} role="presentation">
                <button
                  type="button" role="tab" aria-selected={sel === i} aria-controls="mb-set-card"
                  className={`mb-cell${sel === i ? ' is-sel' : ''}`}
                  onClick={() => setSel(i)}
                >
                  <span className="mb-cell-no">FIG. {String(i + 1).padStart(2, '0')}</span>
                  <span className="mb-cell-coin" aria-hidden="true"><b>{MONO[i]}</b></span>
                  <span className="mb-cell-name">{b.name}</span>
                  <span className="mb-cell-kind">{b.kind}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="mb-set-card" id="mb-set-card" role="tabpanel" aria-live="polite">
            <div className="mb-set-card-top">
              <span>FIG. {String(sel + 1).padStart(2, '0')} / 06</span><span>{item.kind.toUpperCase()}</span>
            </div>
            <h3 className="mb-set-card-name">{item.name}</h3>
            <p className="mb-set-card-line">{item.line}</p>
            {item.facts.length > 0 ? (
              <ul className="mb-set-card-facts">
                {item.facts.map(f => <li key={f}>{f}</li>)}
              </ul>
            ) : (
              <p className="mb-set-card-none">No further specs declassified. Ask in person, or ask Veronica.</p>
            )}
          </div>
        </div>

        <div className="mb-set-foot">
          <PrintMarks className="mb-set-marks" />
          <p className="mb-fine">Professional work: no source code included. Product of BLUE, Bengaluru. Runs from RTX Pro 6000 down to NVIDIA Jetson Thor. Do not attempt to remember all your footage manually.</p>
          <a className="mb-set-link" href={LINKS.blue} target="_blank" rel="noreferrer">myblue.ai ↗</a>
          <Barcode seed="blue-platinum" className="mb-set-bar" ink="#0B1E4D" />
        </div>
      </div>
    </section>
  )
}

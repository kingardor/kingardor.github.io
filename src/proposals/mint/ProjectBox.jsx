import { PROJECTS } from '../../content/index.js'
import { PACK, burstFact, featureBullets, batchCode, packVars } from './data.js'
import { Barcode, Burst, PrintMarks, AgeBadge, Chrome } from './parts.jsx'

/** Front of a boxed collectible. Sized entirely in cqw, so it scales from peg to hand. */
export function BoxFront({ p, index, eager = false, tear = null }) {
  const k = PACK[p.slug]
  const f = burstFact(p)
  const cover = p.images[0]
  const long = f.v.length > 7
  return (
    <div className={`mb-pbox mb-pbox--${p.slug}`} style={packVars(p)}>
      <div className="mb-pbox-face">
        <div className="mb-pbox-art" aria-hidden="true" />
        <span className="mb-pbox-spine" aria-hidden="true">AKASH JAMES · SERIES 2026 · {p.name.toUpperCase()} · NO CLOUD REQUIRED</span>
        <div className="mb-pbox-tab">
          <span>AJ COLLECTIBLES</span>
          <span>No. {String(index + 1).padStart(2, '0')}/08</span>
        </div>
        {tear}
        <div className="mb-pbox-kicker">
          <span>{p.kicker}</span><span>{p.year}</span>
        </div>
        <div className="mb-pbox-win">
          <img src={cover.src} width={cover.w} height={cover.h} alt="" loading={eager ? 'eager' : 'lazy'} decoding="async" />
          <i className="mb-pbox-blister" aria-hidden="true" />
        </div>
        <Chrome as="h3" text={p.name} tone={k.chrome} className={`mb-pbox-logo${p.name.length > 11 ? ' is-long' : ''}`} />
        <p className="mb-pbox-pitch">{p.pitch}</p>
        <Burst className={`mb-pbox-burst${long ? ' is-long' : ''}`} fill={k.card === '#121212' ? '#FFD400' : '#fff'} ink="#111" points={14}>
          <b>{f.v}</b><small>{f.k}</small>
        </Burst>
        <div className="mb-pbox-foot">
          <AgeBadge className="mb-pbox-age" />
          <div className="mb-pbox-batch">
            <span>BATCH {batchCode(p.slug)}</span>
            <span>{p.private ? 'SOURCE: CLASSIFIED' : `LICENCE: ${p.license || 'SEE REPO'}`}</span>
          </div>
          <Barcode seed={p.slug} className="mb-pbox-bar" />
        </div>
        <p className="mb-pbox-warn">{k.warn}</p>
        <PrintMarks vertical className="mb-pbox-marks" />
      </div>
    </div>
  )
}

/** Back of the box: FEATURES!, spec plate, INCLUDES:, the checklist, links. */
export function BoxBack({ p, opened }) {
  const bullets = featureBullets(p.story, 4)
  return (
    <div className={`mb-pbox mb-pbox--back mb-pbox--${p.slug}`} style={packVars(p)}>
      <div className="mb-pbox-face mb-back" data-lenis-prevent>
        <div className="mb-pbox-tab"><span>{p.name.toUpperCase()}</span><span>REAR PANEL</span></div>
        <div className="mb-back-body">
          <h4 className="mb-back-h">FEATURES!</h4>
          <ul className="mb-back-features">
            {bullets.map(b => <li key={b}>{b}.</li>)}
          </ul>
          <div className="mb-back-plate" role="table" aria-label="Specifications">
            <div className="mb-back-plate-h" role="row"><span role="columnheader">SPEC PLATE</span><span role="columnheader">MEASURED</span></div>
            {p.facts.map(f => (
              <div key={f.k} className="mb-back-plate-row" role="row">
                <span role="cell">{f.k}</span><b role="cell">{f.v}</b>
              </div>
            ))}
            <i className="mb-rivet" /><i className="mb-rivet" /><i className="mb-rivet" /><i className="mb-rivet" />
          </div>
          <div className="mb-back-cols">
            <div>
              <h4 className="mb-back-h mb-back-h--sm">INCLUDES:</h4>
              <ul className="mb-back-includes">
                {p.stack.map(s => <li key={s}>{s}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="mb-back-h mb-back-h--sm">COLLECT ALL 8</h4>
              <ul className="mb-back-checklist">
                {PROJECTS.map(q => (
                  <li key={q.slug} className={opened.includes(q.slug) ? 'is-got' : ''}>
                    <i aria-hidden="true" />{q.name}<span className="mb-sr">{opened.includes(q.slug) ? ' (collected)' : ' (not yet)'}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mb-back-status"><b>STATUS:</b> {p.status}</p>
          <div className="mb-back-links">
            {p.repo && <a className="mb-btn" href={p.repo} target="_blank" rel="noreferrer">SOURCE ON GITHUB ↗</a>}
            {p.slug === 'veronica' && <a className="mb-btn" href="#/chat">TALK TO HER TWIN ▸</a>}
            {p.slug === 'copcars' && <a className="mb-btn" href="https://copcars.in" target="_blank" rel="noreferrer">SHOP COPCARS.IN ↗</a>}
            {p.private && <span className="mb-back-classified">PRIVATE BUILD · NO SOURCE INCLUDED</span>}
          </div>
        </div>
        <div className="mb-back-foot">
          <Barcode seed={p.slug} className="mb-pbox-bar" />
          <p className="mb-fine">{p.desc}</p>
        </div>
      </div>
    </div>
  )
}

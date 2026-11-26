import { HONOURS, EDUCATION, STATS } from '../../../content/index.js'
import SecHead from './SecHead.jsx'

export default function Verified() {
  return (
    <section id="sj-verified" className="sj-sec sj-verified" aria-labelledby="sj-verified-h">
      <div className="sj-flank sj-flank-l">
        <SecHead n={8} act={7} cls="hardware" id="sj-verified-h" label="verified" title="VERIFIED"
          dek="Deep Scan never guesses. Neither does this list. Every line has a source." />
        <div className="sj-plate sj-receipts">
          <p className="sj-k">receipts · counted, not estimated</p>
          <dl>
            {STATS.map(s => (
              <div key={s.label}>
                <dt className="sj-dot">{s.num}</dt>
                <dd><b>{s.label}</b><span>{s.sub}</span></dd>
              </div>
            ))}
          </dl>
          <span className="sj-src">verified · LinkedIn</span>
        </div>
      </div>
      <div className="sj-flank sj-flank-r">
        <ol className="sj-plate sj-honours" aria-label="Honours">
          {HONOURS.map((h) => (
            <li key={h.title} className="sj-hon">
              <span className="sj-hon-y sj-dot">{h.year}</span>
              <span className="sj-hon-x">
                <b>{h.title}</b>
                <span className="sj-src">verified · {h.issuer}</span>
              </span>
              <span className="sj-hon-k">{h.key}</span>
            </li>
          ))}
        </ol>
        <div className="sj-plate sj-edu">
          <p className="sj-k">education · {EDUCATION.length} records</p>
          {EDUCATION.map(e => (
            <div key={e.school} className="sj-edu-r">
              <p><b>{e.school}</b> <span className="sj-dot">{e.years}</span></p>
              <p>{e.what}</p>
              {e.note && <p className="sj-fine">{e.note}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

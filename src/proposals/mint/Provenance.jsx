import { useState } from 'react'
import { CAREER, EDUCATION } from '../../content/index.js'
import { Talker, Barcode } from './parts.jsx'

// Newest owner first, the way a resume is read: the current roles lead (the
// day job before the side business), then everything else by start date.
// Owner numbers still count up from the first owner, so the list reads 08 → 01.
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const startOf = c => { const [m, y] = c.period.split(' — ')[0].split(' '); return +y * 12 + MON.indexOf(m) }
const rank = c => (c.current ? (c.kind === 'role' ? 0 : 1) : 2)
const OWNERS = CAREER.filter(c => c.kind !== 'ambassador').sort((a, b) => rank(a) - rank(b) || startOf(b) - startOf(a))
const SEALS = CAREER.filter(c => c.kind === 'ambassador')

/** Career as a graded slab: acrylic case, grading label, certificate of provenance. */
export default function Provenance() {
  const [openIdx, setOpenIdx] = useState(0) // the current job, at the top
  return (
    <section id="mb-provenance" className="mb-prov" aria-labelledby="mb-prov-title">
      <div className="mb-prov-side">
        <Talker kicker="Act II · the career" title={<span id="mb-prov-title">Provenance</span>} sub="Graded, slabbed, authenticated. Eight years of chain of custody, every owner on the certificate. Click a line to read the receipts." tone="bone" />
        <ul className="mb-prov-edu">
          {EDUCATION.map(e => (
            <li key={e.school}><b>{e.school}</b><span>{e.what} · {e.years}</span>{e.note && <small>{e.note}</small>}</li>
          ))}
        </ul>
      </div>

      <div className="mb-slab">
        <div className="mb-slab-case">
          <div className="mb-slab-label">
            <div className="mb-slab-grade"><span>GEM MINT</span><b>10</b></div>
            <div className="mb-slab-id">
              <b>AKASH JAMES · DIRECTOR AI - BLUE</b>
              <span>2017–2026 · BENGALURU · BERKELEY · ON TOUR</span>
              <span>CERT No. AJ-2017-2026-001</span>
            </div>
            <Barcode seed="slab-cert" className="mb-slab-bar" />
            <span className="mb-slab-holo" aria-hidden="true" />
          </div>

          <div className="mb-slab-well">
            <article className="mb-cert">
              <header className="mb-cert-h">
                <span>CERTIFICATE OF</span>
                <b>PROVENANCE</b>
                <span className="mb-cert-sub">Chain of custody, newest owner first. Every owner improved the specimen.</span>
              </header>
              <ol className="mb-cert-list">
                {OWNERS.map((c, i) => {
                  const isOpen = openIdx === i
                  const acquisition = c.org === 'Integration Wizards Solutions' && c.role === 'AI Architect'
                  return (
                    <li key={c.role + c.org} className={`mb-owner${c.current ? ' is-current' : ''}`}>
                      {acquisition && (
                        <p className="mb-cert-acq"><b>Changed hands:</b> Integration Wizards → SparkCognition, 2022</p>
                      )}
                      <button type="button" className="mb-owner-row" aria-expanded={isOpen} onClick={() => setOpenIdx(isOpen ? -1 : i)}>
                        <span className="mb-owner-no">{String(OWNERS.length - i).padStart(2, '0')}</span>
                        <span className="mb-owner-main">
                          <b>{c.org}</b>
                          <span>{c.role}</span>
                        </span>
                        <span className="mb-owner-date">{c.period.replace(' — ', '–')}</span>
                        <span className="mb-owner-x" aria-hidden="true">{isOpen ? '−' : '+'}</span>
                      </button>
                      {isOpen && (
                        <div className="mb-owner-more">
                          <p>{c.blurb}</p>
                          {c.wins.length > 0 && <ul>{c.wins.map(w => <li key={w}>{w}</li>)}</ul>}
                          <p className="mb-owner-loc">{c.location}</p>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ol>
              <footer className="mb-cert-seals">
                {SEALS.map(s => (
                  <div key={s.org} className="mb-seal">
                    <svg viewBox="0 0 120 120" aria-hidden="true">
                      <defs><path id={`mbSeal${s.org}`} d="M60 60m-41 0a41 41 0 1 1 82 0a41 41 0 1 1-82 0" /></defs>
                      <polygon fill="currentColor" points={Array.from({ length: 64 }, (_, i) => { const a = (Math.PI * i) / 32, r = i % 2 ? 54 : 59; return `${60 + r * Math.cos(a)},${60 + r * Math.sin(a)}` }).join(' ')} />
                      <circle cx="60" cy="60" r="47" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="1" />
                      <text fill="#fff" fontFamily="JetBrains Mono" fontSize="8.4" fontWeight="500" letterSpacing="1.4">
                        <textPath href={`#mbSeal${s.org}`}>ENDORSED · AMBASSADOR · ENDORSED · AMBASSADOR ·</textPath>
                      </text>
                      <text x="60" y="58" textAnchor="middle" fill="#fff" fontFamily="MB Bungee" fontSize="15">{s.org}</text>
                      <text x="60" y="74" textAnchor="middle" fill="#fff" fontFamily="JetBrains Mono" fontSize="7.5">{s.startYear}–{s.endYear}</text>
                    </svg>
                    <p><b>{s.role}</b><span>{s.blurb}</span></p>
                  </div>
                ))}
              </footer>
              <p className="mb-cert-sign"><span>Authenticated by the specimen himself.</span><i>Akash James</i></p>
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}

import { useEffect, useRef, useState } from 'react'
import { LINKS, EMAIL } from '../../../content/index.js'
import { SECTIONS, inferno, INFERNO } from '../lib/data.js'
import { getSession, noteWrote } from '../lib/session.js'
import { buildReport } from '../lib/report.js'
import { scrollToId } from '../lib/nav.js'
import SecHead from './SecHead.jsx'

function Strip({ S }) {
  const max = Math.max(1, ...SECTIONS.map(s => S.dwell[s.id] || 0))
  return (
    <div className="sj-attn">
      <p className="sj-k">attention · per section · inferno</p>
      <ol className="sj-attn-strip">
        {SECTIONS.map((s, i) => {
          const ms = S.dwell[s.id] || 0
          return (
            <li key={s.id} style={{ '--h': inferno(Math.sqrt(ms / max)) }}>
              <button type="button" onClick={() => scrollToId(s.id)} aria-label={`${s.name}: ${(ms / 1000).toFixed(1)} seconds`}>
                <span className="sj-attn-bar" />
                <span className="sj-attn-n">{String(i + 1).padStart(2, '0')}</span>
                <span className="sj-attn-s">{Math.round(ms / 1000)}s</span>
              </button>
            </li>
          )
        })}
      </ol>
      <p className="sj-attn-scale" aria-hidden="true"><span>0 s</span><span className="sj-attn-grad" style={{ background: `linear-gradient(90deg, ${INFERNO.join(',')})` }} /><span>most</span></p>
    </div>
  )
}

export default function DeepScan() {
  const ref = useRef(null)
  const [, setTick] = useState(0)
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    let iv = 0
    const io = new IntersectionObserver(([e]) => {
      clearInterval(iv)
      if (e.isIntersecting) {
        setSeen(true)
        setTick(t => t + 1)
        iv = setInterval(() => { if (!document.hidden) setTick(t => t + 1) }, 1000)
      }
    }, { threshold: 0.05 })
    io.observe(ref.current)
    return () => { io.disconnect(); clearInterval(iv) }
  }, [])

  const S = getSession()
  const { sentences, cites } = buildReport(S)

  return (
    <section id="sj-deepscan" ref={ref} className={`sj-sec sj-deepscan${seen ? ' sj-seen' : ''}`} aria-labelledby="sj-deepscan-h">
      <div className="sj-flank sj-flank-l">
        <SecHead n={9} act={8} cls="person" id="sj-deepscan-h" label="deep scan" title={['DEEP', 'SCAN']}
          dek={<>Your visit, written up. Every sentence cites the part of the page it came from. Deep Scan never guesses.</>} />
        <article className="sj-plate sj-report" aria-label="Report of your visit">
          <p className="sj-report-h">
            <span className="sj-tab" style={{ '--c': '#ECE9E2' }}>casebook · subject {S.id}</span>
            <span className="sj-k">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} · filed by Veronica</span>
          </p>
          <div className="sj-report-body">
            {sentences.map((parts, i) => (
              <span key={i} className="sj-sent" style={{ '--i': i }}>
                {parts.map((p, j) => {
                  if (typeof p === 'string') {
                    // punctuation right after a citation travels with it (see below)
                    return typeof parts[j - 1] === 'object' && /^[.,:;]/.test(p) ? p.slice(1) : p
                  }
                  const next = parts[j + 1]
                  const punct = typeof next === 'string' && /^[.,:;]/.test(next) ? next[0] : ''
                  return (
                    <span key={j} className="sj-nw">
                      <button type="button" className="sj-cite" onClick={() => scrollToId(cites[p.cite - 1].target, { offset: -90 })}
                        aria-label={`Citation ${p.cite}: ${cites[p.cite - 1].label}`}>[{p.cite}]</button>{punct}
                    </span>
                  )
                })}{' '}
              </span>
            ))}
          </div>
          <ol className="sj-cites">
            {cites.map(c => (
              <li key={c.n}>
                <button type="button" onClick={() => scrollToId(c.target, { offset: -90 })}>
                  <span className="sj-cite-n">[{c.n}]</span> {c.label} <span className="sj-cite-d">{c.detail}</span>
                </button>
              </li>
            ))}
          </ol>
        </article>
      </div>
      <div className="sj-flank sj-flank-r">
        <div className="sj-plate">
          <Strip S={S} />
        </div>
        <div className="sj-plate sj-ctas">
          <p className="sj-k">next action · your move</p>
          <a className="sj-cta sj-cta-big" href={LINKS.email} onClick={() => noteWrote('email')}>
            <span className="sj-tab" style={{ '--c': '#FF3D00' }}>write · {EMAIL}</span>
            <span className="sj-cta-note">The one that matters.</span>
          </a>
          <a className="sj-cta" href="#/chat" onClick={() => noteWrote('Veronica')}>
            <span className="sj-tab" style={{ '--c': '#9D8CFF' }}>ask Veronica →</span>
            <span className="sj-cta-note">His AI. She’s read everything above. Twice.</span>
          </a>
          <p className="sj-ctas-row">
            <a className="sj-chip sj-chip-b" href={LINKS.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>
            <a className="sj-chip sj-chip-b" href={LINKS.github} target="_blank" rel="noreferrer">GitHub ↗</a>
            <a className="sj-chip sj-chip-b" href={LINKS.youtube} target="_blank" rel="noreferrer">YouTube ↗</a>
          </p>
        </div>
      </div>
    </section>
  )
}

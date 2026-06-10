import { useEffect, useRef, useState } from 'react'
import { DATA } from '../prototype/dataAdapter.js'
import DecryptedText from '../prototype/reactbits/DecryptedText.jsx'

/**
 * Cinematic vertical timeline: the zone is one viewport per role; a pinned
 * stage crossfades chapters as you scroll while the monolith holds station
 * as a stele at far left (canvas pose) with the ember era-rail climbing.
 * Mobile: plain stacked list, no pinning.
 */
export default function CareerSection() {
  const zoneRef = useRef(null)
  const railRef = useRef(null)
  const [idx, setIdx] = useState(0)
  const roles = DATA.career
  const n = roles.length

  useEffect(() => {
    const zone = zoneRef.current
    if (!zone) return
    if (window.matchMedia('(max-width: 900px)').matches) return // stacked layout

    const onScroll = () => {
      const rect = zone.getBoundingClientRect()
      const totalPx = rect.height - window.innerHeight
      const p = Math.max(0, Math.min(1, -rect.top / totalPx))
      setIdx(Math.min(n - 1, Math.floor(p * n + 0.0001)))
      railRef.current?.style.setProperty('--p', `${(p * 100).toFixed(2)}%`)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [n])

  return (
    <section
      className="ob-career"
      id="career"
      data-screen-label="02 Career"
      ref={zoneRef}
      style={{ '--n': n }}
    >
      <div className="ob-career-pin">
        <div className="ob-career-head">
          <div className="ob-kicker mono-ob"><span className="ob-ember">CHAPTERS</span> · 2016 → NOW</div>
        </div>

        <div className="ob-career-stage">
          {roles.map((r, i) => (
            <article
              key={i}
              className={`ob-chapter${i === idx ? ' active' : ''}${i < idx ? ' past' : ''}`}
              aria-hidden={i !== idx}
            >
              <div className="ob-ghost-year" aria-hidden="true">{r.year}</div>
              <div className="ob-chapter-body">
                <div className="ob-chapter-num mono-ob">
                  {r.live ? <><span className="ob-live-dot" />LIVE · {r.capt}</> : r.capt}
                </div>
                <h3 className="ob-chapter-role">
                  {i === idx
                    ? <DecryptedText key={idx} text={r.role} animateOn="view" sequential speed={14} />
                    : r.role}
                </h3>
                <div className="ob-chapter-org">{r.org}</div>
                <div className="ob-chapter-period mono-ob">{r.period}</div>
                <p className="ob-chapter-blurb">{r.blurb}</p>
                <div className="ob-chapter-tags mono-ob">
                  {r.tags.map(t => <span key={t}>{t}</span>)}
                </div>
              </div>
              {i === 0 && (
                <figure className="ob-dossier" aria-hidden="true">
                  <img src="/hero.webp" alt="" loading="lazy" decoding="async" />
                  <figcaption className="mono-ob">DOSSIER · A. JAMES</figcaption>
                </figure>
              )}
            </article>
          ))}
        </div>

        <div className="ob-career-rail mono-ob" ref={railRef} aria-hidden="true">
          <span className="ob-rail-index">{String(idx + 1).padStart(2, '0')} — {String(n).padStart(2, '0')}</span>
          <span className="ob-rail-track"><span className="ob-rail-fill" /></span>
        </div>
      </div>
    </section>
  )
}

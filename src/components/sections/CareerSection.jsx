import { useEffect, useRef, useState } from 'react'
import { DATA } from '../prototype/dataAdapter.js'
import DecryptedText from '../prototype/reactbits/DecryptedText.jsx'
import { useLenis } from '../../shared/components/SmoothScroll.jsx'

const STEP_COOLDOWN_MS = 550 // min time between chapter steps
const STEP_THRESHOLD = 60    // accumulated wheel delta that triggers a step
const STEP_S = 0.85          // chapter step scroll duration
const stepEase = t => 1 - Math.pow(1 - t, 3)

/**
 * Cinematic vertical timeline: the zone is one viewport per role; a pinned
 * stage crossfades chapters as you scroll over the story video's
 * armor-assembly segment, with the ember era-rail climbing.
 * Mobile: plain stacked list, no pinning.
 */
export default function CareerSection() {
  const zoneRef = useRef(null)
  const railRef = useRef(null)
  const [idx, setIdx] = useState(0)
  const idxRef = useRef(0)
  const lenisRef = useLenis()
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
      const i = Math.min(n - 1, Math.floor(p * n + 0.0001))
      idxRef.current = i
      setIdx(i)
      railRef.current?.style.setProperty('--p', `${(p * 100).toFixed(2)}%`)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    // Discrete chapter stepping. While the zone is pinned, wheel input is
    // absorbed and accumulated; once the accumulated delta crosses the
    // threshold (and the cooldown has elapsed) the chapter steps once.
    // Rapid flicking therefore advances at a steady cadence — one chapter
    // per ~0.9s — instead of trapping the user, and at either edge the
    // gesture passes through so the page scrolls on naturally.
    let acc = 0
    let lastStepAt = 0
    let animating = false
    const onWheel = (e) => {
      const rect = zone.getBoundingClientRect()
      const vh = window.innerHeight
      const pinned = rect.top <= 2 && rect.bottom >= vh - 2
      if (!pinned) { acc = 0; return }

      const dir = e.deltaY > 0 ? 1 : -1
      const i = idxRef.current
      // Edge release: outward gestures leave the zone untouched
      if (!animating && ((i === 0 && dir < 0) || (i === n - 1 && dir > 0))) return

      e.preventDefault()
      e.stopImmediatePropagation()
      if (animating) return

      acc += e.deltaY
      const now = performance.now()
      if (now - lastStepAt < STEP_COOLDOWN_MS) return
      if (Math.abs(acc) < STEP_THRESHOLD) return

      const stepDir = acc > 0 ? 1 : -1
      acc = 0
      lastStepAt = now
      const next = Math.min(n - 1, Math.max(0, i + stepDir))
      if (next === i) return
      const zoneTop = window.scrollY + rect.top
      const scrollable = zone.offsetHeight - vh
      const target = zoneTop + scrollable * ((next + 0.5) / n)
      const lenis = lenisRef?.current
      animating = true
      const done = () => { animating = false; acc = 0 }
      if (lenis) lenis.scrollTo(target, { duration: STEP_S, easing: stepEase, lock: true, onComplete: done })
      else { window.scrollTo({ top: target, behavior: 'smooth' }); setTimeout(done, STEP_S * 1000) }
    }
    // Capture phase + stopImmediatePropagation keeps Lenis's own wheel
    // handler from double-driving the scroll while we step.
    window.addEventListener('wheel', onWheel, { passive: false, capture: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('wheel', onWheel, { capture: true })
    }
  }, [n, lenisRef])

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

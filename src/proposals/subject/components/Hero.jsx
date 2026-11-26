import { useEffect, useRef, useState } from 'react'
import PixelAssembly from '../../shared/PixelAssembly.jsx'
import { PROFILE } from '../../../content/index.js'
import { PROJECT_BY_SLUG, SECTIONS } from '../lib/data.js'
import { setLocked, reducedMotion } from '../lib/fx.js'
import { getSession } from '../lib/session.js'

function greeting(S) {
  const p = S.prev
  if (!p) return null
  const bits = [`Welcome back, subject ${S.id}.`]
  if (p.topCard && p.topCard[1] > 1500) bits.push(`Last time: ${Math.round(p.topCard[1] / 1000)} s on ${PROJECT_BY_SLUG[p.topCard[0]]?.name || p.topCard[0]}.`)
  else if (p.topSection) bits.push(`Last time: ${Math.round(p.topSection[1] / 1000)} s on ${SECTIONS.find(s => s.id === p.topSection[0])?.cite || 'the page'}.`)
  bits.push(p.wrote ? 'You wrote. He noticed.' : 'You never wrote.')
  return bits.join(' ')
}

/**
 * ACQUIRE. The selfie assembles from pixels; as it lands, candidate boxes
 * jitter round his face and collapse into one (the film layer does that),
 * the class name snaps in underneath and the caption types itself.
 */
export default function Hero() {
  const [phase, setPhase] = useState(() => (reducedMotion() ? 'in' : 'wait'))
  const capRef = useRef(null)
  const [greet] = useState(() => greeting(getSession()))

  const assembled = () => {
    setTimeout(() => setLocked(), reducedMotion() ? 0 : 150)
    setTimeout(() => setPhase('in'), reducedMotion() ? 0 : 700)
  }

  useEffect(() => {
    if (phase !== 'in') return
    const el = capRef.current
    const text = PROFILE.headline
    if (reducedMotion()) { el.textContent = text; return }
    let i = 0
    let iv = 0
    const start = setTimeout(() => {
      iv = setInterval(() => {
        i += 1
        el.textContent = text.slice(0, i)
        if (i >= text.length) clearInterval(iv)
      }, 26)
    }, 520)
    return () => { clearTimeout(start); clearInterval(iv) }
  }, [phase])

  return (
    <section id="sj-acquire" className={`sj-hero sj-phase-${phase}`} aria-labelledby="sj-name">
      <div className="sj-hero-pin">
        <PixelAssembly onAssembled={assembled} />
        {greet && <p className="sj-greet"><span className="sj-tab" style={{ '--c': '#ECE9E2' }}>re-identified</span> {greet}</p>}
        <div className="sj-hero-id">
          <p className="sj-hero-meta">
            <span className="sj-tab" style={{ '--c': '#FF3D00' }}>class: person · id 001</span>
            <span>{PROFILE.role}</span>
            <span className="sj-hide-sm">{PROFILE.location}</span>
          </p>
          <h1 id="sj-name" className="sj-hero-name sj-disp">
            <span className="sj-snapword">AKASH</span> <span className="sj-snapword">JAMES</span>
          </h1>
          <p className="sj-hero-cap">
            <span className="sj-cap-k">caption&nbsp;›</span>
            <span className="sj-sr">{PROFILE.headline}</span>
            <span className="sj-cap-q" aria-hidden="true">“<span ref={capRef} />”</span>
            <span className="sj-caret" aria-hidden="true" />
          </p>
        </div>
      </div>
    </section>
  )
}

import { useEffect, useRef, useState } from 'react'
import { DATA } from '../prototype/dataAdapter.js'
import { ScrambleText, TypewriterKicker, MagneticButton } from './lib/effects.jsx'

/**
 * Finale over the story video's final-form push-in: a single headline,
 * two CTAs and a mono social line.
 */
export default function ContactSection({ onAsk }) {
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); io.disconnect() }
    }, { threshold: 0.2 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="ob-contact" id="contact" data-screen-label="08 Contact">
      <div className="ob-wrap ob-contact-core">
        <div className="ob-kicker mono-ob"><TypewriterKicker text="ESTABLISHING TRANSMISSION" /></div>
        <h2 className="ob-contact-headline">
          Let's build<br />something<br />
          <ScrambleText text="outrageous." className="ob-ember" trigger={visible} />
        </h2>
        <div className="ob-contact-ctas reveal d2">
          <MagneticButton tag="a" className="ob-cta" href={`mailto:${DATA.contactEmail}`}>
            <span>OPEN CHANNEL</span>
            <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 11L11 3M11 3H5M11 3V9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="square" fill="none" /></svg>
          </MagneticButton>
          <MagneticButton tag="button" className="ob-cta ghost" onClick={onAsk}>
            <span>ASK VERONICA</span>
          </MagneticButton>
        </div>
        <div className="ob-socials mono-ob reveal d3">
          {DATA.socials.map((s, i) => (
            <a key={s.k} href={s.href} target="_blank" rel="noreferrer">
              {s.k}{i < DATA.socials.length - 1 && <span className="ob-socials-sep" aria-hidden="true"> · </span>}
            </a>
          ))}
        </div>
      </div>
      <footer className="ob-footer mono-ob">
        <div className="ob-wrap">© {new Date().getFullYear()} AKASH JAMES · BUILT WITH VERONICA</div>
      </footer>
    </section>
  )
}

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLenis } from '../../shared/components/SmoothScroll'
import { BLUE_STACK, P1_RECORD } from './data.js'
import { reduced, shake, flash, setVsOpen } from './fx.js'
import { Burst, SpeedLines, Mis } from './Art.jsx'
import { Portrait } from './CharacterSelect.jsx'

/**
 * VS screen → stage. Diagonal split (P1 Akash vs the project), the VS crash,
 * then the project's stage: its images as backdrops, story, facts as frame
 * data, loadout and links. Esc returns to the select screen.
 */
export default function VsScreen({ fighter, onClose }) {
  const lenis = useLenis()
  const [phase, setPhase] = useState(() => (reduced() ? 'stage' : 'vs'))
  const [bg, setBg] = useState(0)
  const rootRef = useRef(null)
  const vsRef = useRef(null)
  const closeRef = useRef(null)
  const isBoss = fighter.slug === 'blue'

  // Open: stop the page, trap focus, Esc to leave.
  useEffect(() => {
    setVsOpen(true)
    const l = lenis?.current
    l?.stop()
    const html = document.documentElement
    const prevOverflow = html.style.overflow
    html.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose() }
      if (e.key === 'Tab') {
        const f = rootRef.current?.querySelectorAll('a[href], button:not([disabled]), [tabindex="0"]')
        if (!f?.length) return
        const first = f[0], last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      html.style.overflow = prevOverflow
      l?.start()
      setVsOpen(false)
    }
  }, [lenis, onClose])

  // The VS crash, then the stage.
  useEffect(() => {
    if (phase !== 'vs') return
    closeRef.current?.focus({ preventScroll: true })
    const t1 = setTimeout(() => { flash(0.9); shake(vsRef.current, 12, 380) }, 520)
    const t2 = setTimeout(() => setPhase('stage'), 1900)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [phase])

  useEffect(() => {
    if (phase === 'stage') rootRef.current?.querySelector('.vs-stage')?.focus({ preventScroll: true })
  }, [phase])

  const images = isBoss ? [] : fighter.images

  return createPortal(
    <div
      className={`vs-overlay vs-root-portal is-${phase}`}
      ref={rootRef}
      data-lenis-prevent
      role="dialog"
      aria-modal="true"
      aria-label={`${fighter.name}: versus screen and stage`}
    >
      <button type="button" className="vs-overlay-close" ref={closeRef} onClick={onClose}>
        <kbd>ESC</kbd> BACK TO SELECT
      </button>

      {phase === 'vs' && (
        <div className="vs-vs" ref={vsRef} onClick={() => setPhase('stage')}>
          <div className="vs-vs-p1">
            <img src="/hero.webp" alt="" width="1440" height="1080" />
            <div className="vs-vs-label">
              <span className="vs-vs-tag">P1</span>
              <span className="vs-vs-name">AKASH JAMES</span>
              <span className="vs-vs-sub">AI ARCHITECT · BENGALURU</span>
              <dl className="vs-vs-stats">
                {P1_RECORD.slice(0, 4).map(s => <div key={s.label}><dt>{s.label}</dt><dd>{s.num}</dd></div>)}
              </dl>
            </div>
          </div>
          <div className={`vs-vs-p2${isBoss ? ' is-boss' : ''}`}>
            {isBoss
              ? <span className="vs-vs-boss" aria-hidden="true">BLUE</span>
              : <Portrait p={fighter} big eager className="vs-vs-portrait" />}
            <div className="vs-vs-label vs-vs-label-r">
              <span className="vs-vs-tag">{isBoss ? 'BOSS' : `NO.${String(fighter.n).padStart(2, '0')}`}</span>
              <span className="vs-vs-name">{fighter.name}</span>
              <span className="vs-vs-sub">{fighter.alias}</span>
            </div>
          </div>
          <div className="vs-vs-crash" aria-hidden="true">
            <SpeedLines className="vs-vs-speed" seed={fighter.name.length} count={60} />
            <Burst className="vs-vs-burst" seed={fighter.name.length * 3} spikes={20} inks={['yellow', 'pink']} />
            <span className="vs-vs-word vs-mis" data-text="VS">VS</span>
          </div>
          <p className="vs-vs-skip">CLICK TO SKIP</p>
        </div>
      )}

      {phase === 'stage' && (
        <div className="vs-stage" tabIndex={-1}>
          <div className="vs-stage-bg" aria-hidden="true">
            {isBoss
              ? <Burst className="vs-stage-bg-burst" seed={5} spikes={24} inks={['pink', 'yellow']} />
              : <img key={bg} src={images[bg].src} width={images[bg].w} height={images[bg].h} alt="" />}
          </div>
          <div className="vs-stage-inner">
            <header className="vs-stage-head">
              <p className="vs-stage-kicker">STAGE · {isBoss ? 'BOSS FIGHT' : `${fighter.kicker} · ${fighter.year}`}</p>
              <h2 className="vs-stage-name"><Mis>{fighter.name}</Mis></h2>
              <p className="vs-stage-pitch">{fighter.pitch}</p>
            </header>

            {isBoss ? (
              <ol className="vs-stage-blue">
                {BLUE_STACK.map((b, i) => (
                  <li key={b.name}>
                    <span className="vs-stage-blue-no">U{i + 1}</span>
                    <h3>{b.name}</h3>
                    <p className="vs-stage-blue-kind">{b.kind}</p>
                    <p>{b.line}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="vs-stage-grid">
                <div className="vs-stage-story">
                  <h3 className="vs-stage-h">STORY</h3>
                  <p className="vs-stage-desc">{fighter.desc}</p>
                  <p>{fighter.story}</p>
                  <p className="vs-stage-status"><b>STATUS</b> {fighter.status}{fighter.license ? ` · ${fighter.license}` : ''}</p>
                </div>
                <div className="vs-stage-data">
                  <table className="vs-stage-frames">
                    <caption>FRAME DATA</caption>
                    <tbody>
                      {fighter.facts.map(f => (
                        <tr key={f.k}><th scope="row">{f.k}</th><td>{f.v}</td></tr>
                      ))}
                    </tbody>
                  </table>
                  <h3 className="vs-stage-h">LOADOUT</h3>
                  <ul className="vs-stage-stack">{fighter.stack.map(s => <li key={s}>{s}</li>)}</ul>
                  {fighter.quote && (
                    <blockquote className="vs-stage-quote"><p>{fighter.quote.line}</p><cite>{fighter.quote.by}</cite></blockquote>
                  )}
                </div>
              </div>
            )}

            {!isBoss && images.length > 1 && (
              <div className="vs-stage-picker" role="group" aria-label="Stage backdrops">
                <h3 className="vs-stage-h">STAGE SELECT</h3>
                <div className="vs-stage-thumbs">
                  {images.map((im, i) => (
                    <button
                      key={im.src} type="button"
                      className={`vs-stage-thumb${i === bg ? ' is-on' : ''}`}
                      onClick={() => setBg(i)}
                      aria-pressed={i === bg}
                    >
                      <img src={im.src} width={im.w} height={im.h} alt="" loading="lazy" />
                      <span>{im.alt}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {!isBoss && images.length === 1 && <p className="vs-stage-caption">{images[0].alt}</p>}

            <div className="vs-stage-links">
              <a className="vs-btn vs-btn-yellow" href={fighter.link.href}
                {...(fighter.link.href.startsWith('#') ? {} : { target: '_blank', rel: 'noreferrer' })}
                onClick={fighter.link.href.startsWith('#') ? onClose : undefined}
              >
                {fighter.link.label}
              </a>
              <button type="button" className="vs-btn vs-btn-ghost" onClick={onClose}>REMATCH · BACK TO SELECT</button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.querySelector('.vs-root') ?? document.body,
  )
}

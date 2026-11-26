import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ARCHIVE, PROJECTS } from '../../content/index.js'
import { useLenis } from '../../shared/components/SmoothScroll'
import { useCollection, peekChase } from './collection.js'
import { Chrome, Barcode, PrintMarks, Burst } from './parts.jsx'

const PROTOS = ARCHIVE.filter(a => !a.repo)
const REPOS = ARCHIVE.filter(a => a.repo)

/** The ninth peg. Locked: a gold outline and a progress tag. Open all 8 → the foil box drops in. */
export default function ChaseSlot() {
  const { opened, peeked } = useCollection()
  const [open, setOpen] = useState(false)
  const btn = useRef(null)
  const got = PROJECTS.filter(p => opened.includes(p.slug)).length
  const unlocked = got >= PROJECTS.length || peeked
  const voided = peeked && got < PROJECTS.length

  if (!unlocked) {
    return (
      <li className="mb-hang mb-hang--chase">
        <div className="mb-swing mb-chase-ghost">
          <div className="mb-ghostbox" aria-hidden="true"><span>?</span></div>
          <span className="mb-peg" aria-hidden="true"><i /></span>
          <div className="mb-chase-tagcard">
            <b>CHASE VARIANT</b>
            <p>1 per wall. Open all 8 boxes to unlock the gold one. You’re on <strong>{got}/8</strong>.</p>
            <span className="mb-chase-meter" aria-hidden="true">
              {PROJECTS.map(p => <i key={p.slug} className={opened.includes(p.slug) ? 'on' : ''} />)}
            </span>
            <button type="button" className="mb-chase-peek" onClick={peekChase}>Impatient? Peek now (voids the warranty)</button>
          </div>
        </div>
      </li>
    )
  }

  return (
    <li className="mb-hang mb-hang--chase is-unlocked">
      <div className="mb-swing">
        <button ref={btn} type="button" className="mb-pick" onClick={() => setOpen(true)} aria-label="Chase variant: Akash, prototype 2016 to 2019. Open it">
          <div className="mb-pbox mb-gbox">
            <div className="mb-pbox-face">
              <div className="mb-gbox-foil" aria-hidden="true" />
              <div className="mb-pbox-tab"><span>CHASE VARIANT</span><span>No. 00/08</span></div>
              <div className="mb-gbox-body">
                <span className="mb-gbox-k">GOLD FOIL · 1 OF 1</span>
                <Chrome as="h3" text="AKASH" tone="gold" className="mb-gbox-logo" />
                <span className="mb-gbox-sub">PROTOTYPE<br />2016–2019</span>
                <p className="mb-gbox-p">The early builds and the classic repos the internet still forks. {ARCHIVE.length} pieces inside.</p>
              </div>
              <Burst className="mb-gbox-burst" fill="#2a1c00" ink="#f7dc7d" points={16}><b>RARE</b></Burst>
              <div className="mb-pbox-foot">
                <span className="mb-gbox-k">{voided ? 'PEEKED · NOT MINT' : 'EARNED · MINT'}</span>
                <span />
                <Barcode seed="chase-akash-prototype" className="mb-pbox-bar" />
              </div>
            </div>
          </div>
        </button>
        <span className="mb-peg" aria-hidden="true"><i /></span>
      </div>
      {open && createPortal(
        <ChaseModal voided={voided} onClose={() => { setOpen(false); btn.current?.focus({ preventScroll: true }) }} />,
        document.querySelector('.mb-root') || document.body,
      )}
    </li>
  )
}

function ChaseModal({ voided, onClose }) {
  const [flipped, setFlipped] = useState(false)
  const lenisRef = useLenis()
  const first = useRef(null)
  const closeRef = useRef(onClose)
  useEffect(() => { closeRef.current = onClose })
  useEffect(() => {
    const lenis = lenisRef?.current
    lenis?.stop()
    first.current?.focus({ preventScroll: true })
    const onKey = e => { if (e.key === 'Escape') closeRef.current() }
    window.addEventListener('keydown', onKey)
    return () => { lenis?.start(); window.removeEventListener('keydown', onKey) }
  }, [lenisRef])

  return (
    <div className="mb-modal mb-chase-modal" role="dialog" aria-modal="true" aria-label="Chase variant">
      <div className="mb-modal-bg mb-modal-bg--gold" onClick={onClose} aria-hidden="true" />
      <div className={`mb-chase${flipped ? ' is-flipped' : ''}`} data-lenis-prevent>
        <div className="mb-chase-card">
          <div className="mb-chase-face mb-chase-front" aria-hidden={flipped}>
            <div className="mb-chase-foil" aria-hidden="true" />
            <div className="mb-chase-front-in">
              <span className="mb-chase-tag">CHASE VARIANT · 1 OF 1 · GOLD FOIL</span>
              <Chrome as="h3" text="AKASH" tone="gold" className="mb-chase-logo" />
              <p className="mb-chase-sub">PROTOTYPE 2016–2019</p>
              <p className="mb-chase-blurb">The early builds: a smart glove that reads currency, bins that call for pickup, gesture-controlled lights, fire-spotting drones. Plus the classic repos the internet still forks.</p>
              <div className="mb-chase-badges">
                <span className="mb-chase-seal">RARE</span>
                <Barcode seed="chase-akash-prototype" className="mb-chase-bar" />
                <PrintMarks className="mb-chase-marks" />
              </div>
            </div>
            {voided && <span className="mb-chase-void">PEEKED · NOT MINT</span>}
          </div>
          <div className="mb-chase-face mb-chase-back" aria-hidden={!flipped}>
            <div className="mb-chase-cols">
              <div>
                <h4>PROTOTYPES INCLUDED</h4>
                <ul>
                  {PROTOS.map(a => <li key={a.name}><b>{a.name}</b> <span>{a.year}</span><p>{a.desc}</p></li>)}
                </ul>
              </div>
              <div>
                <h4>CLASSIC REPOS · STILL FORKED</h4>
                <ul>
                  {REPOS.map(a => (
                    <li key={a.name}>
                      <a href={a.repo} target="_blank" rel="noreferrer" tabIndex={flipped ? 0 : -1}><b>{a.name}</b></a>
                      <span>{a.year} · ★ {a.stars}</span>
                      <p>{a.desc}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-modal-ctrl">
        <button ref={first} type="button" className="mb-btn" onClick={() => setFlipped(f => !f)} aria-pressed={flipped}>
          {flipped ? 'SHOW THE FOIL ↻' : 'FLIP: WHAT’S INSIDE ↻'}
        </button>
        <button type="button" className="mb-btn mb-btn--ghost" onClick={onClose}>BACK ON THE PEG · ESC</button>
      </div>
    </div>
  )
}

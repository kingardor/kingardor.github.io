import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { CLS, PROJECT_BY_SLUG, PROJECT_CLS, SIGHTING_ORDER, SIGHTING_LINKS } from '../lib/data.js'
import { getSession } from '../lib/session.js'
import Cover from './Cover.jsx'

function linksOut(p) {
  if (p.slug === 'veronica') return [{ href: '#/chat', label: 'Talk to her web twin', note: 'private build · no repo' }]
  if (p.slug === 'copcars') return [{ href: 'https://copcars.in', label: 'copcars.in', note: 'private build · live store', ext: true }]
  return p.repo ? [{ href: p.repo, label: 'Source on GitHub', note: p.license ? `licence · ${p.license}` : 'public repo', ext: true }] : []
}

/**
 * Full-screen case file. The cover flies in from the board (shared layout,
 * FLIP under the hood); everything else is the record: gallery, pitch,
 * story, measured facts, stack, status, links. Esc closes.
 */
export default function CaseFile({ slug, onClose }) {
  const p = PROJECT_BY_SLUG[slug]
  const [img, setImg] = useState(0)
  const closeRef = useRef(null)
  const rootRef = useRef(null)
  const n = SIGHTING_ORDER.indexOf(slug) + 1
  const related = SIGHTING_LINKS.filter(l => l.from === slug || l.to === slug)
  const opened = new Date()

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true })
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose() }
      if (e.key === 'ArrowRight') setImg(i => (i + 1) % p.images.length)
      if (e.key === 'ArrowLeft') setImg(i => (i + p.images.length - 1) % p.images.length)
      if (e.key === 'Tab') {
        const f = rootRef.current.querySelectorAll('a, button')
        if (!f.length) return
        const first = f[0], last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, p.images.length])

  const image = p.images[img]
  return (
    <motion.div
      ref={rootRef}
      className="sj-case"
      role="dialog" aria-modal="true" aria-labelledby="sj-case-h"
      style={{ '--c': CLS[PROJECT_CLS[slug]] }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.18 } }}
      transition={{ duration: 0.16 }}
      data-lenis-prevent
    >
      <header className="sj-case-bar">
        <span className="sj-tab">case {String(n).padStart(3, '0')} · {p.slug}</span>
        <span className="sj-case-meta">opened {opened.toLocaleTimeString('en-GB')} by subject {getSession().id} · logged</span>
        <button ref={closeRef} type="button" className="sj-x sj-case-x" onClick={onClose}>close · esc</button>
      </header>

      <div className="sj-case-body">
        <div className="sj-case-gal">
          <div className="sj-case-main">
            {img === 0
              ? <Cover project={p} eager />
              : <Cover project={p} image={image} layout={false} eager />}
          </div>
          {p.images.length > 1 && (
            <ol className="sj-case-thumbs" aria-label="Evidence">
              {p.images.map((m, i) => (
                <li key={m.src}>
                  <button type="button" className={i === img ? 'sj-thumb-on' : ''} onClick={() => setImg(i)} aria-label={`Evidence ${i + 1}: ${m.alt}`} aria-pressed={i === img}>
                    <img src={m.src} alt="" width={m.w} height={m.h} loading="lazy" decoding="async" />
                    <span className="sj-thumb-n">E{String(i + 1).padStart(2, '0')}</span>
                  </button>
                </li>
              ))}
            </ol>
          )}
          <p className="sj-case-alt"><span className="sj-k">E{String(img + 1).padStart(2, '0')} · {image.kind}</span> {image.alt}</p>
        </div>

        <div className="sj-case-rec">
          <p className="sj-case-kick">{p.kicker} · {p.year}</p>
          <h2 id="sj-case-h" className="sj-disp sj-case-name">{p.name}</h2>
          <p className="sj-case-pitch">{p.pitch}</p>
          <p className="sj-case-story">{p.story}</p>
          {p.quote && <blockquote className="sj-case-q">“{p.quote.line}” <cite>{p.quote.by}</cite></blockquote>}

          <table className="sj-facts">
            <caption className="sj-k">measured · from the README</caption>
            <tbody>
              {p.facts.map(f => <tr key={f.k}><th scope="row">{f.k}</th><td className="sj-dot">{f.v}</td></tr>)}
            </tbody>
          </table>

          <p className="sj-k">stack · detected classes</p>
          <p className="sj-chips">{p.stack.map(s => <span key={s} className="sj-chip">{s}</span>)}</p>

          <p className="sj-case-status"><span className="sj-k">status</span> {p.status}</p>
          {related.length > 0 && (
            <p className="sj-case-rel"><span className="sj-k">linked</span> {related.map(l => {
              const other = l.from === slug ? l.to : l.from
              const name = other === 'mini-edge' ? 'BLUE Mini Edge' : PROJECT_BY_SLUG[other].name
              return <span key={other}><i>{l.from === slug && l.label === 'descendant of' ? 'ancestor of' : l.label}</i> {name}</span>
            })}</p>
          )}
          <p className="sj-case-links">
            {linksOut(p).map(l => (
              <a key={l.href} href={l.href} className="sj-cta" {...(l.ext ? { target: '_blank', rel: 'noreferrer' } : {})}>
                <span className="sj-tab">{l.label}{l.ext ? ' ↗' : ' →'}</span>
                <span className="sj-cta-note">{l.note}</span>
              </a>
            ))}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ARCHIVE } from '../../../content/index.js'
import { CLS, PROJECT_BY_SLUG, PROJECT_CLS, SIGHTING_ORDER, SIGHTING_LINKS } from '../lib/data.js'
import { useCompact } from '../lib/fx.js'
import { scrollToId } from '../lib/nav.js'
import SecHead from './SecHead.jsx'
import Cover from './Cover.jsx'

const LEFT = ['noir', 'veronica', 'q-pocket', 'zassistant']
const RIGHT = ['vector', 'hermes', 'copcars', 'shred']

function Card({ slug, onOpen, links }) {
  const p = PROJECT_BY_SLUG[slug]
  const n = SIGHTING_ORDER.indexOf(slug) + 1
  return (
    <article className="sj-sight" id={`sj-s-${slug}`} data-sj-card={slug} style={{ '--c': CLS[PROJECT_CLS[slug]] }}>
      <button type="button" className="sj-sight-img" onClick={(e) => onOpen(slug, e.currentTarget)} aria-label={`Open case file: ${p.name}`}>
        <Cover project={p} />
      </button>
      <div className="sj-sight-cap">
        <p className="sj-sight-meta">
          <span className="sj-tab">sighting {String(n).padStart(3, '0')}</span>
          <span>{p.year} · {p.kicker}</span>
        </p>
        <h3 className="sj-disp sj-sight-name">{p.name}</h3>
        <p className="sj-sight-pitch">{p.pitch}</p>
        {links.length > 0 && (
          <p className="sj-sight-links">{links.map(l => <span key={l.label + l.other}><i>{l.label}</i> {l.other}</span>)}</p>
        )}
        <button type="button" className="sj-link" onClick={(e) => onOpen(slug, e.currentTarget)}>open case file →</button>
      </div>
    </article>
  )
}

function linksFor(slug) {
  return SIGHTING_LINKS.flatMap(l => {
    if (l.from === slug) return [{ label: l.label === 'descendant of' ? 'ancestor of' : l.label, other: l.to === 'mini-edge' ? 'BLUE Mini Edge' : PROJECT_BY_SLUG[l.to].name }]
    if (l.to === slug) return [{ label: l.label, other: PROJECT_BY_SLUG[l.from].name }]
    return []
  })
}

/** Lines between related sightings, measured from the laid-out cards. */
function useLinks(boardRef, enabled) {
  const [paths, setPaths] = useState([])
  useLayoutEffect(() => {
    if (!enabled) return
    const board = boardRef.current
    const measure = () => {
      const B = board.getBoundingClientRect()
      const anchor = (slug) => {
        const el = slug === 'mini-edge' ? board.querySelector('.sj-pin') : board.querySelector(`#sj-s-${slug} .sj-cover`)
        if (!el) return null
        const r = el.getBoundingClientRect()
        const isLeft = r.left + r.width / 2 < B.left + B.width / 2
        return { x: (isLeft ? r.right : r.left) - B.left, y: r.top - B.top + r.height * 0.42, isLeft }
      }
      setPaths(SIGHTING_LINKS.map(l => {
        const a = anchor(l.from), b = anchor(l.to)
        if (!a || !b) return null
        const dx = Math.abs(b.x - a.x) * 0.45
        const c1 = a.x + (a.isLeft ? dx : -dx), c2 = b.x + (b.isLeft ? dx : -dx)
        return { ...l, d: `M${a.x},${a.y} C${c1},${a.y} ${c2},${b.y} ${b.x},${b.y}`, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 }
      }).filter(Boolean))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(board)
    board.querySelectorAll('img').forEach(img => img.addEventListener('load', measure))
    return () => ro.disconnect()
  }, [boardRef, enabled])
  return paths
}

export default function Sightings({ onOpen }) {
  const compact = useCompact()
  const boardRef = useRef(null)
  const paths = useLinks(boardRef, !compact)
  const [drawn, setDrawn] = useState(false)
  useEffect(() => {
    const el = boardRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setDrawn(true); io.disconnect() } }, { threshold: 0.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section id="sj-sightings" className="sj-sec sj-sightings" aria-labelledby="sj-sightings-h">
      <div className="sj-flank sj-flank-l">
        <SecHead n={5} act={4} cls="robot" id="sj-sightings-h" label="case board" title="SIGHTINGS"
          dek="Everything he built in his own time, pinned to the board with what the detector saw in it. Every one of them sees something. Click for the case file." />
      </div>

      <div ref={boardRef} className={`sj-board${drawn ? ' sj-board-drawn' : ''}`}>
        {!compact && (
          <svg className="sj-board-links" aria-hidden="true">
            {paths.map((p, i) => <path key={i} d={p.d} pathLength="1" style={{ '--i': i }} />)}
          </svg>
        )}
        {!compact && paths.map((p, i) => (
          <span key={i} className="sj-board-l" style={{ left: p.mx, top: p.my, '--i': i }}>{p.label}</span>
        ))}
        {compact ? (
          <div className="sj-board-col">
            {SIGHTING_ORDER.map(s => <Card key={s} slug={s} onOpen={onOpen} links={linksFor(s)} />)}
          </div>
        ) : (
          <>
            <div className="sj-board-col sj-board-l-col">{LEFT.map(s => <Card key={s} slug={s} onOpen={onOpen} links={linksFor(s)} />)}</div>
            <div className="sj-board-mid">
              <button type="button" className="sj-pin" onClick={() => scrollToId('sj-memory')}>
                <span className="sj-tab" style={{ '--c': CLS.person }}>rec 05 · BLUE</span>
                <b>BLUE Mini Edge</b>
                <span>Detection, tracking and VLM verification at the edge, with drones as live cameras. Fire and smoke on the list. Familiar?</span>
              </button>
            </div>
            <div className="sj-board-col sj-board-r-col">{RIGHT.map(s => <Card key={s} slug={s} onOpen={onOpen} links={linksFor(s)} />)}</div>
          </>
        )}
      </div>

      <div className="sj-flank sj-flank-l sj-archive-wrap">
        <div className="sj-plate sj-archive">
          <p className="sj-k">older sightings · {ARCHIVE.length} records · low confidence, high stars</p>
          <ol>
            {ARCHIVE.map(a => (
              <li key={a.name}>
                <span className="sj-ar-y">{a.year}</span>
                <span className="sj-ar-s">{a.stars != null ? `★${a.stars}` : '—'}</span>
                <span className="sj-ar-n">
                  {a.repo ? <a href={a.repo} target="_blank" rel="noreferrer">{a.name} ↗</a> : <b>{a.name}</b>}
                  <span className="sj-ar-d">{a.desc}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

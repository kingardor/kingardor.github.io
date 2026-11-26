import { useEffect, useMemo, useRef, useState } from 'react'
import { PROFILE } from '../../../content/index.js'
import { subscribe } from '../../../shared/scroll/scrollStore.js'
import { GRAPH_NODES, GRAPH_EDGES, PRODUCT_RECORDS, ORG_NOTES } from '../lib/data.js'
import { useCompact, reducedMotion } from '../lib/fx.js'
import { remember, getSession } from '../lib/session.js'
import SecHead from './SecHead.jsx'

const BY_ID = Object.fromEntries(GRAPH_NODES.map(n => [n.id, n]))
const Y0 = 2014, Y1 = 2026.6
// One label per verb per source (BLUE ‘built’ six things; say it once)
const LABELLED = new Set(GRAPH_EDGES.map(([a, , l], i) => [a + l, i, l]).filter(([, , l]) => l !== 'then' && l !== 'at')
  .filter(([k], j, arr) => arr.findIndex(x => x[0] === k) === j).map(([, i]) => i))
const KIND_LABEL = { person: 'subject', role: 'role', org: 'org', product: 'product', edu: 'education', event: 'stage' }

function Chip({ href, children }) {
  return href
    ? <a className="sj-src" href={href} target="_blank" rel="noreferrer">source · {children} ↗</a>
    : <span className="sj-src">source · {children}</span>
}

export function NodeRecord({ node }) {
  const r = node.ref || {}
  if (r.career) {
    const c = r.career
    return (
      <>
        <p className="sj-rec-k">{c.period} · {c.location}</p>
        <h3 className="sj-rec-h">{c.role}</h3>
        <p className="sj-rec-org">{c.orgUrl ? <a href={c.orgUrl} target="_blank" rel="noreferrer">{c.org} ↗</a> : c.org}</p>
        <p className="sj-rec-body">{c.blurb}</p>
        {c.wins.length > 0 && <ul className="sj-rec-list">{c.wins.map(w => <li key={w}>{w}</li>)}</ul>}
        <p className="sj-rec-tags">{c.tags.map(t => <span key={t}>{t}</span>)}</p>
        <Chip>LinkedIn</Chip>
      </>
    )
  }
  if (r.blue) {
    const b = r.blue
    return (
      <>
        <p className="sj-rec-k">BLUE · {b.kind}</p>
        <h3 className="sj-rec-h">{b.name}</h3>
        <p className="sj-rec-body">{b.line}</p>
        {b.facts.length > 0 && <ul className="sj-rec-list">{b.facts.map(w => <li key={w}>{w}</li>)}</ul>}
        <Chip>LinkedIn</Chip>
      </>
    )
  }
  if (r.product) {
    const p = PRODUCT_RECORDS[r.product]
    return (
      <>
        <p className="sj-rec-k">{p.period}</p>
        <h3 className="sj-rec-h">{p.title}</h3>
        <p className="sj-rec-org">{p.sub}</p>
        <p className="sj-rec-body">{p.body}</p>
        {p.list.length > 0 && <ul className="sj-rec-list">{p.list.map(w => <li key={w}>{w}</li>)}</ul>}
        <Chip href={p.url}>{p.source || 'LinkedIn'}</Chip>
      </>
    )
  }
  if (r.edu) {
    const e = r.edu
    return (
      <>
        <p className="sj-rec-k">{e.years}</p>
        <h3 className="sj-rec-h">{e.school}</h3>
        <p className="sj-rec-body">{e.what}{e.note ? `. ${e.note}` : ''}</p>
        <Chip>LinkedIn</Chip>
      </>
    )
  }
  if (node.id === 'subj') {
    return (
      <>
        <p className="sj-rec-k">id 001 · {PROFILE.location}</p>
        <h3 className="sj-rec-h">{PROFILE.name}</h3>
        <p className="sj-rec-body">{PROFILE.bio[0]}</p>
        <Chip>LinkedIn</Chip>
      </>
    )
  }
  const linked = GRAPH_EDGES.filter(e => e[0] === node.id || e[1] === node.id)
  return (
    <>
      <p className="sj-rec-k">organisation</p>
      <h3 className="sj-rec-h">{node.label}</h3>
      {ORG_NOTES[node.id] && <p className="sj-rec-body">{ORG_NOTES[node.id]}</p>}
      <ul className="sj-rec-list">
        {linked.map(([a, b, l]) => <li key={a + b}>{BY_ID[a].label} <i>{l}</i> {BY_ID[b].label}</li>)}
      </ul>
      <Chip>LinkedIn</Chip>
    </>
  )
}

function useGraphScroll(sectionRef, nodesRef, edgesRef, labelsRef, yearRef, countRef, enabled) {
  useEffect(() => {
    if (!enabled) return
    const sec = sectionRef.current
    let top = 0, h = 1, vh = 1
    const measure = () => {
      const r = sec.getBoundingClientRect()
      top = r.top + window.scrollY
      h = r.height
      vh = window.innerHeight
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(sec)
    let lastYear = -1
    const off = subscribe((y) => {
      if (y < top - vh || y > top + h) return false
      const p = Math.max(0, Math.min(1, (y - top + vh * 0.35) / Math.max(1, h - vh * 0.9)))
      const year = Y0 + p * (Y1 - Y0)
      if (Math.abs(year - lastYear) < 0.02) return false
      lastYear = year
      let shown = 0
      nodesRef.current.forEach((el, i) => {
        if (!el) return
        const on = GRAPH_NODES[i].year <= year
        if (on) shown++
        if (el.classList.contains('sj-n-on') !== on) el.classList.toggle('sj-n-on', on)
      })
      let edges = 0
      edgesRef.current.forEach((el, i) => {
        if (!el) return
        const [a, b] = GRAPH_EDGES[i]
        const on = BY_ID[a].year <= year && BY_ID[b].year <= year
        if (on) edges++
        if (el.classList.contains('sj-e-on') !== on) {
          el.classList.toggle('sj-e-on', on)
          labelsRef.current[i]?.classList.toggle('sj-e-on', on)
        }
      })
      if (yearRef.current) yearRef.current.textContent = String(Math.min(2026, Math.floor(year)))
      if (countRef.current) countRef.current.textContent = `nodes ${String(shown).padStart(2, '0')}/${GRAPH_NODES.length} · edges ${String(edges).padStart(2, '0')}/${GRAPH_EDGES.length}`
      return false
    })
    return () => { off(); ro.disconnect() }
  }, [sectionRef, nodesRef, edgesRef, labelsRef, yearRef, countRef, enabled])
}

function Stage({ sel, onPick }) {
  const sectionRef = useRef(null)
  const nodesRef = useRef([])
  const edgesRef = useRef([])
  const labelsRef = useRef([])
  const yearRef = useRef(null)
  const countRef = useRef(null)
  const still = reducedMotion()
  useGraphScroll(sectionRef, nodesRef, edgesRef, labelsRef, yearRef, countRef, !still)
  const node = sel ? BY_ID[sel] : null

  return (
    <section id="sj-identity" ref={sectionRef} className={`sj-sec sj-identity${still ? ' sj-static' : ''}`} aria-labelledby="sj-identity-h">
      <div className="sj-id-pin">
        <div className="sj-flank sj-flank-l sj-id-head">
          <SecHead n={3} act={2} cls="unknown" id="sj-identity-h" label="memories" title={['IDENTITY', 'GRAPH']}
            dek="Every role, company and product, read once into a graph that builds itself. Scroll to add years. Click a node for the record." />
          <p className="sj-id-year"><span ref={yearRef} className="sj-dot">{still ? '2026' : '2014'}</span><span ref={countRef} className="sj-id-count">nodes · edges</span></p>
        </div>

        <aside className={`sj-flank sj-flank-r sj-id-panel${node ? ' sj-id-panel-on' : ''}`} aria-live="polite">
          {node ? (
            <div className="sj-plate sj-rec" key={node.id}>
              <p className="sj-rec-top">
                <span className="sj-tab" data-kind={node.kind}>{KIND_LABEL[node.kind]} · {node.label}</span>
                <button type="button" className="sj-x" onClick={() => onPick(null)} aria-label="Close record">esc</button>
              </p>
              <NodeRecord node={node} />
            </div>
          ) : (
            <div className="sj-plate sj-id-legend">
              <p className="sj-k">legend</p>
              <ul>
                {['person', 'role', 'org', 'product', 'event'].map(k => <li key={k}><span className="sj-tab" data-kind={k}>{KIND_LABEL[k]}</span></li>)}
              </ul>
              <p className="sj-fine">Edges are verbs: <i>built</i>, <i>became</i>, <i>acquired by</i>, <i>spoke at</i>, <i>ambassador for</i>. All of them from LinkedIn.</p>
            </div>
          )}
        </aside>

        <div className="sj-graph" role="group" aria-label="Career graph">
          <svg className="sj-graph-edges" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
            {GRAPH_EDGES.map(([a, b], i) => {
              const A = BY_ID[a], B = BY_ID[b]
              const hot = sel && (a === sel || b === sel)
              return <line key={i} ref={el => { edgesRef.current[i] = el }} className={`sj-edge${hot ? ' sj-edge-hot' : ''}`}
                x1={A.x * 1000} y1={A.y * 1000} x2={B.x * 1000} y2={B.y * 1000} vectorEffect="non-scaling-stroke" />
            })}
          </svg>
          {GRAPH_EDGES.map(([a, b, l, at = 0.5], i) => {
            const A = BY_ID[a], B = BY_ID[b]
            if (!LABELLED.has(i)) return null
            return <span key={`l${i}`} ref={el => { labelsRef.current[i] = el }} className={`sj-edge-l${A.y === B.y ? ' sj-edge-flat' : ''}`} style={{ left: `${(A.x + (B.x - A.x) * at) * 100}%`, top: `${(A.y + (B.y - A.y) * at) * 100}%` }}>{l}</span>
          })}
          {GRAPH_NODES.map((n, i) => (
            <button key={n.id} ref={el => { nodesRef.current[i] = el }} type="button" data-kind={n.kind}
              className={`sj-node${n.l ? ' sj-node-l' : ''}${sel === n.id ? ' sj-node-sel' : ''}`}
              style={{ left: `${n.x * 100}%`, top: `${n.y * 100}%` }}
              onClick={() => onPick(n.id)} aria-pressed={sel === n.id}>
              <span className="sj-node-pt" />
              <span className="sj-node-tab">{n.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

function Chain({ sel, onPick }) {
  const nodes = useMemo(() => [...GRAPH_NODES].sort((a, b) => a.year - b.year), [])
  return (
    <section id="sj-identity" className="sj-sec sj-identity sj-identity-chain" aria-labelledby="sj-identity-h">
      <SecHead n={3} act={2} cls="unknown" id="sj-identity-h" label="memories" title={['IDENTITY', 'GRAPH']}
        dek="Every role, company and product, read once into a chain of records. Tap a node for the record." />
      <ol className="sj-chain sj-plate">
        {nodes.map(n => {
          const out = GRAPH_EDGES.filter(e => e[0] === n.id && e[2] !== 'then')
          const open = sel === n.id
          return (
            <li key={n.id} className={`sj-chain-n${open ? ' sj-chain-open' : ''}`} data-kind={n.kind}>
              <button type="button" className="sj-chain-b" aria-expanded={open} onClick={() => onPick(open ? null : n.id)}>
                <span className="sj-node-pt" />
                <span className="sj-tab" data-kind={n.kind}>{KIND_LABEL[n.kind]}</span>
                <span className="sj-chain-l">{n.label}</span>
                <span className="sj-chain-y">{Math.floor(n.year)}</span>
              </button>
              {out.length > 0 && <p className="sj-chain-e">{out.map(([, b, l]) => <span key={b}><i>{l}</i> → {BY_ID[b].label}</span>)}</p>}
              {open && <div className="sj-rec sj-chain-rec"><NodeRecord node={n} /></div>}
            </li>
          )
        })}
      </ol>
    </section>
  )
}

export default function Identity() {
  const compact = useCompact()
  const [sel, setSel] = useState(null)
  const pick = (id) => {
    setSel(id)
    if (id) remember(`visitor#${getSession().id} reads record ; ${BY_ID[id].label}`)
  }
  useEffect(() => {
    if (!sel) return
    const k = (e) => { if (e.key === 'Escape') setSel(null) }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [sel])
  return compact ? <Chain sel={sel} onPick={pick} /> : <Stage sel={sel} onPick={pick} />
}

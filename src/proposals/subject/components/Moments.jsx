import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import { WRITING } from '../../../content/index.js'
import { scoreEntry } from '../../../shared/utils/fuzzy.js'
import { CLS, SEARCH_INDEX } from '../lib/data.js'
import { noteSearch, commitSearch } from '../lib/session.js'
import { scrollToId } from '../lib/nav.js'
import SecHead from './SecHead.jsx'

const SUGGEST = ['fire', 'jetson', 'memory', 'NASA', 'robot', 'GTC', 'beatbox']
const TYPE_LABEL = { project: 'sighting', blue: 'BLUE', talk: 'signal', writing: 'writing', career: 'record', honour: 'verified', archive: 'archive', offduty: 'off duty' }

function Result({ r, i, onOpen }) {
  const a = r.act
  const inner = (
    <>
      <span className="sj-res-s sj-dot">{r.score != null ? (Math.min(99, r.score) / 100).toFixed(2) : r.meta}</span>
      <span className="sj-res-tab" style={{ '--c': CLS[r.cls] || CLS.unknown }}>{TYPE_LABEL[r.type]}</span>
      <span className="sj-res-x"><b>{r.label}</b><span>{r.sub}</span></span>
      <span className="sj-res-m">{r.score != null ? r.meta : ''}{a.kind === 'link' ? ' ↗' : a.kind === 'none' ? '' : ' →'}</span>
    </>
  )
  const style = { '--i': i }
  if (a.kind === 'link') return <li style={style}><a className="sj-res" href={a.href} target="_blank" rel="noreferrer">{inner}</a></li>
  if (a.kind === 'case') return <li style={style}><button type="button" className="sj-res" onClick={(e) => onOpen(a.slug, e.currentTarget)}>{inner}</button></li>
  if (a.kind === 'scroll') return <li style={style}><button type="button" className="sj-res" onClick={() => scrollToId(a.id)}>{inner}</button></li>
  return <li style={style}><div className="sj-res">{inner}</div></li>
}

const Moments = forwardRef(function Moments({ onOpen }, inputRef) {
  const [q, setQ] = useState('')
  const commitT = useRef(0)
  const results = useMemo(() => {
    const s = q.trim()
    if (!s) return null
    return SEARCH_INDEX
      .map(e => ({ ...e, score: scoreEntry(s, { label: e.label, sub: e.sub, keywords: e.keywords }) }))
      .filter(e => e.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
  }, [q])

  useEffect(() => {
    if (!q.trim()) return
    noteSearch(q)
    clearTimeout(commitT.current)
    commitT.current = setTimeout(() => commitSearch(q), 900)
    return () => clearTimeout(commitT.current)
  }, [q])

  const writing = WRITING.map(w => ({ type: 'writing', cls: 'text', label: w.title, sub: w.pub, meta: w.date.slice(0, 4), act: w.url ? { kind: 'link', href: w.url } : { kind: 'none' } }))
  const list = results || writing

  return (
    <section id="sj-moments" className="sj-sec sj-moments" aria-labelledby="sj-moments-h">
      <div className="sj-flank sj-flank-l">
        <SecHead n={7} act={6} cls="text" id="sj-moments-h" label="moments" title="MOMENTS"
          dek={<>No camera, no hour, just words. Search projects, BLUE, talks, writing, career and honours.</>} />
        <div className="sj-plate sj-search">
          <label htmlFor="sj-q" className="sj-k">query · open vocabulary</label>
          <div className="sj-q-wrap">
            <input id="sj-q" ref={inputRef} className="sj-q" type="search" autoComplete="off" spellCheck="false"
              placeholder="every pink bottle…" value={q} onChange={e => setQ(e.target.value)}
              aria-controls="sj-results" />
            {q && <button type="button" className="sj-x" onClick={() => setQ('')}>clear</button>}
          </div>
          <p className="sj-suggest">
            <span className="sj-k">try</span>
            {SUGGEST.map(s => <button key={s} type="button" className="sj-chip sj-chip-b" onClick={() => setQ(s)}>{s}</button>)}
          </p>
        </div>
      </div>
      <div className="sj-flank sj-flank-r">
        <div className="sj-plate sj-results-wrap">
          <p className="sj-k" aria-live="polite">
            {results ? `${results.length} moment${results.length === 1 ? '' : 's'} · “${q.trim()}” · ranked by match` : `no query · showing writing · ${WRITING.length} entries, newest first`}
          </p>
          {results && results.length === 0 && <p className="sj-empty">Nothing. Either it never happened or he hasn’t told me yet. Try “jetson”.</p>}
          <ol id="sj-results" className="sj-results" key={q.trim() || 'writing'}>
            {list.map((r, i) => <Result key={r.label + i} r={r} i={i} onOpen={onOpen} />)}
          </ol>
        </div>
      </div>
    </section>
  )
})

export default Moments

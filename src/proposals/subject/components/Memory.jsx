import { useEffect, useMemo, useState } from 'react'
import { BLUE_STACK } from '../../../content/index.js'
import { useFilmAct } from '../../shared/useFilm.js'
import { FILM_MEMORY, AGENT_MODES, frameSrc, tc } from '../lib/data.js'
import { getSession, onSession } from '../lib/session.js'
import { scrollToId } from '../lib/nav.js'
import SecHead from './SecHead.jsx'

// The same facts as verbose JSON, so the log can count its own savings.
function asJson(t, row) {
  return row.split(' ; ').map(clause => {
    const [subject, ...rest] = clause.trim().split(' ')
    const at = rest.find(w => w.startsWith('@'))
    return {
      timestamp: `00:${t}`,
      subject,
      predicate: rest.filter(w => !w.startsWith('@'))[0] || null,
      object: rest.filter(w => !w.startsWith('@')).slice(1).join(' ') || null,
      location: at ? at.slice(1) : null,
      camera: 'cam01',
    }
  })
}

function Row({ t, row, live, on }) {
  // colour the entity refs: person#001, visitor#0412, pcb#1 …
  const parts = row.split(/(\S+#\S+|@\S+)/g)
  return (
    <li className={`sj-mrow${live ? ' sj-mrow-live' : ''}${on ? ' sj-mrow-on' : ''}`}>
      <span className="sj-mrow-t">t={t}</span>
      <span className="sj-mrow-x">
        {parts.map((p, i) => (
          /#/.test(p) ? <b key={i} data-ent={p.startsWith('visitor') ? 'v' : p.startsWith('person') ? 'p' : 'o'}>{p}</b>
            : p.startsWith('@') ? <i key={i}>{p}</i> : p
        ))}
      </span>
    </li>
  )
}

export default function Memory() {
  const act = useFilmAct()
  const [log, setLog] = useState(() => getSession().log)
  const [mode, setMode] = useState(0)
  useEffect(() => onSession(S => setLog(S.log)), [])

  const live = log.slice(-6).map(r => ({ t: tc(r.t), row: r.row }))
  const counts = useMemo(() => {
    const rows = [...FILM_MEMORY.map(r => ({ t: r.t, row: r.row })), ...live]
    const dsl = rows.map(r => `t=${r.t} ${r.row}`).join('\n').length
    const json = JSON.stringify(rows.flatMap(r => asJson(r.t, r.row))).length
    return { dsl, json, pct: Math.round((1 - dsl / json) * 100) }
  }, [live])

  const hm = BLUE_STACK[0]
  const agent = BLUE_STACK[1]
  const m = AGENT_MODES[mode]
  const onKey = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault()
      const n = (mode + (e.key === 'ArrowRight' ? 1 : AGENT_MODES.length - 1)) % AGENT_MODES.length
      setMode(n)
      document.getElementById(`sj-mode-${AGENT_MODES[n].key}`)?.focus()
    }
  }

  return (
    <section id="sj-memory" className="sj-sec sj-memory" aria-labelledby="sj-memory-h">
      <div className="sj-flank sj-flank-l">
        <SecHead n={2} act={1} cls="person" id="sj-memory-h" title={['HYPER', 'MEMORY']}
          dek={<>What the model is doing to this page, in real time. <em>{hm.line}</em></>} />

        <div className="sj-plate">
          <p className="sj-k">input · cam01 · 8 clips · read once</p>
          <ol className="sj-strip">
            {FILM_MEMORY.map(r => (
              <li key={r.act} className={act + 1 === r.act ? 'sj-strip-on' : ''}>
                <img src={frameSrc(r.act, 46)} alt="" width="120" height="90" loading="lazy" decoding="async" />
                <span className="sj-strip-t">{r.t}</span>
              </li>
            ))}
          </ol>
          <p className="sj-k sj-k-arrow">output · memory rows · DSL</p>
          <ol className="sj-mlog" aria-label="Memory rows">
            {FILM_MEMORY.map(r => <Row key={r.act} t={r.t} row={r.row} on={act + 1 === r.act} />)}
            {live.map((r, i) => <Row key={`${r.t}-${i}-${r.row}`} t={r.t} row={r.row} live />)}
          </ol>
          <p className="sj-mcount">
            <span>this log <b>{counts.dsl.toLocaleString('en-GB')}</b> chars as DSL</span>
            <span><b>{counts.json.toLocaleString('en-GB')}</b> as JSON</span>
            <span className="sj-mcount-d">−{counts.pct}%</span>
          </p>
          <p className="sj-fine">Hyper Memory’s own DSL does the same to CCTV: {hm.facts[1].replace('Its own DSL: ', '')}. {hm.facts[2]}.</p>
        </div>
      </div>

      <div className="sj-flank sj-flank-r">
        <div className="sj-plate sj-agent">
          <p className="sj-k">BLUE Agent · {agent.kind.toLowerCase()}</p>
          <p className="sj-agent-line">{agent.line}</p>
          <div className="sj-modes" role="tablist" aria-label="BLUE Agent modes" onKeyDown={onKey}>
            {AGENT_MODES.map((x, i) => (
              <button key={x.key} id={`sj-mode-${x.key}`} role="tab" type="button" aria-selected={mode === i}
                aria-controls="sj-mode-panel" tabIndex={mode === i ? 0 : -1}
                className={`sj-mode${mode === i ? ' sj-mode-on' : ''}`} onClick={() => setMode(i)}>
                {x.name}
              </button>
            ))}
          </div>
          <div id="sj-mode-panel" role="tabpanel" aria-labelledby={`sj-mode-${m.key}`} className="sj-mode-panel" key={m.key}>
            <p><span className="sj-k">on this page</span> {m.here}</p>
            <button type="button" className="sj-link" onClick={() => scrollToId(m.target)}>run {m.name.toLowerCase()} ↓</button>
          </div>
          <p className="sj-fine">{agent.facts[1]}. {agent.facts[2]}.</p>
        </div>

        <ol className="sj-records" aria-label="BLUE products">
          {BLUE_STACK.map((b, i) => (
            <li key={b.name} className="sj-record">
              <p className="sj-record-h">
                <span className="sj-tab" style={{ '--c': '#FF3D00' }}>rec {String(i + 1).padStart(2, '0')}</span>
                <b>{b.name}</b>
                <span className="sj-record-kind">{b.kind}</span>
              </p>
              <p className="sj-record-line">{b.line}</p>
              {b.facts.length > 0 && i !== 1 && (
                <ul className="sj-record-facts">{b.facts.map(f => <li key={f}>{f}</li>)}</ul>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

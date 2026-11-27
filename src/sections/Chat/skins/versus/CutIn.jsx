import { useEffect, useRef, useState } from 'react'
import { Streaks } from '../../../../proposals/versus/Art.jsx'
import { reduced, flash } from '../../../../proposals/versus/fx.js'
import { moveOf } from './moves.js'

const DWELL = 1500 // ms per super; a queue plays several back to back
const OUT = 220    // wipe-out when her answer starts landing

/**
 * Super cut-in per tool call: a diagonal strip with her eye line and the
 * Versus section the tool reads from (get_projects → CHARACTER SELECT).
 * Driven by NEW entries in live.tools (live.tool clears within a frame in
 * production). Never replays on remount; cut short when text arrives.
 */
export default function CutIn({ live, loading, onActive }) {
  const seen = useRef({ startedAt: live.startedAt, n: live.tools.length })
  const [queue, setQueue] = useState([])
  const [out, setOut] = useState(false)
  const texting = !!live.content

  useEffect(() => {
    const s = seen.current
    // A new turn starts counting from whatever the engine already holds.
    if (live.startedAt !== s.startedAt) { s.startedAt = live.startedAt; s.n = live.startedAt ? Math.min(s.n, live.tools.length) : live.tools.length }
    if (live.tools.length <= s.n) return
    const base = s.n
    const items = live.tools.slice(base).map((name, i) => ({ name, idx: base + i, key: `${live.startedAt}-${base + i}` }))
    s.n = live.tools.length
    if (reduced()) return
    setQueue(q => [...q, ...items])
  }, [live.tools, live.startedAt])

  const cur = queue[0]

  // Each super holds for DWELL, then the next one in the queue plays.
  useEffect(() => {
    if (!cur) return
    flash(0.32, '#F3FF4A')
    const t = setTimeout(() => { setOut(false); setQueue(q => q.slice(1)) }, DWELL)
    return () => clearTimeout(t)
  }, [cur])

  // Her words land: wipe the current strip out and drop the rest.
  useEffect(() => {
    if (!cur || (!texting && loading)) return
    setOut(true)
    const t = setTimeout(() => { setOut(false); setQueue([]) }, OUT)
    return () => clearTimeout(t)
  }, [texting, loading, cur])

  useEffect(() => { onActive?.(!!cur) }, [cur, onActive])

  if (!cur) return null
  const m = moveOf(cur.name)
  return (
    <div className={`vq-cut${out ? ' is-out' : ''}`} key={cur.key} aria-hidden="true">
      <div className="vq-cut-strip">
        <Streaks className="vq-cut-streaks" seed={cur.idx + 4} count={16} />
        <span className="vq-cut-eyes" />
        <div className="vq-cut-text">
          <span className="vq-cut-kicker">SUPER ART {String(cur.idx + 1).padStart(2, '0')} · {cur.name}</span>
          <span className="vq-cut-name vq-mis" data-text={m.name}>{m.name}</span>
        </div>
      </div>
    </div>
  )
}

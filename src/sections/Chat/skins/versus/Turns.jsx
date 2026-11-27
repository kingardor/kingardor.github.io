import { memo, useEffect, useLayoutEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeBreaks from '../../rehypeBreaks.js'
import remarkGfm from 'remark-gfm'
import ChatBlocks from '../../blocks/ChatBlocks'
import { reduced, shake, flash, SPOT } from '../../../../proposals/versus/fx.js'
import Notation from './Notation.jsx'
import { Face } from './Splash.jsx'
import { moveOf, RENDERABLE, blockCount, wordCount, describe } from './moves.js'

const md = {
  a: ({ href = '', children }) => (
    href.startsWith('#')
      ? <a href={href}>{children}</a>
      : <a href={href} target="_blank" rel="noreferrer">{children}</a>
  ),
  table: ({ children }) => <Chart>{children}</Chart>,
}

/**
 * Markdown tables as a printed frame-data chart. Each cell is tagged with
 * its column's header so a narrow slab can reflow rows into stacked
 * "move cards" (label: value) in CSS.
 */
function Chart({ children }) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const t = ref.current
    if (!t) return
    const heads = [...t.querySelectorAll('thead th')].map(th => th.textContent.trim())
    t.querySelectorAll('tbody tr').forEach(tr => {
      [...tr.children].forEach((td, i) => { if (heads[i]) td.setAttribute('data-label', heads[i]) })
    })
  })
  return <div className="vq-table"><table ref={ref}>{children}</table></div>
}

const Markdown = memo(function Markdown({ text }) {
  return <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeBreaks]} components={md}>{text}</ReactMarkdown>
})

/** P1's question: an ink slab, skewed behind flat text. */
export function UserSlab({ text, round, fresh, id }) {
  return (
    <div className={`vq-you${fresh ? ' is-new' : ''}`} id={id}>
      <span className="vq-you-tag" aria-hidden="true">P1▸</span>
      <span className="vq-sr">You asked:</span>
      <p className="vq-you-text">{text}</p>
      <span className="vq-you-round" aria-hidden="true">R{String(round).padStart(2, '0')}</span>
    </div>
  )
}

/** Her name plate: portrait corner, name, roster number, moves used. */
function Plate({ tools, live }) {
  return (
    <header className="vq-plate">
      <Face className="vq-plate-face" />
      <span className="vq-plate-name">VERONICA</span>
      <span className="vq-plate-no">No.03 · THE QUEEN</span>
      {tools.length > 0 && (
        <ul className="vq-moves" aria-label="Moves used">
          {tools.map((t, i) => {
            const m = moveOf(t)
            return (
              <li key={t} className={`vq-move${live && i === tools.length - 1 ? ' is-new' : ''}`}>
                <Notation input={m.input} small label={describe(m.input)} />
                <span>{m.name}</span>
              </li>
            )
          })}
        </ul>
      )}
    </header>
  )
}

/**
 * Thinking, shown small like a training-mode input display: one row per
 * sentence, stamped with the frame (1/60 s since the question) it began on.
 */
function InputDisplay({ thinking, startedAt }) {
  const rows = (thinking.match(/[^.!?]+(?:[.!?]+|$)/g) || []).filter(r => r.trim())
  // Rows already there when this mounts (a skin switch mid-turn) have no
  // known arrival frame: they show ----F rather than a made-up one.
  const stamps = useRef(null)
  if (!stamps.current) stamps.current = { at: startedAt, list: rows.map(() => null) }
  if (stamps.current.at !== startedAt) stamps.current = { at: startedAt, list: [] }
  const list = stamps.current.list
  rows.forEach((_, i) => {
    if (list[i] === undefined) list[i] = startedAt ? Math.max(0, Math.round((Date.now() - startedAt) * 0.06)) : 0
  })
  const shown = rows.slice(-12) // a fixed-height tail; older rows fade out the top
  const off = rows.length - shown.length
  const logRef = useRef(null)
  useLayoutEffect(() => {
    const el = logRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
    el.classList.toggle('is-over', el.scrollHeight > el.clientHeight + 1)
  }, [thinking])
  return (
    <div className="vq-think" aria-hidden="true">
      <p className="vq-think-k">
        <span className="vq-think-dot" />
        <span>{thinking ? 'INPUT DISPLAY · THINKING' : 'INPUT DISPLAY · READING YOUR MOVE'}</span>
        {thinking && <span className="vq-think-n">{thinking.length.toLocaleString('en')} CH</span>}
      </p>
      <ol className="vq-think-log" ref={logRef}>
        {shown.map((r, i) => (
          <li key={off + i}>
            <span className="vq-think-f">{list[off + i] == null ? '----' : String(list[off + i]).padStart(4, '0')}F</span>
            <span className="vq-think-t">{r.trim()}{i === shown.length - 1 && <span className="vq-caret" />}</span>
          </li>
        ))}
        {!rows.length && <li className="is-wait"><span className="vq-think-f">0000F</span><span className="vq-think-t">WAITING FOR HER FIRST THOUGHT<span className="vq-caret" /></span></li>}
      </ol>
    </div>
  )
}

const secs = (ms) => (ms > 0 ? (ms / 1000).toFixed(ms < 1000 ? 2 : ms < 10000 ? 1 : 0) : null)

/** Real numbers from message.meta: time to first token, stream time, words, tools. */
function FrameData({ meta, stopped }) {
  if (!meta?.startedAt) return null
  const first = meta.firstThinkAt || meta.firstTextAt
  const startup = first ? first - meta.startedAt : 0
  const active = first && meta.doneAt ? meta.doneAt - first : 0
  const cells = [
    ['STARTUP', secs(startup), startup ? `${Math.round(startup / 1000 * 60)}F` : 'NO INPUT'],
    ['ACTIVE', secs(active), active ? `${Math.round(active / 1000 * 60)}F` : '—'],
    ['HITS', String(meta.words ?? 0), 'WORDS'],
    ['MOVES', String(meta.tools?.length ?? 0), meta.tools?.length ? 'TOOLS FIRED' : 'NO TOOLS'],
  ]
  return (
    <table className={`vq-frames${stopped ? ' is-stopped' : ''}`}>
      <caption className="vq-sr">Frame data for this answer</caption>
      <thead><tr>{cells.map(([k]) => <th key={k} scope="col">{k}</th>)}</tr></thead>
      <tbody>
        <tr>
          {cells.map(([k, v, sub]) => (
            <td key={k}>
              <b>{v ?? '—'}{v && (k === 'STARTUP' || k === 'ACTIVE') ? <small>s</small> : null}</b>
              <span>{sub}</span>
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  )
}

/** Each rendered block as a data page with a Versus section tab. */
function Pages({ blocks }) {
  const shown = (blocks || []).filter(b => RENDERABLE.includes(b.type))
  if (!shown.length) return null
  return (
    <div className="vq-pages">
      {shown.map((b, i) => {
        const m = moveOf(b.type)
        return (
          <section className="vq-page" key={i} aria-label={`${m.name}: ${m.page}`}>
            <p className="vq-page-tab"><span>{m.name}</span><small>{m.page}</small></p>
            <div className="vq-page-in">
              <ChatBlocks blocks={[b]} />
            </div>
          </section>
        )
      })}
    </div>
  )
}

/** Blocks that arrived mid-turn, held as chips so nothing shifts. */
function Loaded({ blocks, reserve }) {
  const shown = blocks.filter(b => RENDERABLE.includes(b.type))
  if (!shown.length && !reserve) return null
  return (
    <ul className={`vq-loaded${reserve ? ' is-reserved' : ''}`} aria-hidden="true">
      {shown.map((b, i) => {
        const n = blockCount(b)
        return <li key={i}>{moveOf(b.type).name} LOADED{n ? ` · ${n}` : ''} <span>▾ BELOW WHEN SHE’S DONE</span></li>
      })}
    </ul>
  )
}

/** Combo counter beside the box: words streamed so far. Never on the text. */
function Combo({ words }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!words || reduced()) return
    ref.current?.animate([{ transform: 'scale(1.35) rotate(-4deg)' }, { transform: 'none' }], { duration: 140, easing: 'cubic-bezier(.2,.9,.3,1.4)' })
  }, [words])
  if (!words) return null
  return (
    <div className="vq-combo" aria-hidden="true">
      <span className="vq-combo-n" ref={ref}>{words}</span>
      <span className="vq-combo-hits">{words === 1 ? 'HIT' : 'HITS'}</span>
    </div>
  )
}

function Blocked({ last, onRetry }) {
  return (
    <div className="vq-blocked" role="note">
      <span className="vq-blocked-stamp">BLOCKED!</span>
      <p>You stopped her mid-move. What she’d said is kept.</p>
      {last && <button type="button" className="vq-retry vq-retry-ghost" onClick={onRetry}>REMATCH ▸</button>}
    </div>
  )
}

function KO({ notice, last, onRetry }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!last || reduced()) return
    flash(0.55, SPOT)
    shake(ref.current, 9, 360, 60)
  }, [last])
  return (
    <div className="vq-ko" role="alert" ref={ref}>
      <p className="vq-ko-big"><span className="vq-mis" data-text="CONNECTION K.O.">CONNECTION K.O.</span></p>
      <p className="vq-ko-why">{notice}</p>
      {last && (
        <div className="vq-ko-cont">
          <span className="vq-ko-q">CONTINUE?</span>
          <button type="button" className="vq-retry" onClick={onRetry}>YES · TRY AGAIN ▸</button>
        </div>
      )}
    </div>
  )
}

/** A finished answer: the win-quote box, frame data, then the data pages. */
export const QueenTurn = memo(function QueenTurn({ m, last, onRetry }) {
  const stopped = m.notice === 'INTERRUPTED'
  const failed = !!m.notice && !stopped
  return (
    <article className={`vq-q${stopped ? ' is-stopped' : ''}${failed ? ' is-ko' : ''}`} aria-label="Veronica">
      <Plate tools={m.meta?.tools || []} />
      <div className="vq-box">
        {m.content && <div className="vq-body"><Markdown text={m.content} /></div>}
        {stopped && <Blocked last={last} onRetry={onRetry} />}
        {failed && <KO notice={m.notice} last={last} onRetry={onRetry} />}
        {m.thinking && (
          <details className="vq-log-d">
            <summary>INPUT LOG · {wordCount(m.thinking)} WORDS OF THINKING</summary>
            <p>{m.thinking}</p>
          </details>
        )}
      </div>
      <FrameData meta={m.meta} stopped={stopped || failed} />
      <Pages blocks={m.blocks} />
    </article>
  )
})

/** The turn in flight: plate, input display while she thinks, then her words. */
export function LiveTurn({ live }) {
  const words = wordCount(live.content)
  return (
    <article className="vq-q is-live" aria-hidden="true">
      <Plate tools={live.tools} live />
      <div className="vq-box">
        {live.content
          ? <div className="vq-body is-live"><Markdown text={live.content} /></div>
          : <InputDisplay thinking={live.thinking} startedAt={live.startedAt} />}
        <Loaded blocks={live.blocks} reserve={!live.content} />
      </div>
      <Combo words={words} />
    </article>
  )
}

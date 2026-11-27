// Mint skin: the instruction booklet. Every exchange is a numbered step:
// "YOU ASK:" in ballpoint on a write-in line, then "SHE SAYS:" in a flat
// comic bubble, the parts she fetched, and an accessories tray for blocks.
import { memo, useLayoutEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeBreaks from '../../rehypeBreaks.js'
import remarkGfm from 'remark-gfm'
import ChatBlocks from '../../blocks/ChatBlocks.jsx'
import { CONTENTS, PACKS, TAPES, renderable, turnStats, useNow, secs } from './mintData.js'
import { Battery, PartsBox, SpecLine, Stamp, Tape } from './pieces.jsx'

const DWELL = 1600 // ms a parts call-out stays big after its part arrives

const md = {
  a: ({ href = '', children }) => {
    const ext = /^https?:/i.test(href)
    return (
      <a href={href} {...(ext ? { target: '_blank', rel: 'noreferrer' } : {})}>
        {children}{ext && <span className="mbv-ext" aria-hidden="true"> ↗</span>}
      </a>
    )
  },
  table: ({ children }) => <SpecTable>{children}</SpecTable>,
}

/**
 * Markdown tables print as a spec chart. Each cell learns its column header
 * (data-label), so on a narrow bubble every row can reflow into a stacked
 * card; when a wide table still overflows, a "scroll →" cue shows.
 */
function SpecTable({ children }) {
  const ref = useRef(null)
  // Runs after every render (answers stream in): label the cells, and flag
  // a table that still overflows. DOM-only, so streaming costs no re-render.
  useLayoutEffect(() => {
    const box = ref.current
    if (!box) return
    const heads = [...box.querySelectorAll('thead th')].map(th => th.textContent.trim())
    box.querySelectorAll('tbody tr').forEach(tr => {
      ;[...tr.children].forEach((td, i) => { if (heads[i] && td.dataset.label !== heads[i]) td.dataset.label = heads[i] })
    })
    const over = box.scrollWidth > box.clientWidth + 2
    box.classList.toggle('is-over', over)
    if (over) { box.tabIndex = 0; box.setAttribute('role', 'region'); box.setAttribute('aria-label', 'Table, scrolls sideways') }
  })
  return (
    <div ref={ref} className="mbv-tbl">
      <table>{children}</table>
      <span className="mbv-tbl-cue" aria-hidden="true">SCROLL →</span>
    </div>
  )
}

function Answer({ text }) {
  return (
    <div className="mbv-say">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeBreaks]} components={md}>{text}</ReactMarkdown>
    </div>
  )
}

/** The accessories tray: one moulded well per rendered block. */
function Tray({ blocks }) {
  const items = renderable(blocks)
  if (!items.length) return null
  return (
    <section className="mbv-tray" aria-label={`Accessories included: ${items.length}`}>
      <header className="mbv-tray-h">
        <b>ACCESSORIES INCLUDED</b>
        <span>{items.length} {items.length === 1 ? 'PIECE' : 'PIECES'} · ASSEMBLY NOT REQUIRED</span>
      </header>
      <div className="mbv-tray-wells">
        {items.map((b, i) => (
          <div key={i} className="mbv-well">
            <span className="mbv-well-tag">PART {String.fromCharCode(65 + i)} · {PACKS[b.type]}</span>
            <ChatBlocks blocks={[b]} />
          </div>
        ))}
      </div>
    </section>
  )
}

export function Cover({ onPick }) {
  return (
    <div className="mbv-cover">
      <p className="mbv-cover-k">INSTRUCTION BOOKLET · VERONICA No.03 · EN / ROBOT</p>
      <h2 className="mbv-cover-h">How to talk<br />to Veronica</h2>
      <p className="mbv-cover-sub">She is Akash James’ web twin. She has read his whole site and answers for him, with receipts.</p>
      <ol className="mbv-howto">
        <li><b>1</b><span><strong>Write a question</strong> on the coupon below.</span></li>
        <li><b>2</b><span><strong>Press TRY ME.</strong> Her voice chip warms up while she thinks.</span></li>
        <li><b>3</b><span><strong>She fetches parts</strong> and talks back.</span></li>
      </ol>
      <nav className="mbv-toc" aria-label="Contents: tap a topic to ask her">
        <h3 className="mbv-toc-h"><span>CONTENTS</span><small>TAP A LINE TO ASK</small></h3>
        <ol>
          {CONTENTS.map(([title, q, pg]) => (
            <li key={title}>
              <button type="button" onClick={() => onPick(q)} aria-label={`${title}: ask “${q}”`}>
                <span className="mbv-toc-t">{title}<small>“{q}”</small></span>
                <i className="mbv-toc-lead" aria-hidden="true" />
                <span className="mbv-toc-p" aria-hidden="true">p.{pg}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>
      <Folio n={1} />
    </div>
  )
}

/** Page footer: a folio between two registration ticks. */
export function Folio({ n }) {
  return <p className="mbv-folio" aria-hidden="true"><i />— {n} —<i /></p>
}

/** The step's illustration: her face as a tiny halftone print. */
export function StepGutter({ n }) {
  return (
    <span className="mbv-step-gut" aria-hidden="true">
      <span className="mbv-step-no">{n}</span>
      <span className="mbv-thumb"><img src="/work/veronica/hud.webp" width="1280" height="820" alt="" loading="lazy" decoding="async" /></span>
    </span>
  )
}

/** The rest of the final page: the next step, waiting for the reader. */
export function Ghost({ n, phrases, onPick, busy }) {
  return (
    <section className={`mbv-ghost${busy ? ' is-busy' : ''}`} aria-label={`Step ${n}: your turn`}>
      <p className="mbv-label mbv-label--you">STEP {n} · YOUR TURN</p>
      <p className="mbv-ghost-line">{busy ? 'As soon as she finishes, write your next question on the coupon.' : 'Write your next question on the coupon below, or try one of hers:'}</p>
      {!busy && phrases.length > 0 && (
        <ul className="mbv-ghost-phrases">
          {phrases.map(p => (
            <li key={p}><button type="button" onClick={() => onPick(p)}><q>{p}</q><span aria-hidden="true"> ↵</span></button></li>
          ))}
        </ul>
      )}
      <svg className="mbv-ghost-arrow" viewBox="0 0 90 120" aria-hidden="true">
        <path d="M30 6c-14 18 -16 40 2 56c14 12 30 14 26 34c-2 9 -6 14 -10 18" />
        <path d="M33 103l13 12l9-17" />
      </svg>
    </section>
  )
}

export const UserAsk = memo(function UserAsk({ n, text }) {
  return (
    <div className="mbv-ask">
      <p className="mbv-label mbv-label--you">STEP {n} · YOU ASK:</p>
      <p className="mbv-ask-line">{text}</p>
    </div>
  )
})

/** A finished reply. Memoised: eight turns of markdown don't re-parse per frame. */
export const ModelAnswer = memo(function ModelAnswer({ m, onRetry }) {
  const tools = m.meta?.tools || []
  const received = (m.blocks || []).map(b => b.type)
  const stopped = m.notice === 'INTERRUPTED'
  const failed = !!m.notice && !stopped
  const thinkWords = (m.thinking.match(/\S+/g) || []).length
  const stats = turnStats(m.meta)
  const t = m.meta
  return (
    <div className={`mbv-reply${m.notice ? ' has-notice' : ''}`}>
      <p className="mbv-label mbv-label--she">SHE SAYS:</p>
      {m.thinking && (
        <details className="mbv-log">
          <summary>CHIP LOG · {thinkWords} words of thinking{stats?.thought ? ` · ${secs(stats.thought)} s` : ''}</summary>
          <p>{m.thinking}</p>
        </details>
      )}
      <PartsBox tools={tools} received={received} />
      {m.content && (
        <div className="mbv-bubble">
          <Answer text={m.content} />
        </div>
      )}
      {(stopped || failed) && <Stamp kind={stopped ? 'stopped' : 'error'} detail={failed ? m.notice : ''} onRetry={onRetry} />}
      <Tray blocks={m.blocks} />
      {t?.startedAt && t?.doneAt && (m.content || tools.length) ? (
        <div className="mbv-meter">
          <Tape t0={t.startedAt} thinkAt={t.firstThinkAt} textAt={t.firstTextAt} end={t.doneAt} tools={TAPES.get(t.startedAt) || []} />
          <SpecLine stats={stats} />
        </div>
      ) : null}
    </div>
  )
})

/** The turn in flight: voice chip warming up → parts call-out → she talks. */
export function LiveTurn({ live }) {
  const now = useNow(true, 100)
  const t0 = live.startedAt || now
  const waited = Math.max(0, now - t0)
  const tapes = TAPES.get(live.startedAt) || []
  const lastTool = tapes[tapes.length - 1]
  const received = live.blocks.map(b => b.type)
  const fresh = lastTool && (now - lastTool.at < DWELL || !received.includes(lastTool.name))
  const talking = !!live.content
  const thinkTail = live.thinking.length > 900 ? '…' + live.thinking.slice(-900) : live.thinking
  return (
    <div className="mbv-reply is-live" data-live={talking ? 'talking' : fresh ? 'parts' : 'thinking'}>
      <p className="mbv-label mbv-label--she">SHE SAYS:</p>
      <div className={`mbv-chip${talking ? ' is-spent' : ''}`}>
        <div className="mbv-chip-h">
          <Battery cells={Math.floor(((talking ? live.firstTextAt : now) - t0) / 1000)} />
          <b>{talking ? 'VOICE CHIP: TALKING' : live.thinking ? 'VOICE CHIP WARMING UP…' : 'VOICE CHIP POWERING ON…'}</b>
          <span className="mbv-chip-t">{talking ? <><span className="mbv-hide-sm">thought </span>{secs(live.firstTextAt - (live.firstThinkAt || t0))} s</> : `${secs(waited)} s`}</span>
        </div>
        <div className="mbv-chip-log" aria-hidden="true">
          <p>
            {thinkTail || <span className="mbv-chip-wait">{talking ? 'No thinking on this one.' : 'Waiting for her first thought.'}</span>}
            {!talking && <i className="mbv-caret" />}
          </p>
        </div>
        <div className="mbv-chip-f">
          <Tape t0={t0} thinkAt={live.firstThinkAt} textAt={live.firstTextAt} end={now} tools={tapes} live />
          <span>1 CELL = 1 SECOND · {(live.thinking.match(/\S+/g) || []).length} WORDS THOUGHT</span>
        </div>
      </div>
      <PartsBox tools={live.tools} received={received} big={!!fresh && !talking} />
      {talking && (
        <div className="mbv-bubble is-live">
          <Answer text={live.content} />
          <i className="mbv-caret mbv-caret--ink" aria-hidden="true" />
        </div>
      )}
      <Tray blocks={live.blocks} />
    </div>
  )
}

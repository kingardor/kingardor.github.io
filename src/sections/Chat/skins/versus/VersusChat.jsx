/*
 * VERONICA · VERSUS SKIN: "Training Room vs THE QUEEN"
 * ─────────────────────────────────────────────────────────────────────
 * The visitor is 1P (the challenger); Veronica, roster No.03 THE QUEEN,
 * answers for him. Riso fight-poster chrome around a flat paper answer.
 *
 * DESKTOP (≥1100px)
 *   ┌ HUD ───────────────────────────────────────────────────────────┐
 *   │ ◂EXIT  [1P] YOU  ▮▮▮▯▯▯▯ memory 3/10  │ ∞ / 4.2 │ VERONICA LV3 ▰▰▱ │
 *   ├────────────┬───────────────────────────────────────┬───────────┤
 *   │ INPUT      │  P1 ▸ question slab (skewed plate)     │  her face │
 *   │ HISTORY    │  [face] VERONICA  No.03 · moves used   │  halftone │
 *   │ R01 ↓↘→+Q  │  ┌ paper win-quote box (flat) ──────┐  │  backdrop │
 *   │ R02 …      │  │ answer, 17px, never skewed        │  │  23 HITS  │
 *   │ (click to  │  └──────────────────────────────────┘  │  (combo,  │
 *   │  jump)     │  FRAME DATA: STARTUP ACTIVE HITS MOVES │  streaming│
 *   │            │  data pages (blocks) in ink panels     │  only)    │
 *   │ [edition]  │  ENTER COMMAND ______________ [FIGHT▸] │           │
 *   └────────────┴───────────────────────────────────────┴───────────┘
 *   Tool calls: a diagonal super cut-in strip across the stage.
 *
 * PHONE (390×844, 360×740)
 *   row 1: ◂ back · edition switch (docked in the top bar, not over input)
 *   row 2: compact HUD: 1P memory pips │ timer │ her super meter
 *   one column scroller; the combo sits in her name-plate row; the input
 *   slab is pinned to the bottom with safe-area padding (100dvh).
 * LANDSCAPE PHONE (844×390): one-row top bar (back, HUD, switch), the
 *   splash goes side by side, the rail stays hidden.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import EditionSwitch from '../../../../editions/EditionSwitch.jsx'
import { MAX_TURNS } from '../../useVeronica.js'
import { reduced } from '../../../../proposals/versus/fx.js'
import Splash from './Splash.jsx'
import CutIn from './CutIn.jsx'
import Notation from './Notation.jsx'
import { UserSlab, QueenTurn, LiveTurn } from './Turns.jsx'
import { moveOf } from './moves.js'
import '../../../../proposals/versus/fonts.css'
import './versus-chat.css'

const SUPER_FULL = 1500 // thinking characters for a full super meter
const MEMORY = MAX_TURNS // the engine sends her the last N questions

/** Elapsed seconds while a turn is in flight (a real timer, not a countdown). */
function Clock({ startedAt, loading }) {
  const [now, setNow] = useState(0)
  useEffect(() => {
    if (!loading || !startedAt) return
    const id = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(id)
  }, [loading, startedAt])
  const t = loading && startedAt && now >= startedAt ? (now - startedAt) / 1000 : null
  return (
    <div className="vq-timer" aria-hidden="true">
      <span className="vq-timer-n">{t === null ? '∞' : t.toFixed(t < 10 ? 1 : 0)}</span>
      <span className="vq-timer-k">{t === null ? 'TRAINING' : 'SECONDS'}</span>
    </div>
  )
}

/** Her super meter: thinking characters streamed (labelled), MAX once she speaks. */
function Super({ live, loading }) {
  const chars = live.thinking.length
  const speaking = loading && !!live.content
  // Log scale: a real turn thinks ~2,000 characters; the bar is full at 1,500.
  const fill = !loading ? 0 : speaking ? 1 : Math.min(1, Math.log1p(chars / 60) / Math.log1p(SUPER_FULL / 60))
  const lv = !loading ? 'READY' : speaking || fill >= 1 ? 'MAX' : `LV ${Math.min(7, Math.floor(fill * 8))}`
  const sub = !loading ? 'SUPER · CHARGES AS SHE THINKS'
    : speaking ? `SUPER · SPEAKING` : `SUPER · ${chars} CH OF THINKING`
  return (
    <div className={`vq-p2${speaking || (loading && fill >= 1) ? ' is-max' : ''}${loading ? ' is-on' : ''}`} aria-hidden="true">
      <div className="vq-p2-top">
        <span className="vq-p2-name">VERONICA</span>
        <span className="vq-p2-lv">{lv}</span>
      </div>
      <div className="vq-meter">
        <span className="vq-meter-fill" style={{ transform: `scaleX(${fill.toFixed(3)})` }} />
        <span className="vq-meter-segs" />
      </div>
      <span className="vq-p2-sub">{sub}</span>
    </div>
  )
}

function P1({ rounds }) {
  const inMem = Math.min(MEMORY, rounds)
  return (
    <div className="vq-p1" aria-hidden="true">
      <span className="vq-p1-tag">1P</span>
      <span className="vq-p1-name">YOU</span>
      <span className="vq-pips">
        {Array.from({ length: MEMORY }, (_, i) => <i key={i} className={i < inMem ? 'is-on' : ''} />)}
      </span>
      <span className="vq-p1-sub">IN HER MEMORY {inMem}/{MEMORY}</span>
    </div>
  )
}

/** An element's offset inside the scroller's content. */
function yOf(sc, el) {
  return el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop
}
/** Is most of the last turn's data pages still below the fold? */
function pagesBelow(sc) {
  const pages = sc?.querySelector('.vq-log > :last-child .vq-pages')
  return !!pages && yOf(sc, pages) + pages.offsetHeight > sc.scrollTop + sc.clientHeight + 120
}

function stateOf(v, cutting) {
  if (v.loading) return v.live.content ? 'streaming' : cutting ? 'tool' : 'thinking'
  const last = v.messages[v.messages.length - 1]
  if (!last) return 'empty'
  if (last.role === 'model' && last.notice) return last.notice === 'INTERRUPTED' ? 'stopped' : 'error'
  return 'done'
}

export default function VersusChat({ v, skin, setSkin }) {
  const { messages, live, loading } = v
  const scrollRef = useRef(null)
  const inputRef = useRef(null)
  const atBottom = useRef(true)
  const firstNew = useRef(messages.length) // only messages added after mount animate
  const [pill, setPill] = useState(null) // null | 'new' | 'pages'
  const [cutting, setCutting] = useState(false)

  const state = stateOf(v, cutting)
  const rounds = messages.filter(m => m.role === 'user').length

  // ── scrolling ──
  // While she streams, follow the bottom only if the reader is already there.
  // When a turn lands, keep her answer in view (plate near the top if it
  // fits) instead of jumping to the bottom of the data pages below it.
  const toBottom = useCallback(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
    atBottom.current = true
    setPill(null)
  }, [])
  const landTurn = useCallback(() => {
    const sc = scrollRef.current
    const art = sc?.querySelector('.vq-log > :last-child.vq-q')
    if (!art) { toBottom(); return }
    const top = yOf(sc, art.querySelector('.vq-plate')) - 14
    const endEl = art.querySelector('.vq-frames') || art.querySelector('.vq-box')
    const bottom = yOf(sc, endEl) + endEl.offsetHeight + 14
    if (bottom - top <= sc.clientHeight) sc.scrollTop = top
    else if (bottom < sc.scrollTop + sc.clientHeight) sc.scrollTop = bottom - sc.clientHeight
    // (a long answer keeps the reader where streaming left them: on its end)
    atBottom.current = sc.scrollHeight - sc.scrollTop - sc.clientHeight < 72
    setPill(pagesBelow(sc) ? 'pages' : null)
  }, [toBottom])
  const toPages = () => {
    const sc = scrollRef.current
    const pages = sc?.querySelector('.vq-log > :last-child .vq-pages')
    if (!pages) { toBottom(); return }
    sc.scrollTo({ top: yOf(sc, pages) - 30, behavior: reduced() ? 'auto' : 'smooth' })
    setPill(null)
  }
  const onScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < 72
    atBottom.current = near
    if (near) setPill(null)
    else if (pill === 'pages' && !pagesBelow(el)) setPill(null)
  }
  useLayoutEffect(() => { if (messages.length) landTurn() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // In flight: pin to the bottom, or offer a way back down.
  useLayoutEffect(() => {
    if (!loading) return
    if (atBottom.current) { const el = scrollRef.current; if (el) el.scrollTop = el.scrollHeight }
    else setPill('new')
  }, [live.content, live.thinking, live.tools.length, live.blocks.length, loading])

  // A turn landed (done, stopped, failed, or a retry's answer).
  const seenCount = useRef(messages.length)
  useLayoutEffect(() => {
    const grew = messages.length > seenCount.current
    seenCount.current = messages.length
    if (!grew || loading) return
    if (messages[messages.length - 1]?.role !== 'model') return
    if (atBottom.current) landTurn()
    else setPill('new')
  }, [messages, loading, landTurn])

  // A stopped or failed turn: make sure its retry control is on screen.
  const lastNotice = !loading && messages[messages.length - 1]?.notice
  useLayoutEffect(() => {
    if (!lastNotice) return
    const sc = scrollRef.current
    const btn = sc?.querySelector('.vq-log > :last-child .vq-retry')
    if (!sc || !btn) return
    const r = btn.getBoundingClientRect(), box = sc.getBoundingClientRect()
    if (r.bottom > box.bottom - 12) sc.scrollTop += r.bottom - box.bottom + 24
    else if (r.top < box.top + 12) sc.scrollTop -= box.top - r.top + 24
  }, [lastNotice, messages.length])

  // ── input ──
  const send = (text) => {
    if (loading) return
    const q = (text ?? v.input).trim()
    if (!q) return
    v.send(q)
    atBottom.current = true
    requestAnimationFrame(toBottom)
  }
  const engineRetry = v.retry
  const retry = useCallback(() => { atBottom.current = true; engineRetry() }, [engineRetry])

  useEffect(() => {
    if (window.matchMedia('(pointer: fine)').matches) inputRef.current?.focus({ preventScroll: true })
  }, [])
  useEffect(() => {
    if (!loading) return
    const onKey = (e) => { if (e.key === 'Escape') { e.preventDefault(); v.stop() } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [loading, v])

  // Auto-grow the command slab up to ~5 lines.
  useLayoutEffect(() => {
    const ta = inputRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 132)}px`
  }, [v.input])

  const jump = (i) => {
    const el = document.getElementById(`vq-r${i}`)
    const sc = scrollRef.current
    if (!el || !sc) return
    const top = el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - 16
    const far = Math.abs(top - sc.scrollTop) > sc.clientHeight * 3
    sc.scrollTo({ top, behavior: reduced() || far ? 'auto' : 'smooth' })
  }

  // Turn list: user slabs carry their round number; the rail reads tools from the reply.
  let round = 0
  const history = []
  messages.forEach((m, i) => {
    if (m.role !== 'user') return
    const reply = messages[i + 1]
    history.push({ i, n: history.length + 1, text: m.content, tools: reply?.meta?.tools || (i === messages.length - 1 && loading ? live.tools : []) })
  })
  const lastIdx = messages.length - 1
  const lastModel = [...messages].reverse().find(m => m.role === 'model')

  return (
    <div className="vq" data-state={state} data-skin={skin} data-lenis-prevent>
      <div className="vq-bg" aria-hidden="true">
        <span className="vq-bg-slash vq-bg-slash-a" />
        <span className="vq-bg-slash vq-bg-slash-b" />
        <span className="vq-bg-face"><img src="/work/veronica/hud.webp" width="1280" height="820" alt="" decoding="async" /></span>
        <span className="vq-bg-dots" />
      </div>

      <header className="vq-top">
        <a className="vq-back" href="#/versus"><span aria-hidden="true">◂</span> <span className="vq-back-l">EXIT TRAINING</span><span className="vq-back-s">EXIT</span><span className="vq-sr"> back to the Versus edition</span></a>
        <div className="vq-hud">
          <P1 rounds={rounds} />
          <Clock startedAt={live.startedAt} loading={loading} />
          <Super live={live} loading={loading} />
        </div>
        <div className="vq-dock">
          <EditionSwitch current="versus" onPick={setSkin} always />
        </div>
      </header>

      <aside className="vq-rail" aria-label="Input history">
        <h2 className="vq-rail-h">INPUT HISTORY <span>{rounds}</span></h2>
        {history.length === 0
          ? <p className="vq-rail-empty">NO INPUTS YET. YOUR QUESTIONS LAND HERE, WITH THE MOVES SHE USED.</p>
          : (
            <ol className="vq-rail-list">
              {history.map(h => (
                <li key={h.i}>
                  <button type="button" className={`vq-rail-b${h.i === lastIdx || h.i === lastIdx - 1 ? ' is-last' : ''}`} onClick={() => jump(h.i)}>
                    <span className="vq-rail-n">R{String(h.n).padStart(2, '0')}</span>
                    <span className="vq-rail-t">{h.text}</span>
                    <span className="vq-rail-moves">
                      {h.tools.length
                        ? h.tools.map(t => <Notation key={t} input={moveOf(t).input} small />)
                        : <Notation input={[]} small />}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          )}
      </aside>

      <main className="vq-stage">
        <div className="vq-scroll" ref={scrollRef} onScroll={onScroll} data-lenis-prevent>
          <div className="vq-col">
            {messages.length === 0 && !loading
              ? <Splash suggestions={v.suggestions} onPick={send} disabled={loading} />
              : <p className="vq-round-call" aria-hidden="true">TRAINING ROOM · YOU VS THE QUEEN · NO TIME LIMIT</p>}

            <div className="vq-log" role="log" aria-live="polite" aria-relevant="additions" aria-label="Conversation">
              {messages.map((m, i) => {
                if (m.role === 'user') {
                  round += 1
                  return <UserSlab key={i} id={`vq-r${i}`} text={m.content} round={round} fresh={i >= firstNew.current} />
                }
                return <QueenTurn key={i} m={m} last={i === lastIdx && !loading} onRetry={retry} />
              })}
            </div>
            {loading && <LiveTurn live={live} />}
            <span className="vq-sr" role="status">{loading ? 'Veronica is answering.' : ''}</span>
          </div>
        </div>

        <form className="vq-cmdbar" onSubmit={(e) => { e.preventDefault(); send() }}>
          {pill && (
            <button type="button" className={`vq-pill${pill === 'pages' ? ' is-pages' : ''}`} onClick={pill === 'pages' ? toPages : toBottom}>
              {pill === 'pages' ? 'DATA PAGES ↓' : loading ? 'SHE’S STILL TALKING ↓' : 'NEW MESSAGE ↓'}
            </button>
          )}
          <label className="vq-cmdbar-k" htmlFor="vq-input">ENTER COMMAND</label>
          <div className="vq-cmdbar-row">
            <textarea
              id="vq-input"
              ref={inputRef}
              className="vq-cmdbar-in"
              rows={1}
              value={v.input}
              onChange={(e) => v.setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send() }
              }}
              placeholder={lastModel ? 'Your next move…' : 'Ask her about Akash…'}
              maxLength={2000}
              enterKeyHint="send"
              autoComplete="off"
            />
            {loading
              ? <button type="button" className="vq-go is-block" onClick={v.stop}><span>BLOCK ■</span><small>ESC</small></button>
              : <button type="submit" className="vq-go" disabled={!v.input.trim()}><span>FIGHT ▸</span><small>ENTER</small></button>}
          </div>
        </form>
      </main>

      <CutIn live={live} loading={loading} onActive={setCutting} />
      <div className="vs-flash vq-flash" aria-hidden="true" />
    </div>
  )
}

/**
 * Veronica, Mint in Box skin: "talking figure, box No.03, opened flat".
 *
 * LAYOUT PLAN
 * The screen is her carton, unfolded into a printer's dieline on the garage
 * floor: purple card stock, tuck flaps along the top edge, dashed fold lines
 * between panels, crop marks and a colour bar. The print furniture lives on
 * the panels' edges; the conversation sits on flat paper.
 *
 * Desktop (≥ 1100px), one sheet in three panels under a slim top bar
 * (back link left, edition switch right):
 *   ┌ FRONT (≈27vw) ─┬ BACK: instruction booklet ──────────┬ SIDE (200px) ┐
 *   │ No.03 tab       │ cream booklet, its own scroller     │ spine text    │
 *   │ blister window  │  STEP n · YOU ASK: (ballpoint line) │ COUNTER plate │
 *   │ chrome VERONICA │  SHE SAYS: chip log / parts call-out │ (real session │
 *   │ SAYS 5 burst    │  flat comic bubble, tail → figure   │  numbers)     │
 *   │ speaker grille  │  accessories tray (blocks)          │ age, barcode, │
 *   │  + TRY ME!      │  cassette tape + spec line          │ warning       │
 *   │ her 5 phrases   ├─────────────────────────────────────┤               │
 *   │                 │ MY QUESTION: coupon + TRY ME button │               │
 *   └─────────────────┴─────────────────────────────────────┴───────────────┘
 *   (Between 761 and 1100px the side panel folds away.)
 *
 * Phone portrait (≤ 760px): the front collapses to a header strip (her
 * window, chrome name, speaker grille with TRY ME), under a row holding the
 * back link and the edition switch. The booklet scrolls in the middle; the
 * MY QUESTION coupon is pinned at the bottom (100dvh + safe-area insets).
 * Her phrases move onto the booklet's cover page.
 *
 * Phone landscape (height ≤ 500px): two columns. Left: back link, switch,
 * a small window, the name and grille. Right: booklet over a one-row coupon.
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import EditionSwitch from '../../../../editions/EditionSwitch.jsx'
import { AgeBadge, Barcode, Burst, Chrome, PrintMarks } from '../../../../proposals/mint/parts.jsx'
import { Cover, Folio, Ghost, LiveTurn, ModelAnswer, StepGutter, UserAsk } from './Booklet.jsx'
import Coupon from './Coupon.jsx'
import { Grille, Window } from './pieces.jsx'
import { TAPES, UNTIMED, plain, reducedMotion, secs, turnStats } from './mintData.js'
import './mint-chat.css'

function Counter({ messages }) {
  const s = useMemo(() => {
    let asked = 0, answered = 0, words = 0, parts = 0, fastest = null
    for (const m of messages) {
      if (m.role === 'user') { asked++; continue }
      if (m.content && !m.notice) answered++
      words += m.meta?.words || 0
      parts += m.meta?.tools?.length || 0
      const fw = turnStats(m.meta)?.firstWord
      if (fw != null && (fastest == null || fw < fastest)) fastest = fw
    }
    return { asked, answered, words, parts, fastest }
  }, [messages])
  return (
    <div className="mbv-counter" aria-label="This session, counted">
      <p className="mbv-counter-h"><span>TALK COUNTER</span><span>THIS VISIT</span></p>
      <dl>
        <div><dt>Questions asked</dt><dd>{s.asked}</dd></div>
        <div><dt>Answers given</dt><dd>{s.answered}</dd></div>
        <div><dt>Words spoken</dt><dd>{s.words}</dd></div>
        <div><dt>Parts fetched</dt><dd>{s.parts}</dd></div>
        <div><dt>Fastest first word</dt><dd>{s.fastest == null ? '—' : `${secs(s.fastest)} s`}</dd></div>
      </dl>
      <i className="mbv-rivet" /><i className="mbv-rivet" /><i className="mbv-rivet" /><i className="mbv-rivet" />
    </div>
  )
}

export default function MintChat({ v, setSkin }) {
  const { messages, live, loading, suggestions } = v
  const scRef = useRef(null)
  const endRef = useRef(null)
  const lastStepRef = useRef(null)
  const inputRef = useRef(null)
  const [below, setBelow] = useState(false)
  const [announce, setAnnounce] = useState('')

  // Group into instruction steps: a question and whatever she said back.
  const steps = useMemo(() => {
    const out = []
    messages.forEach((m, i) => {
      if (m.role === 'user' || !out.length) out.push({ n: out.length + 1, user: m.role === 'user' ? m : null, replies: [], key: i })
      if (m.role !== 'user') out[out.length - 1].replies.push({ m, i })
    })
    return out
  }, [messages])

  // Tool timings for the cassette's control track (real arrival times).
  useEffect(() => {
    if (!live.startedAt) return
    if (!UNTIMED.has(live.startedAt)) { UNTIMED.set(live.startedAt, new Set(live.tools)); return }
    const untimed = UNTIMED.get(live.startedAt)
    const arr = TAPES.get(live.startedAt) || []
    for (const name of live.tools) if (!untimed.has(name) && !arr.some(t => t.name === name)) arr.push({ name, at: Date.now() })
    TAPES.set(live.startedAt, arr)
  }, [live.startedAt, live.tools])

  // Booklet height drives the last step's min-height, so a new question can
  // be anchored at the top of the page while her answer grows under it.
  useLayoutEffect(() => {
    const sc = scRef.current
    if (!sc) return
    const set = () => sc.style.setProperty('--bk-h', `${sc.clientHeight}px`)
    set()
    const ro = new ResizeObserver(set)
    ro.observe(sc)
    return () => ro.disconnect()
  }, [])

  const checkBelow = useCallback(() => {
    const sc = scRef.current, end = endRef.current
    if (!sc || !end) return setBelow(false)
    const nearBottom = sc.scrollHeight - sc.scrollTop - sc.clientHeight < 80
    setBelow(!nearBottom && end.getBoundingClientRect().top > sc.getBoundingClientRect().bottom - 16)
  }, [])

  // Mounted onto an existing conversation (a skin switch): open the booklet
  // at the last step, not the first.
  useLayoutEffect(() => {
    const sc = scRef.current, step = lastStepRef.current
    if (!sc || !step) return
    sc.scrollTop = Math.max(0, sc.scrollTop + step.getBoundingClientRect().top - sc.getBoundingClientRect().top - 12)
  }, [])

  // A new question: put its step at the top of the page.
  const last = messages[messages.length - 1]
  useLayoutEffect(() => {
    if (!last || last.role !== 'user') return
    const sc = scRef.current, step = lastStepRef.current
    if (!sc || !step) return
    const top = sc.scrollTop + step.getBoundingClientRect().top - sc.getBoundingClientRect().top - 12
    sc.scrollTo({ top: Math.max(0, top), behavior: reducedMotion() ? 'auto' : 'smooth' })
  }, [last])

  // As her answer grows below the fold, offer the "more below" pill.
  useEffect(() => { checkBelow() }, [live, messages, checkBelow])

  // Announce finished replies (not tokens) to screen readers.
  useEffect(() => {
    if (!last || last.role === 'user') return
    const text = last.content ? `Veronica says: ${plain(last.content)}` : ''
    const note = last.notice === 'INTERRUPTED' ? 'Veronica stopped.' : last.notice ? `Low battery: ${last.notice}` : ''
    setAnnounce([text, note].filter(Boolean).join(' '))
    // A stamp (stopped / low battery) carries the retry: bring it into view.
    if (!last.notice) return
    const id = requestAnimationFrame(() => {
      const sc = scRef.current, st = sc?.querySelector('.mbv-step.is-last .mbv-stamp')
      if (!sc || !st) return
      const d = st.getBoundingClientRect().bottom - sc.getBoundingClientRect().bottom + 20
      if (d > 0) sc.scrollBy({ top: d, behavior: reducedMotion() ? 'auto' : 'smooth' })
    })
    return () => cancelAnimationFrame(id)
  }, [last])

  const ask = useCallback((q) => { if (!loading) { v.send(q); inputRef.current?.focus({ preventScroll: true }) } }, [loading, v])
  const tryMe = useCallback(() => {
    if (loading || !suggestions.length) return
    ask(suggestions[Math.floor(Math.random() * suggestions.length)])
  }, [ask, loading, suggestions])

  const nextPhrases = useMemo(() => {
    const asked = new Set(messages.filter(m => m.role === 'user').map(m => m.content.trim().toLowerCase()))
    return suggestions.filter(p => !asked.has(p.toLowerCase())).slice(0, 3)
  }, [messages, suggestions])

  const lastIdx = messages.length - 1
  const canRetry = !loading && last && last.role !== 'user' && !!last.notice
  const voice = loading ? (live.content ? 'talking' : 'thinking') : (canRetry && last.notice !== 'INTERRUPTED' ? 'error' : 'idle')
  const status = { idle: 'READY. PRESS THE GRILLE', thinking: 'VOICE CHIP WARMING UP', talking: 'TALKING', error: 'LOW BATTERY' }[voice]
  const empty = !messages.length && !loading
  const state = empty ? 'empty' : loading ? (live.content ? 'streaming' : 'thinking') : 'idle'

  return (
    <div className="mbv" data-state={state} data-voice={voice}>
      <div className="mbv-sheet" aria-hidden="true">
        <i className="mbv-crop mbv-crop--tl" /><i className="mbv-crop mbv-crop--tr" /><i className="mbv-crop mbv-crop--bl" /><i className="mbv-crop mbv-crop--br" />
        <span className="mbv-die-note mbv-die-note--b">DIELINE No.03 · VERONICA TALKING FIGURE · PROOF 1 · DO NOT PRINT THIS LAYER</span>
        <PrintMarks className="mbv-marks" />
      </div>

      <header className="mbv-top">
        <a className="mbv-back" href="#/mint"><span aria-hidden="true">‹</span> BACK<span className="mbv-hide-sm"> TO THE BOX</span></a>
        <p className="mbv-top-fine" aria-hidden="true">AKASH JAMES COLLECTIBLES · SERIES 2026 · BOX No.03, OPENED FLAT</p>
        <div className="mbv-switch"><EditionSwitch current="mint" onPick={setSkin} always /></div>
      </header>

      <aside className="mbv-front" aria-label="Veronica, talking figure, box No. 03">
        <div className="mbv-front-tab"><span>AJ COLLECTIBLES</span><span>No. 03/08</span></div>
        <div className="mbv-front-stage">
          <Window />
          <Burst className="mbv-front-burst" fill="#FFD400" ink="#111" points={16}>
            <small>TALKS!</small><b>SAYS {suggestions.length}</b><small>THINGS!</small>
          </Burst>
          <Chrome as="h1" text="VERONICA" className="mbv-logo" />
        </div>
        <p className="mbv-front-tape"><span>TALKING</span> FIGURE<span className="mbv-tape-x"> · HIS WEB TWIN</span></p>
        <div className="mbv-voice">
          <Grille
            state={voice}
            onPress={tryMe}
            disabled={loading}
            label={`Try me: she says one of her ${suggestions.length} phrases`}
          />
          <span className="mbv-tryme" aria-hidden="true">TRY ME!</span>
          <p className="mbv-voice-status" aria-hidden="true"><i />{status}</p>
        </div>
        <div className="mbv-front-phrases">
          <p className="mbv-front-k">SHE SAYS {suggestions.length} THINGS:</p>
          <ul className="mbv-phrases mbv-phrases--box">
            {suggestions.map((p, i) => (
              <li key={p}><button type="button" onClick={() => ask(p)} disabled={loading}><i>{i + 1}</i><q>{p}</q></button></li>
            ))}
          </ul>
        </div>
        <p className="mbv-front-warn">WARNING: contains small agents. Not suitable for clouds.</p>
      </aside>

      <main className="mbv-back-panel">
        <div className="mbv-booklet">
          <div className="mbv-booklet-h" aria-hidden="true">
            <span>INSTRUCTION BOOKLET</span>
            <span>{empty ? 'COVER' : `STEP ${steps.length} OF ${steps.length}`}</span>
          </div>
          <div
            ref={scRef}
            className="mbv-scroll"
            data-lenis-prevent
            tabIndex={0}
            aria-label="Conversation"
            onScroll={checkBelow}
          >
            {empty ? (
              <Cover onPick={ask} />
            ) : (
              <div className="mbv-steps">
                {steps.map((s, si) => {
                  const isLast = si === steps.length - 1
                  const step = (
                    <section key={s.key} ref={isLast ? lastStepRef : undefined} className={`mbv-step${isLast ? ' is-last' : ''}`} aria-label={`Step ${s.n}`}>
                      <StepGutter n={s.n} />
                      <i className="mbv-reg" aria-hidden="true" />
                      <div className="mbv-step-body">
                        {s.user && <UserAsk n={s.n} text={s.user.content} />}
                        {s.replies.map(({ m, i }) => (
                          <ModelAnswer key={i} m={m} onRetry={canRetry && i === lastIdx ? v.retry : undefined} />
                        ))}
                        {isLast && loading && <LiveTurn live={live} />}
                        {isLast && <i ref={endRef} className="mbv-end" />}
                      </div>
                      {!isLast && <Folio n={s.n + 1} />}
                    </section>
                  )
                  if (!isLast) return step
                  // The final page: her answer, then the next step waiting for you.
                  return (
                    <div key={s.key} className="mbv-tail">
                      {step}
                      <Ghost n={s.n + 1} phrases={nextPhrases} onPick={ask} busy={loading} />
                      <Folio n={s.n + 1} />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          <div className="mbv-booklet-f">
            <span aria-hidden="true">VERONICA No.03 · PRINTED IN BENGALURU</span>
            {below && (
              <button type="button" className="mbv-more" onClick={() => {
                const sc = scRef.current, end = endRef.current
                if (sc && end) sc.scrollBy({ top: end.getBoundingClientRect().top - sc.getBoundingClientRect().bottom + 40, behavior: reducedMotion() ? 'auto' : 'smooth' })
              }}>
                MORE BELOW <span aria-hidden="true">↓</span>
              </button>
            )}
          </div>
        </div>
        <Coupon v={v} inputRef={inputRef} />
      </main>

      <aside className="mbv-side" aria-label="Side panel">
        <p className="mbv-spine" aria-hidden="true">VERONICA · TALKING FIGURE · No.03 · NO CLOUD REQUIRED</p>
        <Counter messages={messages} />
        <div className="mbv-side-foot">
          <div className="mbv-side-badges">
            <AgeBadge />
            <p className="mbv-bat-note">BATTERY<br />INCLUDED<br /><small>(ONE, SMALL)</small></p>
          </div>
          <Barcode seed="veronica" className="mbv-barcode" />
          <p className="mbv-side-fine">Answers for Akash James from his own site. She reads the site, not your mind. Colours may vary between editions.</p>
        </div>
      </aside>

      <div className="mbv-sr" role="log" aria-live="polite">{announce}</div>
    </div>
  )
}

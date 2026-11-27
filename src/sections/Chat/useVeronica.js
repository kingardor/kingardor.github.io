import React from 'react'
import { CHAT_SUGGESTIONS } from '../../content/index.js'
import parseSearch from '../../shared/utils/parseSearch'
import { streamChat } from '../../shared/utils/streamChat'
import { mockStream, mockEnabled } from './mockStream.js'

/**
 * useVeronica — the chat engine every Veronica skin shares (classic, Mint in
 * Box, Versus). It owns the conversation, the stream and the seeding rules;
 * skins only render it. Hoist it above the skin and switching skins keeps
 * the conversation.
 *
 *   const v = useVeronica()
 *   v.messages      [{ role: 'user'|'model', content, thinking, blocks, notice, meta }]
 *                   meta (model turns): { startedAt, firstThinkAt, firstTextAt,
 *                   doneAt, tools: [names in order], words } — real timings, ms
 *   v.live          the turn in flight: { content, thinking, blocks, tool, tools,
 *                   startedAt, firstThinkAt, firstTextAt }. content streams as it
 *                   is written (batched per frame).
 *                   Drive tool moments from NEW ENTRIES in live.tools, not from
 *                   live.tool: the Worker sends `tool` and its `block` back to
 *                   back, so live.tool is usually cleared within the same frame.
 *                   Real order: thinking → tool → block → thinking → text → done.
 *   v.loading, v.phase ('idle' | 'loading' | 'error')
 *   v.input, v.setInput, v.send(text), v.stop(), v.retry(), v.suggestions
 *   v.retry()       re-asks the last question after an error/stop, without
 *                   duplicating it in the conversation
 */

const API_BASE = import.meta.env.VITE_API_BASE ?? ''
const SEED_KEY = 'chat:seed'
const MAX_TURNS = 10
const MAX_MSG_CHARS = 4000   // mirrors the Worker's per-message cap
const HISTORY_BUDGET = 48000 // JSON chars, leaves headroom under the 64KB body cap

export const TOOL_LABELS = {
  get_youtube_videos: 'Scanning videos',
  get_projects: 'Loading projects',
  get_skills: 'Reading the skill map',
  get_career_timeline: 'Fetching the timeline',
  get_bio: 'Pulling the bio',
  get_publications: 'Finding articles',
  get_honours: 'Checking honours',
  get_blue_work: 'Opening the BLUE files',
  get_talks: 'Pulling stage time',
}

const EMPTY_LIVE = { content: '', thinking: '', blocks: [], tool: null, tools: [], startedAt: 0, firstThinkAt: 0, firstTextAt: 0 }
const wordCount = (t) => (t.match(/\S+/g) || []).length

// What the model sees of a turn: its prose, or a stand-in when the turn was
// only data blocks / an interruption, so roles keep alternating.
function turnText(m) {
  if (m.content) return m.content
  if (m.role !== 'user' && m.blocks?.length) return `[showed: ${m.blocks.map(b => b.type).join(', ')}]`
  if (m.role !== 'user' && m.notice) return `[${m.notice.toLowerCase()}]`
  return ''
}

// Last MAX_TURNS turns, each capped like the Worker caps them, oldest dropped
// until the JSON fits under the Worker's 64KB body limit. An Owner Mode
// command is pinned so it doesn't silently expire.
export function prepareHistory(history) {
  const arr = Array.isArray(history) ? history : []
  const clean = arr
    .map(m => ({ role: m.role, content: turnText(m).slice(0, MAX_MSG_CHARS) }))
    .filter(m => m.content)
  const base = (clean.length && clean[clean.length - 1]?.role === 'user') ? clean.slice(0, -1) : clean.slice()
  const userIdxs = []
  for (let i = 0; i < base.length; i++) if (base[i]?.role === 'user') userIdxs.push(i)
  let out = userIdxs.length <= MAX_TURNS ? base : base.slice(userIdxs[userIdxs.length - MAX_TURNS])
  while (out.length > 1 && JSON.stringify(out).length > HISTORY_BUDGET) out = out.slice(1)
  const admin = [...base].reverse().find(m => m.role === 'user' && /^\/admin\b/i.test(m.content.trim()))
  if (admin && !out.includes(admin)) out = [admin, ...out]
  return out
}

// Drop the consumed ?q= but keep the view's own flags (skin, mock).
function stripQueryFromHash() {
  const keep = (location.hash.split('?')[1] || '').split('&').filter(kv => /^(skin|mock)=/.test(kv))
  const next = '#/chat' + (keep.length ? `?${keep.join('&')}` : '')
  if (location.hash !== next) { try { history.replaceState(null, '', next) } catch { /* ignore */ } }
}

export default function useVeronica() {
  const [messages, setMessages] = React.useState([])
  const [input, setInput] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [phase, setPhase] = React.useState('idle')
  const [live, setLive] = React.useState(EMPTY_LIVE)
  const phaseTimerRef = React.useRef(null)
  const streamRef = React.useRef(null)
  const pendingRef = React.useRef({ ...EMPTY_LIVE, error: '' })
  const frameRef = React.useRef(0)
  const lastSeedRef = React.useRef('')
  const seededOnceRef = React.useRef(false)

  // Many text events can arrive per frame: publish the turn at most once a frame.
  const publish = React.useCallback(() => {
    if (frameRef.current) return
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0
      const p = pendingRef.current
      setLive({ content: p.content, thinking: p.thinking, blocks: p.blocks.slice(), tool: p.tool, tools: p.tools.slice(), startedAt: p.startedAt, firstThinkAt: p.firstThinkAt, firstTextAt: p.firstTextAt })
    })
  }, [])

  // Ends the current turn. Whatever already streamed is kept as the reply —
  // a stop, timeout or dropped connection never throws an answer away.
  const finishTurn = React.useCallback((notice, next = 'idle') => {
    streamRef.current = null
    cancelAnimationFrame(frameRef.current); frameRef.current = 0
    setLoading(false)
    setLive(EMPTY_LIVE)
    clearTimeout(phaseTimerRef.current)
    setPhase(next)
    if (next === 'error') phaseTimerRef.current = setTimeout(() => setPhase('idle'), 2500)
    const { content, thinking, blocks, error, tools, startedAt, firstThinkAt, firstTextAt } = pendingRef.current
    pendingRef.current = { ...EMPTY_LIVE, error: '' }
    const note = error || notice || ''
    if (content || blocks.length || thinking || note) {
      const meta = { startedAt, firstThinkAt, firstTextAt, doneAt: Date.now(), tools, words: wordCount(content) }
      setMessages(m => [...m, { role: 'model', content, thinking, blocks, notice: note, meta }])
    }
  }, [])

  const stop = React.useCallback(() => {
    if (!streamRef.current) return
    try { streamRef.current.close() } catch { /* already closed */ }
    finishTurn('INTERRUPTED')
  }, [finishTurn])

  // Streams an answer to q, given the conversation that precedes it.
  const stream = React.useCallback((q, before) => {
    try { streamRef.current?.close?.() } catch { /* already closed */ }
    streamRef.current = null
    setLoading(true)
    clearTimeout(phaseTimerRef.current)
    setPhase('loading')
    pendingRef.current = { ...EMPTY_LIVE, error: '', startedAt: Date.now() }
    setLive({ ...EMPTY_LIVE, startedAt: pendingRef.current.startedAt })
    const turnsHistory = prepareHistory(before.concat({ role: 'user', content: q, thinking: '', blocks: [] }))
    const run = mockEnabled() ? mockStream : streamChat
    streamRef.current = run({
      base: API_BASE,
      text: q,
      history: turnsHistory,
      onEvent: (event) => {
        const p = pendingRef.current
        if (event.t === 'text') {
          if (!p.firstTextAt) p.firstTextAt = Date.now()
          p.content += event.v
        } else if (event.t === 'thinking') {
          if (!p.firstThinkAt) p.firstThinkAt = Date.now()
          p.thinking += event.v
        } else if (event.t === 'tool') {
          p.tool = { name: event.name, label: TOOL_LABELS[event.name] || 'Working' }
          if (!p.tools.includes(event.name)) p.tools.push(event.name)
        } else if (event.t === 'block') {
          p.blocks.push({ type: event.name, data: event.data })
          p.tool = null
        } else if (event.t === 'error') p.error = event.v
        publish()
      },
      onDone: () => finishTurn('', pendingRef.current.error ? 'error' : 'idle'),
      onError: (err) => finishTurn(err?.message || 'Veronica is unavailable right now.', 'error'),
    })
  }, [finishTurn, publish])

  const send = React.useCallback((text) => {
    const q = (text || '').trim()
    if (!q || loading) return
    setMessages(m => [...m, { role: 'user', content: q, thinking: '', blocks: [] }])
    setInput('')
    stream(q, messages)
  }, [loading, messages, stream])

  // Re-asks the last question after an error or a stop: the failed reply is
  // dropped and the question is not duplicated.
  const retry = React.useCallback(() => {
    if (loading) return
    let i = messages.length - 1
    if (i >= 0 && messages[i].role === 'model' && messages[i].notice) i -= 1
    if (i < 0 || messages[i].role !== 'user') return
    const before = messages.slice(0, i)
    setMessages(messages.slice(0, i + 1))
    stream(messages[i].content, before)
  }, [loading, messages, stream])

  // The hero prompt bar and ⌘K stash their question in sessionStorage before
  // navigating, so a stashed seed is the visitor's own words: send it. A bare
  // `?q=` can come from any third-party link, so it only pre-fills the input.
  const seedFromAny = React.useCallback(() => {
    if (seededOnceRef.current) return
    const q = (parseSearch(location.hash.split('?')[1] || '').q || '').trim()
    let stash = ''
    try { stash = (sessionStorage.getItem(SEED_KEY) || '').trim() } catch { /* private mode */ }
    const seed = stash || q
    if (seed && seed !== lastSeedRef.current) {
      lastSeedRef.current = seed
      try { sessionStorage.removeItem(SEED_KEY) } catch { /* private mode */ }
      seededOnceRef.current = true
      if (stash) setTimeout(() => send(stash), 0)
      else setInput(q.slice(0, 2000))
      stripQueryFromHash()
    }
  }, [send])

  React.useLayoutEffect(() => {
    seedFromAny()
    const t1 = setTimeout(seedFromAny, 120)
    const t2 = setTimeout(seedFromAny, 360)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [seedFromAny])

  React.useEffect(() => {
    const onHash = () => { seededOnceRef.current = false; seedFromAny() }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [seedFromAny])

  React.useEffect(() => () => {
    try { streamRef.current?.close?.() } catch { /* already closed */ }
    clearTimeout(phaseTimerRef.current)
    cancelAnimationFrame(frameRef.current)
  }, [])

  return { messages, input, setInput, loading, phase, live, send, stop, retry, suggestions: CHAT_SUGGESTIONS }
}

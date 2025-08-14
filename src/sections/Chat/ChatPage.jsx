import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ASSISTANT } from '../../data'
import parseSearch from '../../utils/parseSearch'
import VantaHalo from './VantaHalo'
import { openSSE } from '../../utils/openSSE'

const API_BASE = ('https://veronica-proxy-vercel.vercel.app').replace(/\/$/, '')
const HISTORY_KEY = 'chat:history:v1'
const SEED_KEY = 'chat:seed'
const MAX_TURNS = 10

function isHardReload() {
  try {
    const nav = performance.getEntriesByType?.('navigation')?.[0]
    if (nav) return nav.type === 'reload'
    return performance.navigation && performance.navigation.type === 1
  } catch { return false }
}

// keep only last N user turns (messages after the Nth-last user)
function prepareHistory(history) {
  const arr = Array.isArray(history) ? history : []
  const base = (arr.length && arr[arr.length - 1]?.role === 'user') ? arr.slice(0, -1) : arr.slice()
  const userIdxs = []
  for (let i = 0; i < base.length; i++) if (base[i]?.role === 'user') userIdxs.push(i)
  if (userIdxs.length <= MAX_TURNS) return base
  const start = userIdxs[userIdxs.length - MAX_TURNS]
  return base.slice(start)
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="h-1.5 w-1.5 rounded-full bg-zinc-300 animate-bounce [animation-delay:-0.2s]" />
      <span className="h-1.5 w-1.5 rounded-full bg-zinc-300 animate-bounce [animation-delay:-0.1s]" />
      <span className="h-1.5 w-1.5 rounded-full bg-zinc-300 animate-bounce" />
    </span>
  )
}

// Remove ?q=... from the hash so refresh won't re-trigger a seed
function stripQueryFromHash() {
  const base = '#/chat'
  if (location.hash !== base) {
    try { history.replaceState(null, '', base) } catch {}
  }
}

function HeaderStatus({ loading }) {
  return (
    <div className="text-sm text-zinc-400 flex items-center gap-2">
      {loading ? (
        <>
          <span className="relative flex items-center gap-1">
            <span>Thinking</span>
            <span className="flex gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.2s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.1s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce" />
            </span>
          </span>
        </>
      ) : (
        <span className="animate-pulse">Chat with {ASSISTANT.name}…</span>
      )}
    </div>
  )
}

export default function ChatPage() {
  const [messages, setMessages] = React.useState(() => {
    try {
      if (isHardReload()) {
        sessionStorage.removeItem(HISTORY_KEY)
        sessionStorage.removeItem(SEED_KEY) // also drop any stale seed
      }
      return JSON.parse(sessionStorage.getItem(HISTORY_KEY) || '[]')
    } catch { return [] }
  })
  const [input, setInput] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const streamRef = React.useRef(null)
  const lastSeedRef = React.useRef('')
  const seededOnceRef = React.useRef(false)
  const endRef = React.useRef(null)

  // auto-save + scroll to bottom on each render that changes messages
  React.useEffect(() => {
    try { sessionStorage.setItem(HISTORY_KEY, JSON.stringify(messages)) } catch {}
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  // while streaming, also scroll as content grows (even if length doesn't change)
  const tailContent = messages.length ? messages[messages.length - 1]?.content || '' : ''
  React.useEffect(() => {
    if (loading) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [tailContent, loading])

  const stop = React.useCallback(() => {
    try { streamRef.current?.close?.() } catch {}
    streamRef.current = null
    setLoading(false)
    setMessages(m => {
      if (!m.length) return m
      const last = m[m.length - 1]
      if (last.role === 'model' && !last.content) return m.slice(0, -1) // remove empty bubble
      return m
    })
  }, [])

  const appendUser = (text) => setMessages(m => [...m, { role: 'user', content: text }])
  const beginAssistant = () => {
    let idx = -1
    setMessages(m => (idx = m.length, [...m, { role: 'model', content: '' }]))
    return () => idx
  }
  const patchAssistant = (idx, chunk) => {
    setMessages(m => {
      const next = m.slice()
      const cur = next[idx] || { role: 'model', content: '' }
      next[idx] = { ...cur, content: (cur.content || '') + chunk }
      return next
    })
  }

  const send = React.useCallback(async (text, { skipAppendUser = false } = {}) => {
    const q = (text || '').trim()
    if (!q || loading) return

    try { streamRef.current?.close?.() } catch {}
    streamRef.current = null

    if (!skipAppendUser) appendUser(q)
    setInput('')
    setLoading(true)

    const getIdx = beginAssistant()
    const turnsHistory = prepareHistory(messages.concat({ role: 'user', content: q }))

    const handle = openSSE({
      base: API_BASE,
      text: q,
      history: turnsHistory,
      onMessage: (data) => {
        if (data === '[DONE]') { stop(); return }
        const idx = getIdx()
        patchAssistant(idx, data)
      },
      onDone: () => { streamRef.current = null; setLoading(false) },
      onError: () => { streamRef.current = null; setLoading(false); stop() },
    })
    streamRef.current = handle
  }, [loading, messages, stop])

  // Seed + send immediately; then strip ?q= so refresh won't resend
  const seedFromAny = React.useCallback(() => {
    if (seededOnceRef.current) return
    const q = parseSearch(location.hash.split('?')[1] || '').q || ''
    const stash = sessionStorage.getItem(SEED_KEY) || ''
    const seed = (q || stash).trim()
    if (seed && seed !== lastSeedRef.current) {
      lastSeedRef.current = seed
      try { sessionStorage.removeItem(SEED_KEY) } catch {}
      seededOnceRef.current = true
      setTimeout(() => send(seed), 0)
      // important: remove the query param so refresh won't re-trigger
      stripQueryFromHash()
    }
  }, [send])

  React.useLayoutEffect(() => {
    seedFromAny()
    // small retries to defeat edge timing between hash → mount
    const t1 = setTimeout(seedFromAny, 120)
    const t2 = setTimeout(seedFromAny, 360)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [seedFromAny])

  // New navigations from hero (new prompts) → allow a fresh seed each time
  React.useEffect(() => {
    const onHash = () => {
      seededOnceRef.current = false
      seedFromAny()
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [seedFromAny])

  // Close stream on unmount
  React.useEffect(() => () => { try { streamRef.current?.close?.() } catch {} }, [])

  return (
    <div className="min-h-screen bg-transparent text-zinc-100">
      <VantaHalo boost={loading} />
      <div className="relative mx-auto max-w-3xl px-4 pt-6 pb-24">
        <div className="mb-6 flex items-center justify-between">
          <a href="#/" className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10">← Home</a>
          <HeaderStatus loading={loading} />
        </div>
        <div className="space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
              <div className={
                'inline-block max-w-[85%] rounded-2xl px-4 py-2 text-sm sm:text-base ' +
                (m.role === 'user'
                  ? 'bg-fuchsia-700/30 border border-fuchsia-500/40'
                  : 'bg-zinc-800/90 border border-zinc-700')
              }>
                {m.role === 'model'
                  ? (
                    m.content
                      ? (
                          <div className="prose prose-invert max-w-none whitespace-pre-wrap break-words">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                a: (props) => <a {...props} target="_blank" rel="noreferrer" />,
                                code: ({inline, children, ...p}) =>
                                  inline
                                    ? <code {...p}>{children}</code>
                                    : <code {...p} className="block whitespace-pre-wrap break-words">{children}</code>
                              }}
                            >
                              {m.content}
                            </ReactMarkdown>
                          </div>
                        )
                      : <TypingDots />
                  )
                  : m.content}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* composer */}
        <div className="fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#0b0b0e] to-transparent pb-[env(safe-area-inset-bottom)]">
          <div className="mx-auto max-w-3xl px-4 pb-6">
            <form
              onSubmit={(e)=>{ e.preventDefault(); const t = input; setInput(''); send(t) }}
              className="relative rounded-2xl bg-zinc-900/85 backdrop-blur border border-white/10 px-4 py-3"
            >
              <input
                value={input}
                onChange={(e)=>setInput(e.target.value)}
                placeholder={`Message ${ASSISTANT.name}…`}
                className="w-full bg-transparent outline-none text-zinc-100 placeholder:text-zinc-400 text-[16px] sm:text-base"
                autoComplete="off"
                spellCheck={false}
              />
              {/* external action button lives outside in your hero; keep pill clean here */}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

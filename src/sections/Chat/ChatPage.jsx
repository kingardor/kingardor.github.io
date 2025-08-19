import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ASSISTANT } from '../../data'
import parseSearch from '../../shared/utils/parseSearch'
import { openSSE } from '../../shared/utils/openSSE'

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
    <div className="flex items-center gap-2">
      <div
        className={
          "flex items-center gap-2 px-4 py-1.5 rounded-full shadow-lg border border-white/10 backdrop-blur-lg " +
          (loading
            ? "bg-gradient-to-r from-fuchsia-700/60 to-indigo-700/60 animate-pulse"
            : "bg-zinc-900/70")
        }
        style={{
          minWidth: 0,
          fontWeight: 500,
          fontSize: "1rem",
          color: "#fff",
          boxShadow: loading
            ? "0 0 16px 2px rgba(236,72,153,0.18), 0 1.5px 8px 0 rgba(99,102,241,0.12)"
            : "0 1.5px 8px 0 rgba(99,102,241,0.08)",
        }}
      >
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-500 shadow border border-white/20 mr-2">
          {loading ? (
            <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
            </svg>
          ) : (
            <span role="img" aria-label="Chat">💬</span>
          )}
        </span>
        <span className="truncate">
          {loading ? (
            <>
              Thinking...
            </>
          ) : (
            <>Chat with {ASSISTANT.name}…</>
          )}
        </span>
      </div>
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
      <div className="relative mx-auto max-w-3xl px-4 pt-3 pb-6 flex flex-col h-[calc(100vh-4rem)]">
        <div className="mb-6 flex items-center justify-between">
          <a href="#/" className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10">← Home</a>
          <HeaderStatus loading={loading} />
        </div>
        <div className="flex-1 overflow-y-auto space-y-4">
          {messages.map((m, i) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={i}
                className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'} animate-fadein`}
              >
                {!isUser && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-500 shadow-lg border-2 border-white/30 flex items-center justify-center text-lg font-bold select-none">
                    <span role="img" aria-label="AI">🤖</span>
                  </div>
                )}
                <div
                  className={
                    'relative max-w-[80%] rounded-2xl px-5 py-3 text-sm sm:text-base shadow-xl backdrop-blur-lg transition-all duration-300 ' +
                    (isUser
                      ? 'bg-fuchsia-700/40 border border-fuchsia-400/40 text-zinc-100 glassmorphism-user'
                      : 'bg-zinc-900/60 border border-indigo-400/30 text-zinc-100 glassmorphism-ai')
                  }
                  style={{
                    boxShadow: isUser
                      ? '0 4px 32px 0 rgba(236,72,153,0.18), 0 1.5px 8px 0 rgba(236,72,153,0.12)'
                      : '0 4px 32px 0 rgba(99,102,241,0.18), 0 1.5px 8px 0 rgba(99,102,241,0.12)',
                    border: isUser
                      ? '1.5px solid rgba(236,72,153,0.25)'
                      : '1.5px solid rgba(99,102,241,0.18)',
                    backdropFilter: 'blur(16px) saturate(1.5)',
                    background: isUser
                      ? 'linear-gradient(135deg,rgba(236,72,153,0.22),rgba(168,85,247,0.18))'
                      : 'linear-gradient(135deg,rgba(39,39,42,0.65),rgba(99,102,241,0.13))',
                  }}
                >
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
                {isUser && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-500 to-pink-400 shadow-lg border-2 border-white/30 flex items-center justify-center text-lg font-bold select-none">
                    <span role="img" aria-label="User">🧑‍💻</span>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        {/* composer */}
        <div className="fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#0b0b0e] to-transparent pb-[env(safe-area-inset-bottom)]">
          <div className="mx-auto max-w-3xl px-4 pb-6">
            <form
              onSubmit={(e)=>{ e.preventDefault(); const t = input; setInput(''); send(t) }}
              className="relative flex items-center gap-2 rounded-2xl bg-zinc-900/80 backdrop-blur-lg border border-white/10 px-4 py-3 shadow-2xl"
              style={{
                boxShadow: '0 8px 32px 0 rgba(168,85,247,0.18), 0 1.5px 8px 0 rgba(236,72,153,0.12)',
                backdropFilter: 'blur(18px) saturate(1.5)',
              }}
            >
              <input
                value={input}
                onChange={(e)=>setInput(e.target.value)}
                placeholder={`Message ${ASSISTANT.name}…`}
                className="w-full bg-transparent outline-none text-zinc-100 placeholder:text-zinc-400 text-[16px] sm:text-base"
                autoComplete="off"
                spellCheck={false}
                style={{
                  paddingRight: '3rem'
                }}
              />
              <button
                type="submit"
                className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-500 shadow-lg hover:scale-110 transition-transform duration-150 active:scale-95 focus:outline-none"
                tabIndex={0}
                aria-label="Send"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

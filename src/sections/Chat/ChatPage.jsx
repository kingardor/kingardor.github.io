import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowUp, Square, User } from 'lucide-react'
import { ASSISTANT, CHAT_SUGGESTIONS } from '../../data'
import parseSearch from '../../shared/utils/parseSearch'
import { openSSE } from '../../shared/utils/openSSE'
import ChatBackground from '../../shared/components/ChatBackground'
import ThinkingBlock from './components/ThinkingBlock'
import ChatBlocks    from './blocks/ChatBlocks'

const API_BASE = 'https://veronica-proxy-vercel.vercel.app'
const HISTORY_KEY = 'chat:history:v1'
const SEED_KEY = 'chat:seed'
const MAX_TURNS = 10

const TOOL_STATUS_LABELS = {
  get_youtube_videos:  'SCANNING VIDEOS...',
  get_projects:        'LOADING PROJECTS...',
  get_skills:          'READING SKILL MAP...',
  get_career_timeline: 'FETCHING TIMELINE...',
  get_bio:             'PULLING BIO...',
  get_publications:    'FINDING ARTICLES...',
  get_honours:         'CHECKING HONOURS...',
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function isHardReload() {
  try {
    const nav = performance.getEntriesByType?.('navigation')?.[0]
    if (nav) return nav.type === 'reload'
    return performance.navigation && performance.navigation.type === 1
  } catch { return false }
}
function prepareHistory(history) {
  const arr = Array.isArray(history) ? history : []
  // Strip blocks and thinking — only prose content goes to API
  const clean = arr.map(m => ({ role: m.role, content: m.content || '' }))
  const base = (clean.length && clean[clean.length - 1]?.role === 'user') ? clean.slice(0, -1) : clean.slice()
  const userIdxs = []
  for (let i = 0; i < base.length; i++) if (base[i]?.role === 'user') userIdxs.push(i)
  if (userIdxs.length <= MAX_TURNS) return base
  return base.slice(userIdxs[userIdxs.length - MAX_TURNS])
}
function stripQueryFromHash() {
  if (location.hash !== '#/chat') { try { history.replaceState(null, '', '#/chat') } catch {} }
}

/* ─── Veronica "V" sigil ─────────────────────────────────────────────────── */
function VIcon({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 5L12 20L21 5" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 5L12 14L17 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
    </svg>
  )
}

/* ─── Typing indicator ───────────────────────────────────────────────────── */
function TypingIndicator({ label = 'COMPUTING' }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="hud-text" style={{ fontSize: '0.58rem', color: 'var(--nm-text-muted)', letterSpacing: '0.12em' }}>
        {label}
      </span>
      <span className="inline-flex items-center gap-1">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              width: 4, height: 4,
              borderRadius: '50%',
              background: 'var(--nm-accent)',
              animation: 'blink 1.2s step-end infinite',
              animationDelay: `${i * 0.25}s`,
            }}
          />
        ))}
      </span>
    </span>
  )
}

/* ─── Markdown renderer ──────────────────────────────────────────────────── */
const mdComponents = {
  p:          ({ children })           => <p style={{ marginBottom: '0.6em', lineHeight: 1.7, color: 'var(--nm-text)' }}>{children}</p>,
  strong:     ({ children })           => <strong style={{ fontWeight: 700, color: 'var(--nm-text)' }}>{children}</strong>,
  em:         ({ children })           => <em style={{ color: 'var(--nm-text-muted)' }}>{children}</em>,
  a:          ({ href, children })     => <a href={href} target="_blank" rel="noreferrer" style={{ color: 'var(--nm-accent)', textDecoration: 'underline' }}>{children}</a>,
  ul:         ({ children })           => <ul style={{ paddingLeft: '1.2em', marginBottom: '0.6em' }}>{children}</ul>,
  ol:         ({ children })           => <ol style={{ paddingLeft: '1.2em', marginBottom: '0.6em' }}>{children}</ol>,
  li:         ({ children })           => <li style={{ marginBottom: '0.25em', color: 'var(--nm-text)', lineHeight: 1.6 }}>{children}</li>,
  h1:         ({ children })           => <h1 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.25em', color: 'var(--nm-text)', margin: '0.8em 0 0.4em' }}>{children}</h1>,
  h2:         ({ children })           => <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.1em',  color: 'var(--nm-text)', margin: '0.7em 0 0.35em' }}>{children}</h2>,
  h3:         ({ children })           => <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1em',    color: 'var(--nm-text)', margin: '0.6em 0 0.3em' }}>{children}</h3>,
  hr:         ()                       => <hr style={{ border: 'none', borderTop: '1px solid var(--nm-border)', margin: '0.75em 0' }} />,
  blockquote: ({ children })           => <blockquote style={{ borderLeft: '2px solid var(--nm-accent)', paddingLeft: '0.75em', color: 'var(--nm-text-muted)', margin: '0.5em 0' }}>{children}</blockquote>,
  table: ({ children }) => (
    <div style={{ overflowX: 'auto', margin: '0.5em 0' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.82rem' }}>{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead>{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr style={{ borderBottom: '1px solid var(--nm-border)' }}>{children}</tr>,
  th: ({ children }) => (
    <th style={{ padding: '0.4em 0.75em', textAlign: 'left', color: 'var(--nm-text)', fontWeight: 700, background: 'var(--nm-surface-2)', whiteSpace: 'nowrap' }}>
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td style={{ padding: '0.35em 0.75em', color: 'var(--nm-text-muted)', borderBottom: '1px solid var(--nm-border)' }}>
      {children}
    </td>
  ),
  code: ({ inline, children, ...p }) =>
    inline
      ? <code {...p} style={{ background: 'var(--nm-surface-2)', color: 'var(--nm-accent)', padding: '0.1em 0.4em', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: '0.85em' }}>{children}</code>
      : <pre style={{ background: 'var(--nm-bg)', border: '1px solid var(--nm-border)', borderRadius: 8, padding: '0.75rem', margin: '0.5em 0', overflow: 'auto' }}>
          <code {...p} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78em', whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--nm-text)' }}>{children}</code>
        </pre>,
}

/* ─── Empty / onboarding state ───────────────────────────────────────────── */
function EmptyState({ onSuggest }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full py-12 text-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Sigil */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--nm-accent), var(--nm-accent-2))',
          boxShadow: '0 0 48px rgba(220,38,38,0.35), 0 0 96px rgba(220,38,38,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <VIcon size={30} color="#fff" />
      </motion.div>

      {/* Name + subtitle */}
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.15 }}
      >
        <h1 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 900, fontSize: 'clamp(1.8rem, 6vw, 2.8rem)', color: 'var(--nm-text)', letterSpacing: '-0.04em', lineHeight: 1 }}>
          {ASSISTANT.name}
        </h1>
        <div className="hud-text mt-2" style={{ fontSize: '0.56rem', color: 'var(--nm-text-muted)', letterSpacing: '0.1em', textAlign: 'center' }}>
          {ASSISTANT.acronym.toUpperCase()}
        </div>
      </motion.div>

      {/* Divider */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', maxWidth: 240, height: 1, background: 'linear-gradient(to right, transparent, var(--nm-border), transparent)', margin: '1.5rem auto' }}
      />

      {/* Suggestion chips */}
      <motion.div
        className="flex flex-col gap-2 w-full"
        style={{ maxWidth: 320 }}
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.4 }}
      >
        <p className="hud-text mb-2" style={{ fontSize: '0.58rem', color: 'var(--nm-text-subtle)', letterSpacing: '0.1em' }}>
          SUGGESTED QUERIES
        </p>
        {CHAT_SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onSuggest(s)}
            className="nm-pill text-left"
            style={{
              padding: '0.65rem 1rem',
              color: 'var(--nm-text-muted)',
              fontSize: '0.82rem',
              cursor: 'pointer',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              background: 'none',
              border: '1px solid var(--nm-border)',
              boxShadow: '3px 3px 8px var(--nm-shadow-dark), -1px -1px 4px var(--nm-shadow-light)',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--nm-text)'; e.currentTarget.style.borderColor = 'var(--nm-accent)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--nm-text-muted)'; e.currentTarget.style.borderColor = 'var(--nm-border)' }}
          >
            <span>{s}</span>
            <span style={{ color: 'var(--nm-accent)', fontSize: '0.7rem' }}>→</span>
          </button>
        ))}
      </motion.div>
    </motion.div>
  )
}

/* ─── Message bubbles ────────────────────────────────────────────────────── */
function UserMessage({ content }) {
  return (
    <motion.div
      className="flex items-end justify-end gap-2"
      initial={{ opacity: 0, x: 20, y: 8 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        style={{
          maxWidth: '80%',
          padding: '0.65rem 1rem',
          background: 'linear-gradient(135deg, var(--nm-accent), var(--nm-accent-2))',
          borderRadius: '1rem 0.25rem 1rem 1rem',
          color: '#fff',
          fontSize: '0.9rem',
          lineHeight: 1.6,
          wordBreak: 'break-word',
          boxShadow: '0 0 20px rgba(220,38,38,0.22), 4px 4px 12px rgba(0,0,0,0.35)',
        }}
      >
        {content}
      </div>
      <div
        style={{
          width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
          background: 'var(--nm-surface-2)',
          border: '1px solid var(--nm-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--nm-text-muted)',
          boxShadow: '3px 3px 8px var(--nm-shadow-dark)',
        }}
      >
        <User size={13} aria-hidden />
      </div>
    </motion.div>
  )
}

function AIMessage({ content, thinking, blocks, isTyping, toolStatus }) {
  return (
    <motion.div
      className="flex items-end gap-2"
      initial={{ opacity: 0, x: -20, y: 8 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 30, height: 30, borderRadius: '50%', flexShrink: 0, alignSelf: 'flex-start', marginTop: 4,
          background: 'linear-gradient(135deg, var(--nm-accent), var(--nm-accent-2))',
          boxShadow: '0 0 12px rgba(220,38,38,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <VIcon size={13} color="#fff" />
      </div>

      {/* Bubble */}
      <div
        style={{
          maxWidth: '85%',
          padding: '0.65rem 1rem',
          background: 'var(--nm-surface)',
          border: '1px solid var(--nm-border)',
          borderLeft: '2px solid var(--nm-accent)',
          borderRadius: '0.25rem 1rem 1rem 1rem',
          fontSize: '0.9rem',
          lineHeight: 1.6,
          wordBreak: 'break-word',
          color: 'var(--nm-text)',
          boxShadow: '4px 4px 14px var(--nm-shadow-dark), -2px -2px 6px var(--nm-shadow-light)',
        }}
      >
        {isTyping && !content ? (
          <TypingIndicator label={toolStatus || 'COMPUTING'} />
        ) : (
          <>
            <ThinkingBlock text={thinking} />
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
              {content}
            </ReactMarkdown>
            {isTyping && <TypingIndicator label={toolStatus || 'COMPUTING'} />}
            <ChatBlocks blocks={blocks} />
          </>
        )}
      </div>
    </motion.div>
  )
}

/* ─── Header bar ─────────────────────────────────────────────────────────── */
function ChatHeader({ loading }) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{ paddingTop: '1rem', paddingBottom: '0.5rem' }}
      data-no-transition
    >
      <div className="mx-auto max-w-3xl px-4">
        <div
          className="relative flex items-center px-4 py-2.5 rounded-2xl"
          data-no-transition
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          {/* Back */}
          <a
            href="#/"
            className="flex items-center gap-1.5 hud-text"
            style={{ fontSize: '0.62rem', color: 'var(--nm-text-muted)', letterSpacing: '0.1em', textDecoration: 'none' }}
          >
            <ArrowLeft size={11} aria-hidden />
            HOME
          </a>

          {/* Center: Veronica identity */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
            <div
              style={{
                width: 26, height: 26, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--nm-accent), var(--nm-accent-2))',
                boxShadow: '0 0 12px rgba(220,38,38,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <VIcon size={12} color="#fff" />
            </div>
            <div style={{ lineHeight: 1.15 }}>
              <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '0.85rem', color: 'var(--nm-text)', letterSpacing: '-0.01em' }}>
                {ASSISTANT.name}
              </div>
              <div className="hud-text" style={{ fontSize: '0.42rem', color: 'var(--nm-text-muted)', letterSpacing: '0.08em' }}>
                {ASSISTANT.acronym.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Right: status */}
          <div className="ml-auto flex items-center gap-1.5">
            <span
              style={{
                width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                background: loading ? 'var(--nm-accent)' : '#22c55e',
                boxShadow: loading ? '0 0 8px var(--nm-accent)' : '0 0 6px #22c55e',
                animation: loading ? 'pulseGlow 1s ease-in-out infinite' : 'blink 2.5s infinite',
              }}
            />
            <span className="hud-text hidden sm:block" style={{ fontSize: '0.52rem', color: 'var(--nm-text-muted)', letterSpacing: '0.1em' }}>
              {loading ? 'PROCESSING' : 'ONLINE'}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

/* ─── Input bar ──────────────────────────────────────────────────────────── */
function InputBar({ value, onChange, onSubmit, loading, onStop }) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)' }}
    >
      {/* Fade scrim above input */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-16 h-16"
        style={{ background: 'linear-gradient(to bottom, transparent, var(--nm-bg))' }}
      />
      <div className="mx-auto max-w-3xl px-4 pb-4">
        <form onSubmit={onSubmit}>
          <div
            className="nm-bar relative flex items-center gap-3 px-4 py-3"
          >
            <input
              value={value}
              onChange={onChange}
              placeholder={`Message ${ASSISTANT.name}…`}
              className="flex-1 bg-transparent outline-none text-[16px] sm:text-sm"
              style={{
                color: 'var(--nm-text)',
                caretColor: 'var(--nm-accent)',
                fontFamily: 'Inter, sans-serif',
              }}
              style2={{ '::placeholder': { color: 'var(--nm-text-muted)' } }}
              autoComplete="off"
              spellCheck={false}
            />
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.button
                  key="stop"
                  type="button"
                  onClick={onStop}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  aria-label="Stop"
                  style={{
                    width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                    background: 'var(--nm-surface-2)',
                    border: '1px solid var(--nm-border)',
                    color: 'var(--nm-accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '2px 2px 6px var(--nm-shadow-dark)',
                  }}
                >
                  <Square size={13} aria-hidden />
                </motion.button>
              ) : (
                <motion.button
                  key="send"
                  type="submit"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  aria-label="Send"
                  style={{
                    width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, var(--nm-accent), var(--nm-accent-2))',
                    boxShadow: '0 0 18px rgba(220,38,38,0.4)',
                    border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <ArrowUp size={15} color="#fff" aria-hidden />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─── Main page ──────────────────────────────────────────────────────────── */
export default function ChatPage() {
  const [messages, setMessages] = React.useState(() => {
    try {
      if (isHardReload()) { sessionStorage.removeItem(HISTORY_KEY); sessionStorage.removeItem(SEED_KEY) }
      return JSON.parse(sessionStorage.getItem(HISTORY_KEY) || '[]')
    } catch { return [] }
  })
  const [input, setInput] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [toolStatus, setToolStatus] = React.useState(null)
  const streamRef = React.useRef(null)
  const assistantIdxRef = React.useRef(-1)
  const lastSeedRef = React.useRef('')
  const seededOnceRef = React.useRef(false)
  const endRef = React.useRef(null)

  React.useEffect(() => {
    try { sessionStorage.setItem(HISTORY_KEY, JSON.stringify(messages)) } catch {}
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  const tailContent = messages.length ? messages[messages.length - 1]?.content || '' : ''
  React.useEffect(() => {
    if (loading) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [tailContent, loading])

  const stop = React.useCallback(() => {
    try { streamRef.current?.close?.() } catch {}
    streamRef.current = null
    setLoading(false)
    setToolStatus(null)
    setMessages(m => {
      if (!m.length) return m
      const last = m[m.length - 1]
      if (last.role === 'model' && !last.content) return m.slice(0, -1)
      return m
    })
  }, [])

  const appendUser     = text => setMessages(m => [...m, { role: 'user', content: text, thinking: '', blocks: [] }])
  const beginAssistant = () => {
    setMessages(m => {
      assistantIdxRef.current = m.length
      return [...m, { role: 'model', content: '', thinking: '', blocks: [] }]
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
    setToolStatus(null)
    beginAssistant()
    const turnsHistory = prepareHistory(messages.concat({ role: 'user', content: q, thinking: '', blocks: [] }))
    const handle = openSSE({
      base: API_BASE,
      text: q,
      history: turnsHistory,
      onEvent: (event) => {
        const idx = assistantIdxRef.current
        if (event.t === 'text') {
          setMessages(m => {
            const n = m.slice()
            const cur = n[idx] || { role: 'model', content: '', thinking: '', blocks: [] }
            n[idx] = { ...cur, content: (cur.content || '') + event.v }
            return n
          })
        } else if (event.t === 'thinking') {
          setMessages(m => {
            const n = m.slice()
            const cur = n[idx] || { role: 'model', content: '', thinking: '', blocks: [] }
            n[idx] = { ...cur, thinking: (cur.thinking || '') + event.v }
            return n
          })
        } else if (event.t === 'tool') {
          setToolStatus(TOOL_STATUS_LABELS[event.name] || 'PROCESSING...')
        } else if (event.t === 'block') {
          setMessages(m => {
            const n = m.slice()
            const cur = n[idx] || { role: 'model', content: '', thinking: '', blocks: [] }
            n[idx] = { ...cur, blocks: [...(cur.blocks || []), { type: event.name, data: event.data }] }
            return n
          })
          setToolStatus(null)
        }
      },
      onDone:  () => { streamRef.current = null; setLoading(false); setToolStatus(null) },
      onError: () => { streamRef.current = null; setLoading(false); setToolStatus(null); stop() },
    })
    streamRef.current = handle
  }, [loading, messages, stop])

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

  React.useEffect(() => () => { try { streamRef.current?.close?.() } catch {} }, [])

  const isEmpty = messages.length === 0

  return (
    <div className="min-h-screen" style={{ background: 'transparent', color: 'var(--nm-text)' }}>
      {/* Reactive galaxy background */}
      <ChatBackground chaos={loading} />

      {/* Dim overlay — keeps text legible over the particle field */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, zIndex: 2,
          pointerEvents: 'none',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.38) 50%, rgba(0,0,0,0.65) 100%)',
        }}
      />

      <ChatHeader loading={loading} />

      {/* Message area */}
      <div
        className="mx-auto max-w-3xl px-4"
        style={{
          position: 'relative', zIndex: 3,
          paddingTop: 'calc(4.5rem + 1rem)',   /* clear fixed header */
          paddingBottom: '7rem',                /* clear fixed input */
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {isEmpty ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <EmptyState onSuggest={q => send(q)} />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <AnimatePresence initial={false}>
              {messages.map((m, i) =>
                m.role === 'user'
                  ? <UserMessage key={i} content={m.content} />
                  : <AIMessage
                      key={i}
                      content={m.content}
                      thinking={m.thinking}
                      blocks={m.blocks}
                      isTyping={loading && i === messages.length - 1}
                      toolStatus={toolStatus}
                    />
              )}
            </AnimatePresence>
            <div ref={endRef} style={{ height: 1 }} />
          </div>
        )}
      </div>

      <InputBar
        value={input}
        onChange={e => setInput(e.target.value)}
        onSubmit={e => { e.preventDefault(); send(input) }}
        loading={loading}
        onStop={stop}
      />
    </div>
  )
}

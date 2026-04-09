import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { ASSISTANT, CHAT_SUGGESTIONS } from '../../data'

const SEED_KEY = 'chat:seed'

export default function ChatBar({ onSubmit }) {
  const [text, setText] = React.useState('')
  const [i, setI] = React.useState(0)
  const [ghost, setGhost] = React.useState('')
  const [phase, setPhase] = React.useState('typing')

  const typingMs = 22, deletingMs = 10, pauseFullMs = 800, pauseBeforeDeleteMs = 300

  React.useEffect(() => {
    if (!CHAT_SUGGESTIONS?.length) return
    const s = CHAT_SUGGESTIONS[i] || ''
    let t
    if (phase === 'typing') {
      if (ghost.length < s.length) t = setTimeout(() => setGhost(s.slice(0, ghost.length + 1)), typingMs)
      else t = setTimeout(() => setPhase('pause'), pauseFullMs)
    } else if (phase === 'pause') {
      t = setTimeout(() => setPhase('deleting'), pauseBeforeDeleteMs)
    } else if (phase === 'deleting') {
      if (ghost.length) t = setTimeout(() => setGhost(s.slice(0, ghost.length - 1)), deletingMs)
      else { setI(x => (x + 1) % CHAT_SUGGESTIONS.length); setPhase('typing') }
    }
    return () => clearTimeout(t)
  }, [ghost, phase, i])

  const doSubmit = () => {
    const q = text.trim()
    if (q) {
      try { sessionStorage.setItem(SEED_KEY, q) } catch {}
      requestAnimationFrame(() => { location.hash = `/chat?q=${encodeURIComponent(q)}` })
      try { onSubmit?.(q) } catch {}
    } else {
      requestAnimationFrame(() => { location.hash = '/chat' })
    }
  }

  const handleSubmit = (e) => { e.preventDefault(); doSubmit() }

  return (
    <motion.div
      className="w-full max-w-2xl"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 1.2 }}
    >
      {/* Veronica label */}
      <div
        className="hud-text text-center mb-2.5"
        style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.25)' }}
      >
        ↳&nbsp;
        <span style={{ color: 'rgba(220,38,38,0.8)', fontWeight: 600 }}>{ASSISTANT.name}</span>
        &nbsp;·&nbsp;AI COPILOT&nbsp;·&nbsp;ASK ANYTHING
      </div>

      {/* Input bar */}
      <form onSubmit={handleSubmit}>
        <div
          className="relative flex items-center gap-2 sm:gap-3 rounded-2xl px-3 sm:px-5 py-3"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 0 60px rgba(220,38,38,0.1), 0 4px 32px rgba(0,0,0,0.5)',
          }}
        >
          {/* Ghost text with cursor */}
          <div className="relative flex-1 h-11 flex items-center">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              className="absolute inset-0 bg-transparent outline-none text-[16px]"
              style={{ color: 'rgba(255,255,255,0.85)', caretColor: 'transparent', fontFamily: 'Inter, sans-serif' }}
              aria-label={`Ask ${ASSISTANT.name}`}
              autoComplete="off"
              spellCheck={false}
            />
            {/* Ghost overlay when empty */}
            {!text && (
              <span
                className="pointer-events-none text-[16px]"
                style={{ color: 'rgba(255,255,255,0.22)', fontFamily: 'Inter, sans-serif', userSelect: 'none' }}
              >
                {ghost}
                <span
                  className="inline-block w-[1.5px] h-[1.1em] ml-[1px] align-text-bottom"
                  style={{ background: 'var(--nm-accent)', animation: 'blink 1.1s step-end infinite', opacity: 0.9 }}
                />
              </span>
            )}
          </div>

          {/* Send */}
          <button
            type="submit"
            className="shrink-0 flex items-center justify-center rounded-xl transition-all"
            style={{
              width: '2.75rem',
              height: '2.75rem',
              background: 'linear-gradient(135deg, #dc2626, #db2777)',
              boxShadow: '0 0 24px rgba(220,38,38,0.5)',
              border: 'none',
              cursor: 'pointer',
            }}
            aria-label="Send"
          >
            <ArrowRight className="h-[1.1rem] w-[1.1rem] text-white" />
          </button>
        </div>
      </form>
    </motion.div>
  )
}

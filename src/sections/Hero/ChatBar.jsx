import React from 'react'
import { ASSISTANT, CHAT_SUGGESTIONS } from '../../data'

const SEED_KEY = 'chat:seed'

export default function ChatBar() {
  const [text, setText] = React.useState('')
  const [i, setI] = React.useState(0)
  const [ghost, setGhost] = React.useState('')
  const [phase, setPhase] = React.useState('typing') // typing | pause | deleting

  const typingMs = 18, deletingMs = 12, pauseFullMs = 600, pauseBeforeDeleteMs = 220

  // ghost typewriter
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
      else { setI((x) => (x + 1) % CHAT_SUGGESTIONS.length); setPhase('typing') }
    }
    return () => clearTimeout(t)
  }, [ghost, phase, i])

  React.useEffect(() => {
    if (!CHAT_SUGGESTIONS?.length) return
    setI(0); setGhost(''); setPhase('typing')
  }, [CHAT_SUGGESTIONS?.length])

  const handleSubmit = (e) => {
    e.preventDefault()
    const q = text.trim() // IMPORTANT: only user-typed text, never ghost
    if (q) {
      try { sessionStorage.setItem(SEED_KEY, q) } catch {}
      // next-frame navigate avoids any same-tick race with parent's render
      requestAnimationFrame(() => { location.hash = `/chat?q=${encodeURIComponent(q)}` })
    } else {
      requestAnimationFrame(() => { location.hash = '/chat' })
    }
  }

  const placeholder = text ? '' : (ghost || ' ')

  return (
    <div className="relative w-full max-w-3xl">
      <div aria-hidden className="pointer-events-none absolute -inset-1 z-0 rounded-[1.75rem] bg-gradient-to-br from-fuchsia-500/30 via-pink-500/25 to-rose-500/30 blur-xl" />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 rounded-[1.5rem] bg-zinc-900/85 backdrop-blur border border-white/10 px-5 py-3.5 sm:px-6 sm:py-4 shadow-[0_10px_40px_rgba(0,0,0,0.35)]"
      >
        <input
          value={text}
          onChange={(e)=>setText(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none text-zinc-100 placeholder:text-zinc-400 text-[16px] sm:text-base"
          aria-label={`Ask ${ASSISTANT.name}`}
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-100 px-3 py-1.5 text-sm"
        >
          Chat
        </button>
      </form>

      <div className="relative z-10 mt-3 text-sm sm:text-base text-zinc-300">
        <span className="font-semibold text-zinc-100">{ASSISTANT.name}</span> — my AI copilot. Ask anything about my work.
      </div>
    </div>
  )
}
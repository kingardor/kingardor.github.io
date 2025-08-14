import React from 'react'
import { ArrowRight } from 'lucide-react'
import { ASSISTANT, CHAT_SUGGESTIONS } from '../../data'

const SEED_KEY = 'chat:seed'

export default function ChatBar({ onSubmit }) {
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

  const doSubmit = () => {
    const q = text.trim() // only user-typed text (never ghost)
    if (q) {
      try { sessionStorage.setItem(SEED_KEY, q) } catch {}
      requestAnimationFrame(() => { location.hash = `/chat?q=${encodeURIComponent(q)}` })
      try { onSubmit?.(q) } catch {}
    } else {
      requestAnimationFrame(() => { location.hash = '/chat' })
    }
  }

  const handleSubmit = (e) => { e.preventDefault(); doSubmit() }
  const placeholder = text ? '' : (ghost || ' ')

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      {/* soft glow behind the row */}
      <div aria-hidden className="pointer-events-none absolute -inset-1 z-0 rounded-[1.75rem] bg-gradient-to-br from-fuchsia-500/30 via-pink-500/25 to-rose-500/30 blur-xl" />

      {/* row: pill + arrow aligned */}
      <div className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
        <form
          onSubmit={handleSubmit}
          className="flex-1 rounded-[1.5rem] bg-zinc-900/85 backdrop-blur border border-white/10 px-5 py-2.5 sm:px-6 sm:py-3 shadow-[0_10px_40px_rgba(0,0,0,0.35)]"
        >
          {/* fixed input height to avoid iOS zoom jitter & align vertically */}
          <input
            value={text}
            onChange={(e)=>setText(e.target.value)}
            placeholder={placeholder}
            className="w-full h-11 sm:h-12 bg-transparent outline-none text-zinc-100 placeholder:text-zinc-400 text-[16px] sm:text-base leading-none"
            aria-label={`Ask ${ASSISTANT.name}`}
            autoComplete="off"
            spellCheck={false}
          />
        </form>

        {/* arrow button is separate, so it never overlaps long text */}
        <button
          type="button"
          onClick={doSubmit}
          className="shrink-0 rounded-full border border-white/10 bg-white/10 hover:bg-white/20 backdrop-blur p-2.5"
          aria-label="Send"
        >
          <ArrowRight className="h-5 w-5 text-zinc-100" />
        </button>
      </div>

      {/* tagline */}
      <div className="relative z-10 mt-3 text-sm sm:text-base text-zinc-300">
        <span className="font-semibold text-zinc-100">{ASSISTANT.name}</span> — my AI copilot. Ask anything about my work.
      </div>
    </div>
  )
}

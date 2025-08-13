import React from 'react'
import { ASSISTANT, CHAT_SUGGESTIONS } from '../../data'

export default function ChatBar({ onSubmit }) {
  const [text, setText] = React.useState('')
  return (
    <div className="relative w-full max-w-3xl">
      {/* glow must not block clicks */}
      <div aria-hidden className="pointer-events-none absolute -inset-1 rounded-[1.75rem] bg-gradient-to-br from-fuchsia-500/30 via-pink-500/25 to-rose-500/30 blur-xl z-0" />
      <form
        onSubmit={(e)=>{e.preventDefault(); if(text.trim()) onSubmit(text.trim())}}
        className="relative z-10 rounded-[1.5rem] bg-zinc-900/85 backdrop-blur border border-white/10 px-5 py-3.5 sm:px-6 sm:py-4 shadow-[0_10px_40px_rgba(0,0,0,0.35)]"
      >
        <input
          value={text}
          onChange={(e)=>setText(e.target.value)}
          placeholder={`Ask ${ASSISTANT.name}—my AI copilot—anything about my work`}
          className="w-full bg-transparent outline-none text-zinc-100 placeholder:text-zinc-400 text-sm sm:text-base"
          aria-label={`Ask ${ASSISTANT.name}`}
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-100 px-3 py-1.5 text-sm"
        >
          Chat
        </button>
      </form>

      <div className="relative z-10 mt-3 flex flex-wrap justify-center gap-2">
        {CHAT_SUGGESTIONS.map((s)=>(
          <button
            key={s}
            type="button"
            onClick={()=>onSubmit(s)}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200 hover:bg-white/10"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import { ASSISTANT } from '../../data/content'

export default function ChatInput({ onSend, loading }) {
    const [input, setInput] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!input.trim() || loading) return
        onSend(input)
        setInput('')
    }

    return (
        <div className="fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#0b0b0e] to-transparent pb-[env(safe-area-inset-bottom)]">
            <div className="mx-auto max-w-3xl px-4 pb-6">
                <form onSubmit={handleSubmit} className="relative flex items-center gap-2 rounded-2xl bg-zinc-900/80 backdrop-blur-md border border-white/10 px-4 py-3 shadow-2xl" style={{ boxShadow: '0 8px 32px 0 rgba(168,85,247,0.18), 0 1.5px 8px 0 rgba(236,72,153,0.12)', backdropFilter: 'blur(8px) saturate(1.5)' }}>
                    <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={`Message ${ASSISTANT.name}…`} className="w-full bg-transparent outline-none text-zinc-100 placeholder:text-zinc-400 text-[16px] sm:text-base" autoComplete="off" spellCheck={false} style={{ paddingRight: '3rem' }} />
                    <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-500 shadow-lg hover:scale-110 transition-transform duration-150 active:scale-95 focus:outline-none" tabIndex={0} aria-label="Send">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </button>
                </form>
            </div>
        </div>
    )
}

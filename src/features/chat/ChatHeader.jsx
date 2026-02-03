import React from 'react'
import { ASSISTANT } from '../../data/content'

export default function ChatHeader({ loading }) {
    return (
        <div className="mb-6 flex items-center justify-between">
            <a href="#/" className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10">← Home</a>
            <div className="flex items-center gap-2">
                <div className={"flex items-center gap-2 px-4 py-1.5 rounded-full shadow-lg border border-white/10 backdrop-blur-md " + (loading ? "bg-gradient-to-r from-fuchsia-700/60 to-indigo-700/60 animate-pulse" : "bg-zinc-900/70")} style={{ minWidth: 0, fontWeight: 500, fontSize: "1rem", color: "#fff", boxShadow: loading ? "0 0 16px 2px rgba(236,72,153,0.18), 0 1.5px 8px 0 rgba(99,102,241,0.12)" : "0 1.5px 8px 0 rgba(99,102,241,0.08)" }}>
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-500 shadow border border-white/20 mr-2">
                        {loading ? (
                            <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                            </svg>
                        ) : (
                            <span role="img" aria-label="Chat">💬</span>
                        )}
                    </span>
                    <span className="truncate">{loading ? "Thinking..." : <>Chat with {ASSISTANT.name}…</>}</span>
                </div>
            </div>
        </div>
    )
}

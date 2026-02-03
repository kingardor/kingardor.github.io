import React from 'react'

export default function TypingDots() {
    return (
        <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-300 animate-bounce [animation-delay:-0.2s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-300 animate-bounce [animation-delay:-0.1s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-300 animate-bounce" />
        </span>
    )
}

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import TypingDots from './TypingDots'

export default function MessageBubble({ role, content }) {
    const isUser = role === 'user'

    return (
        <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'} animate-fadein`}>
            {!isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-500 shadow-lg border-2 border-white/30 flex items-center justify-center text-lg font-bold select-none">
                    <span role="img" aria-label="AI">🤖</span>
                </div>
            )}
            <div className={'relative max-w-[80%] rounded-2xl px-5 py-3 text-sm sm:text-base shadow-xl backdrop-blur-md transition-all duration-300 ' + (isUser ? 'bg-fuchsia-700/40 border border-fuchsia-400/40 text-zinc-100 glassmorphism-user' : 'bg-zinc-900/60 border border-indigo-400/30 text-zinc-100 glassmorphism-ai')} style={{ boxShadow: isUser ? '0 4px 32px 0 rgba(236,72,153,0.18), 0 1.5px 8px 0 rgba(236,72,153,0.12)' : '0 4px 32px 0 rgba(99,102,241,0.18), 0 1.5px 8px 0 rgba(99,102,241,0.12)', border: isUser ? '1.5px solid rgba(236,72,153,0.25)' : '1.5px solid rgba(99,102,241,0.18)', backdropFilter: 'blur(8px) saturate(1.5)', background: isUser ? 'linear-gradient(135deg,rgba(236,72,153,0.22),rgba(168,85,247,0.18))' : 'linear-gradient(135deg,rgba(39,39,42,0.65),rgba(99,102,241,0.13))' }}>
                {role === 'model'
                    ? (content
                        ? (<div className="prose prose-invert max-w-none whitespace-pre-wrap break-words">
                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: (props) => <a {...props} target="_blank" rel="noreferrer" />, code: ({ inline, children, ...p }) => inline ? <code {...p}>{children}</code> : <code {...p} className="block whitespace-pre-wrap break-words">{children}</code> }}>
                                {content}
                            </ReactMarkdown>
                        </div>)
                        : <TypingDots />)
                    : content}
            </div>
            {isUser && (<div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-500 to-pink-400 shadow-lg border-2 border-white/30 flex items-center justify-center text-lg font-bold select-none"><span role="img" aria-label="User">🧑‍💻</span></div>)}
        </div>
    )
}

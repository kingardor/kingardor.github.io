import React from 'react'
import { ASSISTANT } from '../data'
import parseSearch from '../utils/parseSearch'

export default function ChatPage() {
  const { q='' } = React.useMemo(()=>parseSearch(location.hash.split('?')[1]||''), [])
  const [messages, setMessages] = React.useState(q ? [{ role:'user', content:q }] : [])
  const [input, setInput] = React.useState('')

  const send = (text) => {
    if (!text.trim()) return
    setMessages((m)=>[...m, { role:'user', content:text.trim() }])
    setInput('')
    setMessages((m)=>[...m, { role:'assistant', content:`(Coming soon) ${ASSISTANT.name} will answer here.` }])
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0b0e] via-[#0b0b0e] to-[#0b1220] text-zinc-100">
      <div className="mx-auto max-w-3xl px-4 pt-6 pb-24">
        <div className="mb-6 flex items-center justify-between">
          <a href="#/" className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10">← Home</a>
          <div className="text-sm text-zinc-400">Chat with {ASSISTANT.name}</div>
        </div>

        <div className="space-y-4">
          {messages.map((m,i)=>(
            <div key={i} className={m.role==='user' ? 'text-right' : 'text-left'}>
              <div className={`inline-block max-w-[85%] rounded-2xl px-4 py-2 text-sm sm:text-base ${m.role==='user' ? 'bg-fuchsia-500/15 border border-fuchsia-400/20' : 'bg-white/5 border border-white/10'}`}>
                {m.content}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#0b0b0e] to-transparent">
        <div className="mx-auto max-w-3xl px-4 pb-6">
          <form onSubmit={(e)=>{e.preventDefault(); send(input)}} className="relative rounded-2xl bg-zinc-900/85 backdrop-blur border border-white/10 px-4 py-3">
            <input value={input} onChange={(e)=>setInput(e.target.value)} placeholder={`Message ${ASSISTANT.name}…`} className="w-full bg-transparent outline-none text-zinc-100 placeholder:text-zinc-400 text-sm sm:text-base" />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-100 px-3 py-1.5 text-sm">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

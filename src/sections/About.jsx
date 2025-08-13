import React from 'react'
import { motion } from 'framer-motion'
import { Section, K } from '../components/Primitives'
import { Sparkles } from 'lucide-react'

export default function About() {
  return (
    <Section id="about" className="pt-12">
      <div className="mb-6 flex items-center gap-3">
        <Sparkles className="h-5 w-5 text-zinc-300"/>
        <h2 className="text-xl font-semibold text-zinc-100">About</h2>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
        <div className="pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(60%_60%_at_50%_50%,#000,transparent)]">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:40px_1px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:1px_40px]" />
        </div>

        <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.6 }} transition={{ duration: 0.5 }}
          className="relative z-10 text-pretty text-lg leading-7 text-zinc-300 sm:text-xl sm:leading-8">
          I architect and ship <K>agentic AI</K> systems that actually launch—<K>video-first data lakes</K>, retrieval engines, and <K>fine-tuned LLMs</K>. Former research scholar at <K>UC Berkeley</K>; <K>Z by HP Global Data Science Ambassador</K>; and <K>NVIDIA Jetson AI Research Lab</K> member. If it runs on GPUs or edge silicon, I squeeze more out of it.
        </motion.p>

        <div className="relative z-10 mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-black/30 p-3">
            <div className="text-xs uppercase tracking-wide text-zinc-400">Focus</div>
            <div className="mt-1 font-medium text-zinc-100">Agentic systems • Multimodal • RAG</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/30 p-3">
            <div className="text-xs uppercase tracking-wide text-zinc-400">Tooling</div>
            <div className="mt-1 font-medium text-zinc-100">qLoRA • SFT • DPO • Qdrant • DeepStream</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/30 p-3">
            <div className="text-xs uppercase tracking-wide text-zinc-400">Vibe</div>
            <div className="mt-1 font-medium text-zinc-100">Outlaw energy. Production over slides.</div>
          </div>
        </div>

        <div className="relative z-10 mt-6 flex flex-wrap items-center gap-2">
          <span className="text-sm text-zinc-400">Currently:</span>
          <motion.span className="text-sm font-semibold text-transparent bg-clip-text"
            style={{ backgroundImage: 'linear-gradient(90deg,#fb7185, #f472b6, #ef4444)', backgroundSize: '200% 100%' }}
            animate={{ backgroundPosition: ['0% 50%','100% 50%'] }} transition={{ duration: 6, repeat: Infinity, repeatType: 'mirror' }}>
            Founding AI Architect — Stealth (video data lake with agentic capabilities)
          </motion.span>
        </div>
      </div>
    </Section>
  )
}

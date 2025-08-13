import React from 'react'
import { motion } from 'framer-motion'
import { Section } from '../components/Primitives'
import { HIGHLIGHTS } from '../data'

const PopCard = ({ kpi, title, sub, gradient }) => (
  <motion.div whileHover={{ y: -4, scale: 1.01 }} transition={{ type: 'spring', stiffness: 220, damping: 18 }} className="relative group">
    <div aria-hidden className={`absolute -inset-[1px] rounded-xl bg-gradient-to-br ${gradient} opacity-50 blur-md md:opacity-80 md:blur-lg transition-opacity group-hover:opacity-100`} />
    <div className="relative rounded-xl border border-white/10 bg-zinc-900/60 p-4 sm:p-5 md:p-6 backdrop-blur-md shadow-lg md:shadow-2xl">
      <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-50">{kpi}</div>
      <div className="mt-0.5 text-sm sm:text-base font-medium text-zinc-100">{title}</div>
      {sub ? <div className="mt-0.5 text-xs sm:text-sm text-zinc-400">{sub}</div> : null}
    </div>
  </motion.div>
)

export default function Highlights() {
  const gradients = [
    'from-fuchsia-500 via-pink-500 to-rose-500',
    'from-amber-400 via-orange-500 to-rose-500',
    'from-sky-400 via-indigo-500 to-fuchsia-500',
    'from-emerald-400 via-teal-500 to-cyan-500',
  ]
  return (
    <Section id="highlights" className="pt-6 sm:pt-8">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {HIGHLIGHTS.map((h, i) => (
          <PopCard key={h.title} kpi={h.kpi} title={h.title} sub={h.sub} gradient={gradients[i % gradients.length]} />
        ))}
      </div>
    </Section>
  )
}

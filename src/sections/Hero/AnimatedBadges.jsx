import React from 'react'
import { motion } from 'framer-motion'
import { Pill } from '../../components/Primitives'
import { WandSparkles, ShieldCheck, BadgeCheck, Network } from 'lucide-react'

const BADGES = [
  { icon: <Network className="h-4 w-4"/>, label: 'Founding AI Architect — Stealth (Agentic Video Data Lake)' },
  { icon: <WandSparkles className="h-4 w-4"/>, label: 'Generative AI Builder' },
  { icon: <ShieldCheck className="h-4 w-4"/>, label: 'Z by HP Global Data Science Ambassador' },
  { icon: <BadgeCheck className="h-4 w-4"/>, label: 'Jetson AI Research Lab Member' },
]

export default function AnimatedBadges() {
  const container = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }
  const item = { hidden: { opacity: 0, y: 6, scale: 0.98 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 320, damping: 22 } } }

  return (
    <motion.div className="mt-4 flex flex-wrap justify-center gap-2" variants={container} initial="hidden" animate="show">
      {BADGES.map((b, i) => (
        <motion.div key={i} variants={item} whileHover={{ y: -2, scale: 1.02 }} className="relative group">
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -inset-2 rounded-full bg-gradient-to-r from-fuchsia-500/25 via-pink-500/25 to-rose-500/25 blur-md"
            animate={{ opacity: [0, 0.75, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.12 }}
          />
          <Pill className="bg-white/5">
            {b.icon}
            {b.label}
          </Pill>
        </motion.div>
      ))}
    </motion.div>
  )
}

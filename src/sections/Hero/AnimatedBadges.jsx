import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pill } from '../../shared/components/Primitives'
import useIsMobile from '../../shared/hooks/useIsMobile'
import { WandSparkles, ShieldCheck, BadgeCheck, Network } from 'lucide-react'

const BADGES = [
  { icon: <Network className="h-4 w-4"/>, label: 'Founding AI Architect — Stealth (Agentic Video Data Lake)' },
  { icon: <WandSparkles className="h-4 w-4"/>, label: 'Generative AI Builder' },
  { icon: <ShieldCheck className="h-4 w-4"/>, label: 'Z by HP Global Data Science Ambassador' },
  { icon: <BadgeCheck className="h-4 w-4"/>, label: 'Jetson AI Research Lab Member' },
]

export default function AnimatedBadges() {
  const isMobile = useIsMobile()
  const COLS = 1
  const [i, setI] = React.useState(0)

  React.useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % BADGES.length), 1400) // quick cycle
    return () => clearInterval(t)
  }, [])

  const visible = Array.from(
    { length: Math.min(COLS, BADGES.length) },
    (_, k) => BADGES[(i + k) % BADGES.length]
  )

  return (
    <div className="mt-2 sm:mt-3 w-full max-w-4xl">
      <div className="flex flex-wrap justify-center gap-2 md:gap-2.5">
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((b, idx) => (
            <motion.div
              key={b.label + i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
              className="relative"
            >
              {/* soft glow, non-interactive */}
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-2 rounded-full
                           bg-gradient-to-r from-red-700/25 via-red-500/25 to-rose-500/25
                           blur-md"
              />
              <Pill className="relative bg-white/5">
                {b.icon}
                {b.label}
              </Pill>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

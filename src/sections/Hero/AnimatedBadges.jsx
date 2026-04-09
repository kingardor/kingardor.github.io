import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useIsMobile from '../../shared/hooks/useIsMobile'
import { WandSparkles, ShieldCheck, BadgeCheck, Network } from 'lucide-react'

const BADGES = [
  { icon: <Network className="h-3.5 w-3.5" />, label: 'Founding AI Architect — Agentic Video Data Lake' },
  { icon: <WandSparkles className="h-3.5 w-3.5" />, label: 'Generative AI Builder' },
  { icon: <ShieldCheck className="h-3.5 w-3.5" />, label: 'Z by HP Global Data Science Ambassador' },
  { icon: <BadgeCheck className="h-3.5 w-3.5" />, label: 'NVIDIA Jetson AI Lab Member' },
]

export default function AnimatedBadges() {
  const isMobile = useIsMobile()
  const [i, setI] = React.useState(0)

  React.useEffect(() => {
    const t = setInterval(() => setI(x => (x + 1) % BADGES.length), 1600)
    return () => clearInterval(t)
  }, [])

  const visible = isMobile
    ? [BADGES[i % BADGES.length]]
    : BADGES

  return (
    <motion.div
      className="flex flex-wrap justify-center gap-2"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.75 }}
    >
      <AnimatePresence mode="popLayout">
        {visible.map((b) => (
          <motion.div
            key={b.label}
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.2 }}
          >
            <span
              className="nm-pill inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
              style={{ color: 'var(--nm-text-muted)' }}
            >
              <span style={{ color: 'var(--nm-accent)' }}>{b.icon}</span>
              {b.label}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}

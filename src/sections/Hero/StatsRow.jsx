import { motion } from 'framer-motion'
import { HIGHLIGHTS } from '../../data'

const item = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 140, damping: 18, delay: 0.9 + i * 0.08 }
  })
}

export default function StatsRow() {
  return (
    <div className="flex gap-2.5 sm:gap-3 flex-wrap justify-center">
      {HIGHLIGHTS.map((h, i) => (
        <motion.div
          key={h.title}
          variants={item}
          initial="hidden"
          animate="show"
          custom={i}
          whileHover={{ y: -3, scale: 1.04, transition: { type: 'spring', stiffness: 300, damping: 16 } }}
          className="nm-card text-center px-3 py-2.5 sm:px-4 sm:py-3 min-w-[72px] cursor-default"
        >
          <div
            className="font-black leading-none"
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
              color: 'var(--nm-accent)',
              textShadow: '0 0 20px var(--nm-accent-glow-strong)',
            }}
          >
            {h.kpi}
          </div>
          <div
            className="mt-1 hud-text"
            style={{ fontSize: '0.52rem', color: 'var(--nm-text-muted)', lineHeight: 1.3 }}
          >
            {h.title}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

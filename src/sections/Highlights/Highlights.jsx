import React, { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Section } from '../../shared/components/Primitives'
import { HIGHLIGHTS } from '../../data'

const ACCENT_COLORS = [
  { color: '#dc2626', glow: 'rgba(220,38,38,0.35)' },
  { color: '#f97316', glow: 'rgba(249,115,22,0.30)' },
  { color: '#8b5cf6', glow: 'rgba(139,92,246,0.30)' },
  { color: '#10b981', glow: 'rgba(16,185,129,0.30)' },
]

function parseKpi(raw) {
  // Handles "50+", "10+", "3", "1" — numeric part + suffix
  const numeric = parseInt(raw.replace(/\D/g, ''), 10) || 0
  const suffix = raw.replace(/[0-9]/g, '')
  return { numeric, suffix }
}

function useCounter(raw, active, duration = 1300) {
  const { numeric, suffix } = parseKpi(raw)
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!active || numeric === 0) {
      setVal(numeric)
      return
    }
    let raf
    const start = performance.now()
    const tick = (now) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setVal(Math.round(eased * numeric))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, numeric, duration])

  return `${val}${suffix}`
}

function StatCard({ kpi, title, sub, accentColor, accentGlow, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const displayed = useCounter(kpi, inView)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        type: 'spring',
        stiffness: 110,
        damping: 18,
        delay: index * 0.12,
      }}
      whileHover={{
        y: -6,
        scale: 1.03,
        transition: { type: 'spring', stiffness: 260, damping: 16 },
      }}
      className="nm-card-xl p-6 relative overflow-hidden group cursor-default"
    >
      {/* Top accent gradient bar */}
      <div
        className="absolute top-0 left-8 right-8 h-[2px] rounded-b-full pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
          opacity: 0.75,
        }}
      />

      {/* Inner glow on hover */}
      <div
        className="absolute inset-0 rounded-[1.25rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: `inset 0 0 36px ${accentGlow}` }}
      />

      {/* KPI counter */}
      <div
        className="font-black leading-none select-none"
        style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: 'clamp(2.2rem, 5.5vw, 3rem)',
          color: accentColor,
          textShadow: `0 0 28px ${accentGlow}`,
        }}
      >
        {displayed}
      </div>

      <div
        className="mt-2 font-semibold text-sm sm:text-base"
        style={{ color: 'var(--nm-text)' }}
      >
        {title}
      </div>

      {sub && (
        <div
          className="mt-1 text-[10px] hud-text"
          style={{ color: 'var(--nm-text-muted)' }}
        >
          {sub}
        </div>
      )}
    </motion.div>
  )
}

export default function Highlights() {
  return (
    <Section id="highlights" className="pt-8 sm:pt-10">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {HIGHLIGHTS.map((h, i) => (
          <StatCard
            key={h.title}
            kpi={h.kpi}
            title={h.title}
            sub={h.sub}
            accentColor={ACCENT_COLORS[i % ACCENT_COLORS.length].color}
            accentGlow={ACCENT_COLORS[i % ACCENT_COLORS.length].glow}
            index={i}
          />
        ))}
      </div>
    </Section>
  )
}

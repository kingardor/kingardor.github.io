import React from 'react'
import { motion } from 'framer-motion'
import ChatBar from './ChatBar'
import ScrollDown from './ScrollDown'
import { HIGHLIGHTS } from '../../data'
import { useTheme } from '../../shared/contexts/ThemeContext'

/* ─── Film grain overlay ─── */
function GrainOverlay() {
  return <div className="grain-overlay" aria-hidden style={{ zIndex: 4 }} />
}

/* ─── Word reveal ─── */
function WordReveal({ text, delay = 0, className = '', style = {} }) {
  return (
    <>
      {text.split(' ').map((word, i) => (
        <div key={i} style={{ overflow: 'hidden', display: 'inline-block', marginRight: '0.22em' }}>
          <motion.span
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1], delay: delay + i * 0.1 }}
            style={{ display: 'inline-block', ...style }}
            className={className}
          >
            {word}
          </motion.span>
        </div>
      ))}
    </>
  )
}

/* ─── Inline stat pill ─── */
function StatPill({ kpi, label }) {
  return (
    <div className="flex flex-col items-center px-3 sm:px-5">
      <span
        className="font-black leading-none"
        style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1rem, 2.5vw, 1.8rem)', color: 'var(--nm-accent)' }}
      >
        {kpi}
      </span>
      <span className="hud-text mt-0.5 text-center" style={{ fontSize: '0.48rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.3 }}>
        {label}
      </span>
    </div>
  )
}

/* ─── Hero ─── */
export default function Hero({ onSubmit }) {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  return (
    <section
      id="top"
      className="relative w-full overflow-hidden"
      style={{ height: '100svh', minHeight: '-webkit-fill-available', background: '#000' }}
    >
      {/* 1. Full-bleed photo — face shows in upper portion */}
      <picture className="absolute inset-0 h-full w-full" style={{ zIndex: 0 }}>
        <source srcSet="/hero.webp" type="image/webp" />
        <img
          src="/hero.webp"
          alt="Akash James"
          loading="eager"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            filter: 'brightness(0.58) saturate(0.75) contrast(1.08)',
            objectPosition: 'center 18%',
            transform: 'translateZ(0)',
            willChange: 'transform',
          }}
        />
      </picture>

      {/* 2. Strong bottom gradient — keeps lower zone dark for text */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background: isLight
            ? `linear-gradient(to bottom,
                rgba(0,0,0,0.0)  0%,
                rgba(0,0,0,0.02) 25%,
                rgba(0,0,0,0.22) 50%,
                rgba(0,0,0,0.62) 70%,
                rgba(0,0,0,0.82) 85%,
                rgba(0,0,0,0.92) 100%
              )`
            : `linear-gradient(to bottom,
                rgba(0,0,0,0.0)  0%,
                rgba(0,0,0,0.05) 25%,
                rgba(0,0,0,0.4)  50%,
                rgba(0,0,0,0.88) 70%,
                rgba(0,0,0,0.97) 85%,
                rgba(0,0,0,1.0)  100%
              )`,
        }}
      />

      {/* 3. Subtle red bottom glow */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 2,
          background: 'radial-gradient(ellipse 60% 30% at 50% 100%, rgba(220,38,38,0.16), transparent 70%)',
        }}
      />

      {/* 4. Film grain */}
      <GrainOverlay />

      {/* 5. Thin red top stripe */}
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: '2px',
          zIndex: 5,
          background: 'linear-gradient(90deg, transparent, #dc2626 35%, #db2777 65%, transparent)',
          opacity: 0.65,
        }}
      />

      {/* 6. Main content — centered, pinned to bottom */}
      <div
        className="relative flex flex-col justify-end items-center w-full h-full"
        style={{ zIndex: 10 }}
      >
        <div className="w-full max-w-4xl mx-auto px-6 sm:px-10 pb-12 sm:pb-16 flex flex-col items-center gap-0 text-center">

          {/* Status badges row */}
          <motion.div
            className="flex items-center justify-center gap-3 sm:gap-5 mb-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-center gap-1.5">
              <span
                className="w-[5px] h-[5px] rounded-full"
                style={{ background: 'var(--nm-accent)', boxShadow: '0 0 8px var(--nm-accent)', animation: 'pulseGlow 2s ease-in-out infinite' }}
              />
              <span className="hud-text" style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.45)' }}>
                AI ARCHITECT
              </span>
            </div>
            <div className="w-px h-3" style={{ background: 'rgba(255,255,255,0.15)' }} />
            <div className="flex items-center gap-1.5">
              <span className="w-[5px] h-[5px] rounded-full bg-green-400" style={{ boxShadow: '0 0 6px #22c55e', animation: 'blink 2s infinite' }} />
              <span className="hud-text" style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.35)' }}>OPEN TO WORK</span>
            </div>
          </motion.div>

          {/* ── Name ── */}
          <div
            className="flex items-baseline justify-center gap-[0.22em] leading-[0.88] tracking-[-0.04em] mb-5"
            style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 'clamp(2.8rem, 10vw, 8rem)' }}
          >
            <div style={{ overflow: 'hidden' }}>
              <motion.span
                initial={{ y: '110%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
                style={{ display: 'inline-block', color: '#ffffff' }}
              >
                AKASH
              </motion.span>
            </div>
            <div style={{ overflow: 'hidden' }}>
              <motion.span
                initial={{ y: '110%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1], delay: 0.55 }}
                style={{ display: 'inline-block', color: 'var(--nm-accent)', textShadow: '0 0 80px rgba(220,38,38,0.45)' }}
              >
                JAMES
              </motion.span>
            </div>
          </div>

          {/* Thin divider */}
          <motion.div
            className="h-px mb-5"
            style={{ background: 'rgba(255,255,255,0.12)', width: '100%', maxWidth: '28rem' }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.8 }}
          />

          {/* Stats row */}
          <motion.div
            className="mb-6 w-full"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 1.0 }}
          >
            {/* 2×2 grid on mobile, single row on sm+ */}
            <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-center gap-y-3 sm:gap-y-0">
              {HIGHLIGHTS.map((h, i) => (
                <React.Fragment key={h.title}>
                  <StatPill kpi={h.kpi} label={h.title} />
                  {i < HIGHLIGHTS.length - 1 && (
                    <div className="hidden sm:block w-px self-stretch" style={{ background: 'rgba(255,255,255,0.12)' }} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </motion.div>

          {/* Veronica chat bar */}
          <div className="w-full max-w-xl">
            <ChatBar onSubmit={onSubmit} />
          </div>

        </div>
      </div>

      <ScrollDown />
    </section>
  )
}

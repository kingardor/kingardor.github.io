import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Section } from '../../shared/components/Primitives'

const TALK = {
  title:       'NVIDIA GTC 2025',
  session:     'Session S74465',
  url:         'https://www.nvidia.com/en-us/on-demand/session/gtc25-s74465/',
  image:       '/nvidia.webp',
  description: 'Watch my invited talk at NVIDIA GTC 2025, where I discuss cutting-edge AI, robotics, and real-world deployment strategies at scale.',
}

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  show:   {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 180, damping: 22, delay: 0.1 },
  },
}

export default function Talks() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <Section id="talks" className="pt-16 pb-8">
      {/* ── Heading ── */}
      <div className="mb-10">
        <h2
          className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-none"
          style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: 'var(--nm-text)' }}
        >
          Invited Talks
        </h2>
        <div
          className="mt-4 h-px w-full"
          style={{ background: 'linear-gradient(to right, var(--nm-accent) 0%, var(--nm-border) 40%, transparent 100%)' }}
        />
      </div>

      {/* ── Card ── */}
      <motion.div
        ref={ref}
        variants={cardVariants}
        initial="hidden"
        animate={inView ? 'show' : 'hidden'}
      >
        <motion.a
          href={TALK.url}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.012, boxShadow: '0 0 40px var(--nm-accent-glow-strong), 10px 10px 30px var(--nm-shadow-dark), -5px -5px 14px var(--nm-shadow-light)' }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="nm-card-xl relative block w-full overflow-hidden cursor-pointer"
          style={{ textDecoration: 'none' }}
          aria-label={`Watch ${TALK.title} at NVIDIA GTC 2025`}
        >
          {/* ── Full-bleed image + overlays ── */}
          <div className="relative w-full overflow-hidden" style={{ minHeight: 260, maxHeight: 420 }}>
            {/* Background image */}
            <img
              src={TALK.image}
              alt="NVIDIA GTC 2025 talk"
              className="w-full h-full object-cover object-center"
              style={{ minHeight: 260, maxHeight: 420, display: 'block' }}
              loading="lazy"
              decoding="async"
            />

            {/* Gradient overlay — darkens bottom for text legibility */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to bottom, rgba(11,11,15,0.2) 0%, rgba(11,11,15,0.82) 70%, rgba(11,11,15,0.98) 100%)',
                zIndex: 1,
              }}
            />

            {/* Film grain */}
            <div className="grain-overlay" style={{ zIndex: 2, opacity: 0.07 }} />

            {/* FEATURED TALK badge */}
            <span
              className="nm-pill hud-text absolute top-4 left-4 px-3 py-1 text-[10px] font-semibold"
              style={{
                color: 'var(--nm-accent)',
                borderColor: 'rgba(220,38,38,0.35)',
                background: 'rgba(220,38,38,0.12)',
                zIndex: 3,
              }}
            >
              Featured Talk
            </span>

            {/* Text block anchored to bottom of image area */}
            <div
              className="absolute bottom-0 left-0 right-0 px-7 pb-8 pt-4"
              style={{ zIndex: 3 }}
            >
              {/* Session code */}
              <p
                className="hud-text text-[11px] mb-2"
                style={{ color: 'var(--nm-accent)' }}
              >
                {TALK.session}
              </p>

              {/* Title */}
              <h3
                className="leading-none mb-3"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 900,
                  fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                  color: '#ffffff',
                  letterSpacing: '-0.02em',
                }}
              >
                {TALK.title}
              </h3>

              {/* Description */}
              <p
                className="text-sm sm:text-base mb-6 max-w-2xl"
                style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.65 }}
              >
                {TALK.description}
              </p>

              {/* CTA */}
              <span
                className="
                  inline-flex items-center gap-2
                  px-5 py-2.5 rounded-xl
                  text-sm font-semibold
                  transition-all duration-200
                "
                style={{
                  background: 'var(--nm-accent)',
                  color: '#fff',
                  boxShadow: '0 0 18px var(--nm-accent-glow-strong)',
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                Watch Talk
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </motion.a>
      </motion.div>
    </Section>
  )
}

import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Section, SectionHeading } from '../../shared/components/Primitives'
import { NOW_ROLES, PAST_ROLES } from '../../data'

const ALL_ROLES = [
  ...NOW_ROLES.map(r  => ({ ...r, isCurrent: true  })),
  ...PAST_ROLES.map(r => ({ ...r, isCurrent: false })),
]

/* ─── Single chapter entry ──────────────────────────────────────────────── */
function Chapter({ role, index, total }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  /* Extract start year for ghost text */
  const year = role.period.match(/\d{4}/)?.[0] ?? ''

  /* Opacity fades as we go back in time */
  const opacity = role.isCurrent ? 1 : Math.max(0.55, 1 - index * 0.15)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 48 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: index * 0.08 }}
      className="relative w-full"
      style={{ opacity }}
    >
      {/* Ghost year — massive background text */}
      <div
        aria-hidden
        className="absolute pointer-events-none select-none overflow-hidden"
        style={{
          top: '-0.15em',
          right: 0,
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 900,
          fontSize: 'clamp(3.5rem, 10vw, 7rem)',
          lineHeight: 1,
          letterSpacing: '-0.05em',
          color: role.isCurrent ? 'var(--nm-accent)' : 'var(--nm-text)',
          opacity: role.isCurrent ? 0.06 : 0.04,
          userSelect: 'none',
          zIndex: 0,
        }}
      >
        {role.isCurrent ? 'NOW' : year}
      </div>

      {/* Content */}
      <div className="relative z-10 pb-16">

        {/* Counter line */}
        <div className="flex items-center gap-2 sm:gap-4 mb-5 overflow-hidden">
          <span
            className="hud-text text-[10px]"
            style={{ color: role.isCurrent ? 'var(--nm-accent)' : 'var(--nm-text-subtle)', letterSpacing: '0.14em' }}
          >
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          <div className="flex-1 h-px" style={{ background: role.isCurrent ? 'rgba(220,38,38,0.35)' : 'var(--nm-divider)' }} />
          {role.isCurrent && (
            <motion.span
              className="inline-flex items-center gap-1.5 hud-text text-[10px] px-3 py-1"
              style={{
                color: 'var(--nm-accent)',
                border: '1px solid rgba(220,38,38,0.4)',
                borderRadius: '99px',
              }}
              animate={{ opacity: [1, 0.45, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: 'var(--nm-accent)', boxShadow: '0 0 6px var(--nm-accent)' }}
              />
              LIVE
            </motion.span>
          )}
          <span
            className="hud-text text-[10px]"
            style={{ color: 'var(--nm-text-subtle)', letterSpacing: '0.1em' }}
          >
            {role.period}
          </span>
        </div>

        {/* Role title — huge */}
        <h3
          className="mb-2 leading-[0.92] tracking-tight"
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 900,
            fontSize: role.isCurrent
              ? 'clamp(1.5rem, 3.5vw, 2.8rem)'
              : 'clamp(1.1rem, 2.8vw, 2rem)',
            color: role.isCurrent ? 'var(--nm-text)' : 'var(--nm-text-muted)',
          }}
        >
          {role.title}
        </h3>

        {/* Org */}
        <p
          className="hud-text mb-5"
          style={{
            fontSize: '0.72rem',
            letterSpacing: '0.1em',
            color: role.isCurrent ? 'var(--nm-accent)' : 'var(--nm-text-subtle)',
          }}
        >
          {role.org}
        </p>

        {/* Blurb */}
        <p
          className="text-sm sm:text-base leading-relaxed max-w-2xl"
          style={{ color: role.isCurrent ? 'var(--nm-text-muted)' : 'var(--nm-text-subtle)' }}
        >
          {role.blurb}
        </p>

        {/* Tags */}
        {role.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-5">
            {role.tags.map(tag => (
              <span
                key={tag}
                className="hud-text"
                style={{
                  fontSize: '0.6rem',
                  color: role.isCurrent ? 'var(--nm-accent)' : 'var(--nm-text-subtle)',
                  border: `1px solid ${role.isCurrent ? 'rgba(220,38,38,0.3)' : 'var(--nm-border)'}`,
                  borderRadius: '99px',
                  padding: '0.22rem 0.7rem',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom separator */}
      <div
        className="w-full h-px"
        style={{
          background: role.isCurrent
            ? 'linear-gradient(to right, rgba(220,38,38,0.4), rgba(220,38,38,0.1), transparent)'
            : 'var(--nm-divider)',
        }}
      />
    </motion.div>
  )
}

/* ─── Section ───────────────────────────────────────────────────────────── */
export default function Timeline() {
  return (
    <Section id="timeline" className="py-12">

      {/* Heading */}
      <SectionHeading title="Career" />

      {/* Chapters */}
      <div className="flex flex-col gap-0">
        {ALL_ROLES.map((role, i) => (
          <Chapter
            key={role.title + i}
            role={role}
            index={i}
            total={ALL_ROLES.length}
          />
        ))}
      </div>

    </Section>
  )
}

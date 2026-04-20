import React, { useRef } from 'react'
import { ExternalLink } from 'lucide-react'

export const cn = (...c) => c.filter(Boolean).join(' ')

import { motion, useInView } from 'framer-motion'
import { staggerContainer } from '../../utils/motion'

export const Section = ({ id, className, children }) => (
  <motion.section
    id={id}
    variants={staggerContainer(0.2, 0.1)}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.1 }}
    className={cn("relative mx-auto w-full max-w-6xl scroll-mt-28 px-4 sm:px-6 md:px-8", className)}
  >
    {children}
  </motion.section>
)

export const K = ({ children }) => (
  <span style={{ color: 'var(--nm-text)', fontWeight: 600 }}>{children}</span>
)

export const Pill = ({ children, className }) => (
  <span
    className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs backdrop-blur", className)}
    style={{ border: '1px solid var(--nm-border)', background: 'var(--nm-surface)', color: 'var(--nm-text-muted)' }}
  >
    {children}
  </span>
)

export const A = ({ href, children, className }) => {
  const isInternal = typeof href === 'string' && href.startsWith('#')
  return (
    <a
      href={href}
      {...(isInternal ? {} : { target: '_blank', rel: 'noreferrer' })}
      className={cn('group inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition hover:translate-y-[-1px]', className)}
      style={{ border: '1px solid var(--nm-border)', background: 'var(--nm-surface)', color: 'var(--nm-text)' }}
    >
      {children}
      {!isInternal && <ExternalLink className="h-4 w-4 opacity-70 transition group-hover:translate-x-0.5" />}
    </a>
  )
}

export const BrandIcon = ({ icon, className }) => (
  <svg className={cn('h-4 w-4', className)} role="img" viewBox="0 0 24 24" aria-hidden="true">
    <path d={icon?.path} fill="currentColor" />
  </svg>
)

export const SocialButton = ({ href, icon, label }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    style={{
      '--brand': icon ? `#${icon.hex}` : undefined,
      border: '1px solid var(--nm-border)',
      background: 'var(--nm-surface)',
      color: 'var(--nm-text-muted)',
      borderRadius: '0.75rem',
      padding: '0.5rem',
      display: 'inline-flex',
      transition: 'color 0.2s',
    }}
    onMouseEnter={e => { e.currentTarget.style.color = 'var(--brand, var(--nm-accent))' }}
    onMouseLeave={e => { e.currentTarget.style.color = 'var(--nm-text-muted)' }}
  >
    <BrandIcon icon={icon} />
    <span className="sr-only">{label}</span>
  </a>
)

/**
 * SectionHeading — clip-reveal h2 with animated accent bar.
 * Use at the top of each section to replace bare <h2> tags.
 */
export function SectionHeading({ title, className }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <div ref={ref} className={cn('mb-10 sm:mb-12', className)}>
      {/* Overflow clip creates the curtain-lift mask */}
      <div style={{ overflow: 'hidden' }}>
        <motion.h2
          initial={{ y: '105%', opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl sm:text-5xl font-black tracking-tight"
          style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--nm-text)', lineHeight: 1.05 }}
        >
          {title}
        </motion.h2>
      </div>
      {/* Accent bar scales in from left */}
      <motion.div
        className="mt-3 h-px"
        style={{
          background: 'linear-gradient(90deg, var(--nm-accent), rgba(220,38,38,0.3) 50%, transparent)',
          maxWidth: '10rem',
          transformOrigin: 'left center',
        }}
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      />
    </div>
  )
}

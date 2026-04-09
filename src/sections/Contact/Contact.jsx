import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import * as si from 'simple-icons'
import { Section, BrandIcon } from '../../shared/components/Primitives'
import { LINKS } from '../../data'
import { Mail, Linkedin } from 'lucide-react'

const SOCIALS = [
  { label: 'GitHub',    href: LINKS.github,    icon: si.siGithub },
  { label: 'Medium',    href: LINKS.medium,    icon: si.siMedium },
  { label: 'X',         href: LINKS.twitter,   icon: si.siX },
  { label: 'Instagram', href: LINKS.instagram, icon: si.siInstagram },
  { label: 'LinkedIn',  href: LINKS.linkedin,  lucide: Linkedin },
]

export default function Contact() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 18 } },
  }

  return (
    <Section id="contact" className="pt-16 pb-24">
      <motion.div
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate={inView ? 'show' : 'hidden'}
        className="nm-card-xl relative overflow-hidden px-6 py-10 sm:px-10 sm:py-12 text-center max-w-2xl mx-auto"
      >
        {/* Grain overlay */}
        <div className="grain-overlay" />

        {/* Red radial background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(220,38,38,0.18) 0%, transparent 70%)',
          }}
        />

        {/* Headline */}
        <motion.h2
          variants={itemVariants}
          className="relative z-10 font-black tracking-tight"
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
            color: 'var(--nm-text)',
            lineHeight: 1.1,
          }}
        >
          Let's build something
          <br />
          <span style={{ color: 'var(--nm-accent)' }}>outrageous.</span>
        </motion.h2>

        <motion.p
          variants={itemVariants}
          className="relative z-10 mt-4 text-sm hud-text"
          style={{ color: 'var(--nm-text-muted)' }}
        >
          Speaking · Consulting · Collabs
        </motion.p>

        {/* Email CTA */}
        <motion.div variants={itemVariants} className="relative z-10 mt-8">
          <a
            href={LINKS.email}
            className="nm-btn-accent inline-flex items-center gap-3 px-8 py-4 text-white font-bold text-sm sm:text-base tracking-wide transition-transform hover:scale-105 active:scale-95"
            style={{ borderRadius: '0.875rem' }}
          >
            <Mail className="h-5 w-5" />
            GET IN TOUCH →
          </a>
        </motion.div>

        {/* Social pills */}
        <motion.div
          variants={itemVariants}
          className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          {SOCIALS.map(({ label, href, icon, lucide: LucideIcon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="nm-pill inline-flex items-center gap-2 px-4 py-2 text-xs font-medium transition-transform hover:-translate-y-0.5 hover:scale-105"
              style={{ color: 'var(--nm-text)' }}
            >
              {icon && <BrandIcon icon={icon} className="h-3.5 w-3.5" />}
              {LucideIcon && <LucideIcon className="h-3.5 w-3.5" />}
              {label}
            </a>
          ))}
        </motion.div>
      </motion.div>
    </Section>
  )
}

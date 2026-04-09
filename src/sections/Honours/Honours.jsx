import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Section } from '../../shared/components/Primitives'
import { Trophy, ArrowUpRight } from 'lucide-react'
import { HONOURS } from '../../data'

function HonourCard({ honour, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.a
      ref={ref}
      href={honour.url}
      target="_blank"
      rel="noreferrer"
      initial={{ opacity: 0, x: -24 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 18,
        delay: index * 0.12,
      }}
      whileHover={{
        y: -4,
        transition: { type: 'spring', stiffness: 260, damping: 16 },
      }}
      className="nm-card group flex items-center gap-5 px-5 py-4 relative overflow-hidden cursor-pointer"
      style={{ textDecoration: 'none' }}
    >
      {/* Red glow on hover */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 40px rgba(220,38,38,0.18)',
          background: 'radial-gradient(ellipse at left center, rgba(220,38,38,0.06) 0%, transparent 60%)',
        }}
      />

      {/* Left accent bar */}
      <div
        className="absolute left-0 top-4 bottom-4 w-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'linear-gradient(180deg, var(--nm-accent), transparent)' }}
      />

      {/* Trophy icon */}
      <div
        className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center nm-inset"
        style={{ color: 'var(--nm-accent)' }}
      >
        <Trophy className="h-5 w-5" />
      </div>

      {/* Title */}
      <span
        className="flex-1 text-sm sm:text-base font-medium leading-snug transition-colors duration-200 group-hover:text-white"
        style={{ color: 'var(--nm-text)' }}
      >
        {honour.title}
      </span>

      {/* External link arrow */}
      <ArrowUpRight
        className="shrink-0 h-4 w-4 opacity-30 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        style={{ color: 'var(--nm-accent)' }}
      />
    </motion.a>
  )
}

export default function Honours() {
  const headRef = useRef(null)
  const headInView = useInView(headRef, { once: true, margin: '-60px' })

  const headVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 18 } },
  }

  return (
    <Section id="honours" className="pt-16">
      {/* Section heading */}
      <motion.div
        ref={headRef}
        initial="hidden"
        animate={headInView ? 'show' : 'hidden'}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        className="mb-8"
      >
        <motion.h2
          variants={headVariants}
          className="text-4xl sm:text-5xl font-black tracking-tight"
          style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--nm-text)' }}
        >
          Honours
        </motion.h2>
        <motion.div
          variants={headVariants}
          className="mt-4 h-px w-full"
          style={{ background: 'linear-gradient(90deg, var(--nm-accent), transparent)' }}
        />
      </motion.div>

      {/* Award cards */}
      <div className="flex flex-col gap-3">
        {HONOURS.map((honour, i) => (
          <HonourCard key={honour.url} honour={honour} index={i} />
        ))}
      </div>
    </Section>
  )
}

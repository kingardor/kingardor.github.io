import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Section } from '../../shared/components/Primitives'
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react'
import { MEDIUM_POSTS } from '../../data'

const isLikelyMediumPost = (u) => {
  try {
    const url = new URL(u)
    const h = url.hostname
    const p = url.pathname
    const hostOK = h === 'akash-james.medium.com' || h.endsWith('.medium.com') || h === 'medium.com'
    const pathOK =
      p.includes('/@akash-james/') || h === 'akash-james.medium.com' || p.startsWith('/p/')
    const bad = p.startsWith('/m/') || p.startsWith('/membership') || p.startsWith('/tag/')
    return hostOK && pathOK && !bad
  } catch {
    return false
  }
}

const MEDIUM_EXCLUDE_SLUGS = ['hey-mathijs-503a864e2ccc']

function BlogCard({ item, index }) {
  const num = String(index + 1).padStart(2, '0')

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="group block nm-card relative overflow-hidden"
      style={{
        width: '18rem',
        minWidth: '16rem',
        height: '13rem',
        textDecoration: 'none',
        flexShrink: 0,
      }}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top left, rgba(220,38,38,0.08) 0%, transparent 60%)' }}
      />

      <div className="flex flex-col h-full p-5">
        {/* Number badge */}
        <div
          className="font-black hud-text mb-3 select-none"
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '1.75rem',
            lineHeight: 1,
            color: 'var(--nm-accent)',
            textShadow: '0 0 20px rgba(220,38,38,0.4)',
          }}
        >
          #{num}
        </div>

        {/* Title */}
        <div
          className="flex-1 font-semibold text-sm sm:text-base leading-snug"
          style={{
            color: 'var(--nm-text)',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {item.title}
        </div>

        {/* Footer */}
        <div
          className="mt-auto pt-3 flex items-center justify-between"
        >
          <span
            className="hud-text text-[10px]"
            style={{ color: 'var(--nm-text-muted)' }}
          >
            Medium
          </span>
          <span
            className="inline-flex items-center gap-1 text-xs font-medium opacity-50 group-hover:opacity-100 transition-opacity"
            style={{ color: 'var(--nm-accent)' }}
          >
            Read
            <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </a>
  )
}

export default function Publications() {
  const headRef = useRef(null)
  const headInView = useInView(headRef, { once: true, margin: '-60px' })
  const railRef = useRef(null)

  const posts = MEDIUM_POSTS
    .filter((x) => isLikelyMediumPost(x.url))
    .filter((x) => !MEDIUM_EXCLUDE_SLUGS.some((s) => x.url.includes(s)))
    .filter((x, i, arr) => arr.findIndex((y) => y.url === x.url) === i)

  const scrollByCards = (dir) => {
    const el = railRef.current
    if (!el) return
    const amount = Math.round(el.clientWidth * 0.85)
    el.scrollBy({ left: dir * amount, behavior: 'smooth' })
  }

  const headVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 18 } },
  }

  return (
    <Section id="writing" className="pt-16">
      {/* Section heading */}
      <motion.div
        ref={headRef}
        variants={headVariants}
        initial="hidden"
        animate={headInView ? 'show' : 'hidden'}
        className="mb-8"
      >
        <motion.h2
          variants={itemVariants}
          className="text-4xl sm:text-5xl font-black tracking-tight"
          style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--nm-text)' }}
        >
          Writing
        </motion.h2>
        <motion.div
          variants={itemVariants}
          className="mt-4 h-px w-full"
          style={{ background: 'linear-gradient(90deg, var(--nm-accent), transparent)' }}
        />
      </motion.div>

      {/* Carousel */}
      <div className="relative">
        {/* Edge fade masks */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[var(--nm-bg)] to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[var(--nm-bg)] to-transparent z-10" />

        {/* Scroll rail */}
        <div
          ref={railRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [-webkit-overflow-scrolling:touch]"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') scrollByCards(-1)
            if (e.key === 'ArrowRight') scrollByCards(1)
          }}
          onWheel={(e) => {
            if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
              e.preventDefault()
              scrollByCards(e.deltaY > 0 ? 1 : -1)
            }
          }}
        >
          {posts.map((x, i) => (
            <motion.div
              key={x.url}
              className="snap-start shrink-0"
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            >
              <BlogCard item={x} index={i} />
            </motion.div>
          ))}
        </div>

        {/* Nav buttons */}
        <button
          onClick={() => scrollByCards(-1)}
          className="nm-pill absolute left-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center transition-transform hover:-translate-x-0.5 hover:scale-110 active:scale-95"
          style={{ color: 'var(--nm-text)' }}
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => scrollByCards(1)}
          className="nm-pill absolute right-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center transition-transform hover:translate-x-0.5 hover:scale-110 active:scale-95"
          style={{ color: 'var(--nm-text)' }}
          aria-label="Scroll right"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </Section>
  )
}

import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Section } from '../../shared/components/Primitives'
import { getYTid } from '../../shared/utils/yt'
import { YT_VIDEOS as STATIC_YT_VIDEOS } from '../../data'

const API_BASE = 'https://veronica-proxy-vercel.vercel.app'

/* ── Normalise API item or raw URL into a common shape ── */
function toItem(v) {
  if (typeof v === 'string') {
    return { id: getYTid(v), url: v, title: '', isShort: v.includes('/shorts/') }
  }
  return { id: v.id, url: v.url, title: v.title || '', isShort: v.url?.includes('/shorts/') }
}

/* ── Smart thumbnail — detects & skips the 120×90 placeholder ── */
function SmartThumb({ id, className, style }) {
  const [src, setSrc] = useState(`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`)
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      className={className}
      style={style}
      onLoad={e => { if (e.target.naturalWidth <= 120) setSrc(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`) }}
      onError={() => setSrc(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`)}
    />
  )
}

/* ── Skeleton while loading ─────────────────────────────── */
function Skeleton() {
  return (
    <div className="space-y-4">
      <div className="nm-card-xl overflow-hidden">
        <div className="aspect-video w-full skeleton-shimmer" />
      </div>
      <div className="flex gap-3 overflow-hidden">
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className="nm-card overflow-hidden shrink-0" style={{ width: 'clamp(160px, 40vw, 220px)' }}>
            <div className="aspect-video skeleton-shimmer" />
            <div className="h-8 mx-3 my-2 skeleton-shimmer rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Featured video card ─────────────────────────────────── */
function FeaturedCard({ item }) {
  const [playing, setPlaying] = useState(false)
  useEffect(() => { setPlaying(false) }, [item.id])

  return (
    <div className="nm-card-xl relative overflow-hidden">
      <div className="relative w-full aspect-video bg-black">
        <AnimatePresence mode="wait">
          {playing ? (
            <motion.iframe
              key="player"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube.com/embed/${item.id}?autoplay=1`}
              title={item.title || 'YouTube video'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <motion.div
              key="thumb"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              {/* Thumbnail */}
              <SmartThumb
                id={item.id}
                className="absolute inset-0 h-full w-full object-cover"
              />

              {/* Grain */}
              <div className="grain-overlay" style={{ opacity: 0.04 }} />

              {/* Gradient */}
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.92) 100%)' }}
              />

              {/* Top badges */}
              <div className="absolute top-4 left-4 flex gap-2 z-10">
                <span
                  className="hud-text text-[10px] px-3 py-1 nm-pill font-semibold"
                  style={{ color: 'var(--nm-accent)', background: 'rgba(220,38,38,0.15)', borderColor: 'rgba(220,38,38,0.3)' }}
                >
                  {item.isShort ? 'SHORT' : 'VIDEO'}
                </span>
              </div>

              {/* Centered play button */}
              <button
                onClick={() => setPlaying(true)}
                className="absolute inset-0 z-10 flex items-center justify-center"
                aria-label="Play video"
              >
                <motion.div
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                  className="flex h-20 w-20 items-center justify-center rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, #dc2626, #db2777)',
                    boxShadow: '0 0 48px rgba(220,38,38,0.55), 0 0 80px rgba(220,38,38,0.2)',
                  }}
                >
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="white" aria-hidden>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </motion.div>
              </button>

              {/* Title overlay */}
              {item.title && (
                <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 z-10 pointer-events-none">
                  <p
                    className="font-bold leading-snug"
                    style={{
                      fontFamily: 'Outfit, sans-serif',
                      fontSize: 'clamp(1rem, 2.2vw, 1.35rem)',
                      color: '#fff',
                      textShadow: '0 2px 12px rgba(0,0,0,0.7)',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.title}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ── Strip thumbnail card ────────────────────────────────── */
function StripCard({ item, active, onClick, index }) {
  return (
    <motion.div
      onClick={onClick}
      className="nm-card overflow-hidden group relative shrink-0 cursor-pointer"
      style={{ width: 'clamp(160px, 40vw, 220px)' }}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ type: 'spring', stiffness: 200, damping: 22, delay: index * 0.06 }}
      whileHover={{ y: -5 }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-black">
        <SmartThumb
          id={item.id}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Hover dark overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300" />

        {/* Play icon (hover) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ background: 'rgba(220,38,38,0.9)', boxShadow: '0 0 16px rgba(220,38,38,0.5)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Short badge */}
        {item.isShort && (
          <span
            className="hud-text absolute top-2 right-2 text-[9px] px-2 py-0.5 rounded-full font-semibold"
            style={{ background: 'rgba(220,38,38,0.85)', color: '#fff' }}
          >
            SHORT
          </span>
        )}

        {/* Active indicator bar */}
        {active && (
          <motion.div
            layoutId="active-bar"
            className="absolute bottom-0 left-0 right-0 h-[2px]"
            style={{ background: 'var(--nm-accent)', boxShadow: '0 0 8px var(--nm-accent)' }}
          />
        )}
      </div>

      {/* Title under thumbnail */}
      {item.title && (
        <div className="px-3 py-2.5">
          <p
            className="text-[11px] leading-snug"
            style={{
              color: active ? 'var(--nm-accent)' : 'var(--nm-text-muted)',
              fontFamily: 'Outfit, sans-serif',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              transition: 'color 0.2s',
            }}
          >
            {item.title}
          </p>
        </div>
      )}
    </motion.div>
  )
}

/* ── Section ─────────────────────────────────────────────── */
export default function YouTube() {
  const [items, setItems]       = useState(null)
  const [featuredIdx, setFeaturedIdx] = useState(0)
  const stripRef = useRef(null)

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch(`${API_BASE}/api/youtube-feed?d=${Date.now()}`)
        if (r.ok) {
          const data = await r.json()
          if (Array.isArray(data.items) && data.items.length) {
            setItems(data.items.map(toItem))
            return
          }
        }
      } catch { /* fall through */ }
      setItems(STATIC_YT_VIDEOS.map(toItem))
    }
    load()
  }, [])

  const featured = items?.[featuredIdx] ?? null

  const scroll = (dir) => {
    stripRef.current?.scrollBy({ left: dir * 260, behavior: 'smooth' })
  }

  return (
    <Section id="videos" className="pt-16 pb-8">
      {/* ── Heading */}
      <motion.div
        className="mb-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2
          className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-none"
          style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: 'var(--nm-text)' }}
        >
          Talks &amp; Videos
        </h2>
        <div
          className="mt-4 h-px w-full"
          style={{ background: 'linear-gradient(to right, var(--nm-accent) 0%, var(--nm-border) 40%, transparent 100%)' }}
        />
      </motion.div>

      {/* ── Skeleton */}
      {!items && <Skeleton />}

      {/* ── Content */}
      {items && featured && (
        <div className="space-y-4">
          {/* Featured */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <FeaturedCard key={featured.id} item={featured} />
          </motion.div>

          {/* Strip + nav */}
          <div className="relative">
            {/* Left arrow */}
            <button
              onClick={() => scroll(-1)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-20 hidden sm:flex h-9 w-9 items-center justify-center nm-pill rounded-full"
              style={{ color: 'var(--nm-text)' }}
              aria-label="Scroll left"
            >
              ‹
            </button>

            {/* Scrollable strip */}
            <div
              ref={stripRef}
              className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {items.map((item, i) => (
                <div key={item.id} style={{ scrollSnapAlign: 'start' }}>
                  <StripCard
                    item={item}
                    active={i === featuredIdx}
                    onClick={() => setFeaturedIdx(i)}
                    index={i}
                  />
                </div>
              ))}
            </div>

            {/* Right arrow */}
            <button
              onClick={() => scroll(1)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-20 hidden sm:flex h-9 w-9 items-center justify-center nm-pill rounded-full"
              style={{ color: 'var(--nm-text)' }}
              aria-label="Scroll right"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </Section>
  )
}

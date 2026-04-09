import React from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ArrowRight, ExternalLink } from 'lucide-react'
import { cn, Pill } from '../../shared/components/Primitives'

const ProjectSlide = ({ p, isDraggingRef, featured }) => (
  <motion.div
    className="min-w-full p-3 sm:p-4 md:p-6"
    whileHover={{ scale: 1.035, boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18)" }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
  >
    <a
      href={p.url} target="_blank" rel="noreferrer"
      onClick={(e) => { if (isDraggingRef?.current) e.preventDefault(); }}
      className="group block h-full rounded-2xl p-6 md:p-8 transition-all duration-200 focus:outline-none"
      style={{
        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.12)",
        border: "1.5px solid var(--nm-border)",
        background: "var(--nm-surface)",
      }}
    >
      <div className="flex items-center justify-between">
        <div className="font-medium flex items-center gap-2" style={{ color: 'var(--nm-text)' }}>
          {p.name}
          {featured && (
            <span className="ml-2 px-2 py-0.5 rounded-full bg-red-600/80 text-xs text-white font-semibold shadow">Featured</span>
          )}
        </div>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" style={{ color: 'var(--nm-text-muted)' }}/>
      </div>
      <p className="mt-2 text-sm" style={{ color: 'var(--nm-text-muted)' }}>{p.desc}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {p.tags?.map((t) => (
          <span key={t} className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
            style={{ background: 'var(--nm-bg)', color: 'var(--nm-text-muted)', border: '1px solid var(--nm-border)' }}>
            {t}
          </span>
        ))}
      </div>
      <div className="mt-4 inline-flex items-center gap-2 text-sm opacity-70 group-hover:opacity-100" style={{ color: 'var(--nm-text)' }}>
        <span>Open</span><ExternalLink className="h-4 w-4"/>
      </div>
    </a>
  </motion.div>
)

export default function Carousel({ items }) {
  const [i, setI] = React.useState(0)
  const [paused, setPaused] = React.useState(false)
  const count = items.length
  const go = (d) => setI((prev) => (prev + d + count) % count)

  const dragging = React.useRef(false)
  const wheelState = React.useRef({ acc: 0, last: 0 })

  React.useEffect(() => {
    if (paused) return
    const t = setInterval(() => go(1), 6500)
    return () => clearInterval(t)
  }, [count, paused])

  const onWheel = (e) => {
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
    const now = performance.now(), THRESH = 320, COOLDOWN = 700
    const st = wheelState.current
    st.acc += e.deltaY
    if (Math.abs(st.acc) > THRESH && (now - st.last) > COOLDOWN) {
      e.preventDefault(); go(st.acc > 0 ? 1 : -1); st.acc = 0; st.last = now
    }
  }

  return (
    <div
      className="relative px-6 sm:px-8 md:px-10"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'ArrowLeft') go(-1); if (e.key === 'ArrowRight') go(1) }}
      onWheel={onWheel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div className="overflow-hidden rounded-2xl" style={{ border: '1px solid var(--nm-border)' }}>
        <motion.div
          className="flex"
          animate={{ x: `-${i * 100}%` }}
          transition={{ type: 'spring', stiffness: 80, damping: 16 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.18}
          onDragStart={() => { dragging.current = true; setPaused(true) }}
          onDragEnd={(e, info) => {
            const { offset, velocity } = info
            const PX = 120, VX = 800
            if (offset.x < -PX || velocity.x < -VX) go(1)
            else if (offset.x > PX || velocity.x > VX) go(-1)
            setTimeout(() => { dragging.current = false; setPaused(false) }, 120)
          }}
        >
          {items.map((p, idx) => (
            <ProjectSlide
              key={p.name}
              p={p}
              isDraggingRef={dragging}
              featured={idx === 0}
            />
          ))}
        </motion.div>
      </div>

      <button onClick={() => go(-1)} className="absolute left-1.5 top-1/2 -translate-y-1/2 rounded-full p-2 backdrop-blur"
        style={{ border: '1px solid var(--nm-border)', background: 'var(--nm-surface)', color: 'var(--nm-text-muted)' }}>
        <ChevronLeft className="h-5 w-5"/>
      </button>
      <button onClick={() => go(1)} className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full p-2 backdrop-blur"
        style={{ border: '1px solid var(--nm-border)', background: 'var(--nm-surface)', color: 'var(--nm-text-muted)' }}>
        <ChevronRight className="h-5 w-5"/>
      </button>

      <div className="pointer-events-none absolute inset-x-0 bottom-3 md:bottom-4 flex items-center justify-center gap-1.5">
        {items.map((_, idx) => (
          <span key={idx} className="h-1 w-3 rounded-full"
            style={{ background: idx === i ? 'var(--nm-text)' : 'var(--nm-text-dim)' }} />
        ))}
      </div>
    </div>
  )
}

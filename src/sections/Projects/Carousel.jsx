import React from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ArrowRight, ExternalLink } from 'lucide-react'
import { cn, Pill } from '../../shared/components/Primitives'

const ProjectSlide = ({ p, isDraggingRef }) => (
  <div className="min-w-full p-3 sm:p-4 md:p-6">
    <a
      href={p.url} target="_blank" rel="noreferrer"
      onClick={(e) => { if (isDraggingRef?.current) e.preventDefault(); }}
      className="group block h-full rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.03] p-6 md:p-8 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
    >
      <div className="flex items-center justify-between">
        <div className="font-medium text-zinc-100">{p.name}</div>
        <ArrowRight className="h-4 w-4 text-zinc-400 transition-transform group-hover:translate-x-1"/>
      </div>
      <p className="mt-2 text-sm text-zinc-300/90">{p.desc}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {p.tags?.map((t) => <Pill key={t} className="bg-black/40">{t}</Pill>)}
      </div>
      <div className="mt-4 inline-flex items-center gap-2 text-sm text-zinc-200 opacity-80 group-hover:opacity-100">
        <span>Open</span><ExternalLink className="h-4 w-4"/>
      </div>
    </a>
  </div>
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
      <div className="overflow-hidden rounded-2xl border border-white/10">
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
          {items.map((p) => <ProjectSlide key={p.name} p={p} isDraggingRef={dragging} />)}
        </motion.div>
      </div>

      <button onClick={() => go(-1)} className="absolute left-1.5 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/50 p-2 backdrop-blur hover:bg-black/70">
        <ChevronLeft className="h-5 w-5"/>
      </button>
      <button onClick={() => go(1)} className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/50 p-2 backdrop-blur hover:bg-black/70">
        <ChevronRight className="h-5 w-5"/>
      </button>

      <div className="pointer-events-none absolute inset-x-0 bottom-3 md:bottom-4 flex items-center justify-center gap-1.5">
        {items.map((_, idx) => (
          <span key={idx} className={cn("h-1 w-3 rounded-full", idx === i ? 'bg-zinc-200' : 'bg-zinc-600/50')} />
        ))}
      </div>
    </div>
  )
}

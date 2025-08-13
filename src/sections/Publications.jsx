import React from 'react'
import { motion } from 'framer-motion'
import { Section } from '../components/Primitives'
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react'
import { MEDIUM_POSTS } from '../data'

const isLikelyMediumPost = (u) => {
  try {
    const url = new URL(u)
    const h = url.hostname, p = url.pathname
    const hostOK = h === 'akash-james.medium.com' || h.endsWith('.medium.com') || h === 'medium.com'
    const pathOK = p.includes('/@akash-james/') || h === 'akash-james.medium.com' || p.startsWith('/p/')
    const bad = p.startsWith('/m/') || p.startsWith('/membership') || p.startsWith('/tag/')
    return hostOK && pathOK && !bad
  } catch { return false }
}

const BlogCard = ({ item }) => {
  const url = item.url
  const domain = React.useMemo(() => { try { return new URL(url).hostname.replace(/^www\./,'') } catch { return url } }, [url])
  const icon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
  return (
    <a href={url} target="_blank" rel="noreferrer" className="group block h-56 w-64 sm:w-72 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.03] p-4 hover:bg-white/10">
      <div className="flex h-full flex-col">
        <div className="mb-3 flex items-center gap-3">
          <img src={icon} alt="" className="h-5 w-5 rounded-sm" />
          <span className="text-xs text-zinc-400">{domain}</span>
        </div>
        <div className="font-medium text-zinc-100" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {item.title || domain}
        </div>
        <div className="mt-auto inline-flex items-center gap-2 pt-3 text-sm text-zinc-200 opacity-80 transition group-hover:opacity-100">
          <span>Read</span>
        </div>
      </div>
    </a>
  )
}

export default function Publications() {
  const railRef = React.useRef(null)
  const MEDIUM_EXCLUDE_SLUGS = ['hey-mathijs-503a864e2ccc']
  const posts = MEDIUM_POSTS
    .filter(x => isLikelyMediumPost(x.url))
    .filter(x => !MEDIUM_EXCLUDE_SLUGS.some(s => x.url.includes(s)))
    .filter((x, i, arr) => arr.findIndex(y => y.url === x.url) === i)

  const scrollByCards = (dir) => {
    const el = railRef.current; if (!el) return
    const amount = Math.round(el.clientWidth * 0.9)
    el.scrollBy({ left: dir * amount, behavior: 'smooth' })
  }

  return (
    <Section id="writing" className="pt-12">
      <div className="mb-6 flex items-center gap-3">
        <BookOpen className="h-5 w-5 text-zinc-300" />
        <h2 className="text-xl font-semibold text-zinc-100">Publications & Writing</h2>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#0b0b0e] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#0b0b0e] to-transparent" />

        <div ref={railRef} className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none]" style={{ WebkitOverflowScrolling: 'touch' }}
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'ArrowLeft') scrollByCards(-1); if (e.key === 'ArrowRight') scrollByCards(1) }}
          onWheel={(e) => { if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) { e.preventDefault(); scrollByCards(e.deltaY > 0 ? 1 : -1) } }}
        >
          {posts.map((x) => (
            <motion.div key={x.url} className="snap-start w-64 sm:w-72 shrink-0" whileHover={{ y: -4, scale: 1.02 }} transition={{ type: 'spring', stiffness: 220, damping: 18 }}>
              <BlogCard item={x} />
            </motion.div>
          ))}
        </div>

        <button onClick={() => scrollByCards(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/50 p-2 backdrop-blur hover:bg-black/70">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button onClick={() => scrollByCards(1)} className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/50 p-2 backdrop-blur hover:bg-black/70">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </Section>
  )
}

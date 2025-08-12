import React from 'react'
import { Mail } from 'lucide-react'
import * as si from 'simple-icons'

import { SECTION_LINKS, LINKS } from '../lib/data'
import { cn } from '../lib/utils'

// Scroll spy: returns active section id (without #)
const useScrollSpy = (hashes, offset = 160) => {
  const [active, setActive] = React.useState(hashes[0]?.slice(1) || '')
  React.useEffect(() => {
    const ids = hashes.map((h) => h.slice(1))
    const handler = () => {
      const y = window.scrollY + offset
      let cur = ids[0]
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && y >= el.offsetTop) cur = id
      }
      setActive(cur)
    }
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    window.addEventListener('resize', handler)
    return () => { window.removeEventListener('scroll', handler); window.removeEventListener('resize', handler) }
  }, [hashes, offset])
  return active
}

// helpers
const useIsMobile = (bp = 768) => {
  const [m, setM] = React.useState(false)
  React.useEffect(() => {
    const q = window.matchMedia(`(max-width:${bp - 1}px)`)
    const up = () => setM(q.matches)
    up(); q.addEventListener('change', up)
    return () => q.removeEventListener('change', up)
  }, [bp])
  return m
}

// slide-away on scroll (mobile)
const useAutoHideHeader = () => {
  const [hidden, setHidden] = React.useState(false)
  React.useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      const down = y > last && y > 80
      setHidden(down)
      last = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return hidden
}

const BrandIcon = ({ icon, className }) => (
  <svg className={cn('h-4 w-4', className)} role="img" viewBox="0 0 24 24" aria-hidden="true">
    <path d={icon?.path} fill="currentColor" />
  </svg>
)

const SocialButton = ({ href, icon, label }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    style={{ '--brand': icon ? `#${icon.hex}` : undefined }}
    className="group rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-200 hover:bg-white/10 hover:text-[var(--brand)]"
  >
    <BrandIcon icon={icon} />
    <span className="sr-only">{label}</span>
  </a>
)

const Header = () => {
  const active = useScrollSpy(SECTION_LINKS.map((s) => s.href), 160)
  const isMobile = useIsMobile()
  const hidden = useAutoHideHeader()

  return (
    <header
      className="fixed top-4 left-0 right-0 z-50"
      style={{ transform: hidden && isMobile ? 'translateY(-140%)' : 'translateY(0)', transition: 'transform .25s ease' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        {/* single panel; nav centered absolutely so logo/social widths don't matter */}
        <div className="relative rounded-2xl border border-white/10 bg-black/40 backdrop-blur overflow-hidden">
          <div className="relative flex items-center px-3 sm:px-4 py-3">
            {/* logo */}
            <a href="#top" className="font-semibold tracking-wide text-zinc-100">AJ</a>

            {/* centered section nav (desktop only) */}
            <nav className="pointer-events-auto absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:flex items-center gap-1 rounded-xl border border-white/10 bg-black/30 p-1">
              {SECTION_LINKS.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  className={cn(
                    'rounded-lg px-2.5 py-1.5 text-[13px]',
                    active === s.href.slice(1)
                      ? 'text-zinc-100 bg-white/10'
                      : 'text-zinc-300 hover:text-zinc-100 hover:bg-white/10'
                  )}
                >
                  {s.label}
                </a>
              ))}
            </nav>

            {/* socials (right) */}
            <nav className="ml-auto flex items-center gap-2 sm:gap-3">
              <SocialButton href={LINKS.medium} icon={si.siMedium} label="Medium" />
              <SocialButton href={LINKS.github} icon={si.siGithub} label="GitHub" />
              <SocialButton href={LINKS.twitter} icon={si.siX} label="X" />
              <SocialButton href={LINKS.instagram} icon={si.siInstagram} label="Instagram" />
              <a href={LINKS.email} className="group hidden rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-200 hover:bg-white/10 sm:inline-flex"><Mail className="h-4 w-4"/></a>
            </nav>
          </div>

          {/* mobile: hide section links entirely to keep the panel clean */}
          {/* If you want a mobile scroller back later, we can add a toggle sheet. */}
        </div>
      </div>
    </header>
  )
}

export default Header

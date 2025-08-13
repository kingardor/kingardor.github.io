import React from 'react'
import * as si from 'simple-icons'
import { Mail } from 'lucide-react'
import { LINKS, SECTION_LINKS } from '../data'
import useScrollSpy from '../hooks/useScrollSpy'
import useIsMobile from '../hooks/useIsMobile'
import useAutoHideHeader from '../hooks/useAutoHideHeader'
import { SocialButton, cn } from '../components/Primitives'

export default function Header() {
  const active = useScrollSpy(SECTION_LINKS.map((s) => s.href), 160)
  const isMobile = useIsMobile()
  const hidden = useAutoHideHeader()

  return (
    <header
      className="fixed top-4 left-0 right-0 z-50"
      style={{ transform: hidden && isMobile ? 'translateY(-140%)' : 'translateY(0)', transition: 'transform .25s ease' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="relative rounded-2xl border border-white/10 bg-black/40 backdrop-blur overflow-hidden">
          <div className="relative flex items-center px-3 sm:px-4 py-3">
            <a href="#top" className="font-semibold tracking-wide text-zinc-100">AJ</a>

            <nav className="pointer-events-auto absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:flex items-center gap-1 rounded-xl border border-white/10 bg-black/30 p-1">
              {SECTION_LINKS.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  className={cn(
                    'rounded-lg px-2.5 py-1.5 text-[13px]',
                    active === s.href.slice(1) ? 'text-zinc-100 bg-white/10' : 'text-zinc-300 hover:text-zinc-100 hover:bg-white/10'
                  )}
                >
                  {s.label}
                </a>
              ))}
            </nav>

            <nav className="ml-auto flex items-center gap-2 sm:gap-3">
              <SocialButton href={LINKS.medium} icon={si.siMedium} label="Medium" />
              <SocialButton href={LINKS.github} icon={si.siGithub} label="GitHub" />
              <SocialButton href={LINKS.twitter} icon={si.siX} label="X" />
              <SocialButton href={LINKS.instagram} icon={si.siInstagram} label="Instagram" />
              <a href={LINKS.email} className="group hidden rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-200 hover:bg-white/10 sm:inline-flex"><Mail className="h-4 w-4"/></a>
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}

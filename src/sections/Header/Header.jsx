import { siMedium, siGithub, siX, siInstagram } from 'simple-icons'
import { Mail } from 'lucide-react'
import { LINKS, SECTION_LINKS } from '../../data'
import useScrollSpy from '../../shared/hooks/useScrollSpy'
import useIsMobile from '../../shared/hooks/useIsMobile'
import useAutoHideHeader from '../../shared/hooks/useAutoHideHeader'
import { SocialButton, cn } from '../../shared/components/Primitives'
import ThemeToggle from '../../shared/components/ThemeToggle'

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
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
          }}
        >
          <div className="relative flex items-center px-3 sm:px-4 py-3">

            {/* Logo */}
            <a
              href="#top"
              className="font-black tracking-tight"
              style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--nm-text)', fontSize: '1rem' }}
            >
              AJ<span style={{ color: 'var(--nm-accent)' }}>.</span>
            </a>

            {/* Nav links */}
            <nav className="pointer-events-auto absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:flex items-center gap-1 rounded-xl p-1"
              style={{ background: 'var(--nm-bg)', border: '1px solid var(--nm-border)' }}>
              {SECTION_LINKS.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  className={cn(
                    'rounded-lg px-2.5 py-1.5 text-[13px] transition-colors',
                    active === s.href.slice(1)
                      ? 'bg-white/10'
                      : 'hover:bg-white/8'
                  )}
                  style={{
                    color: active === s.href.slice(1) ? 'var(--nm-text)' : 'var(--nm-text-muted)',
                  }}
                >
                  {s.label}
                </a>
              ))}
            </nav>

            {/* Right actions */}
            <nav className="ml-auto flex items-center gap-2 sm:gap-2.5">
              <SocialButton href={LINKS.medium} icon={siMedium} label="Medium" />
              <SocialButton href={LINKS.github} icon={siGithub} label="GitHub" />
              <SocialButton href={LINKS.twitter} icon={siX} label="X" />
              <SocialButton href={LINKS.instagram} icon={siInstagram} label="Instagram" />
              <a
                href={LINKS.email}
                className="hidden sm:inline-flex rounded-xl p-2 transition-colors"
                style={{ border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.04)', color: 'var(--nm-text-muted)' }}
              >
                <Mail className="h-4 w-4" />
              </a>

              <ThemeToggle />
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}

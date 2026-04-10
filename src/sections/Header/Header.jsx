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
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 4px 32px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        >
          {/* Fluid glass blobs */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
            <div style={{
              position: 'absolute', width: 200, height: 200, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(220,38,38,0.55) 0%, transparent 65%)',
              filter: 'blur(32px)',
              animation: 'fluidBlob1 8s ease-in-out infinite',
              top: '-80%', left: '5%',
            }} />
            <div style={{
              position: 'absolute', width: 160, height: 160, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(219,39,119,0.45) 0%, transparent 65%)',
              filter: 'blur(28px)',
              animation: 'fluidBlob2 11s ease-in-out infinite',
              top: '-60%', right: '10%',
            }} />
            <div style={{
              position: 'absolute', width: 120, height: 120, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(220,38,38,0.35) 0%, transparent 65%)',
              filter: 'blur(20px)',
              animation: 'fluidBlob3 7s ease-in-out infinite',
              top: '-40%', left: '40%',
            }} />
          </div>
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

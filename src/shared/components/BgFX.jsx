import { useTheme } from '../contexts/ThemeContext'

export default function BgFX() {
  const { theme } = useTheme()
  const isDark = theme !== 'light'

  return (
    <div className="fixed inset-0 -z-10 h-full w-full" style={{ background: 'var(--nm-bg)' }}>
      {/* Bottom vignette (dark) or subtle red radial glow (light) */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.6) 100%)'
            : 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(220,38,38,0.06), transparent 70%)',
        }}
      />
    </div>
  )
}

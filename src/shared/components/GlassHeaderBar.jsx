import { useTheme } from '../contexts/ThemeContext'

export default function GlassHeaderBar() {
  const { theme } = useTheme()

  const isDark = theme !== 'light'

  return (
    <>
      {/* Base glass layer */}
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl"
        aria-hidden="true"
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(32px) saturate(180%)',
          WebkitBackdropFilter: 'blur(32px) saturate(180%)',
        }}
      />

      {/* Top-edge highlight — the signature "glass pane" glint */}
      <div
        className="absolute pointer-events-none rounded-2xl"
        aria-hidden="true"
        style={{
          inset: 0,
          background: isDark
            ? 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, transparent 40%)'
            : 'linear-gradient(180deg, rgba(255,255,255,0.60) 0%, transparent 40%)',
        }}
      />

      {/* Chromatic shimmer — slow sweep across the top edge */}
      <div
        className="absolute pointer-events-none overflow-hidden rounded-2xl"
        aria-hidden="true"
        style={{ inset: 0 }}
      >
        <div style={{
          position: 'absolute',
          top: 0,
          left: '-60%',
          width: '40%',
          height: '1px',
          background: isDark
            ? 'linear-gradient(90deg, transparent, rgba(220,38,38,0.7), rgba(219,39,119,0.5), rgba(255,255,255,0.6), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(220,38,38,0.4), rgba(219,39,119,0.3), rgba(255,255,255,0.8), transparent)',
          animation: 'glassShimmer 5s ease-in-out infinite',
        }} />
      </div>

      {/* Bottom-edge shadow line */}
      <div
        className="absolute pointer-events-none rounded-2xl"
        aria-hidden="true"
        style={{
          inset: 0,
          background: isDark
            ? 'linear-gradient(0deg, rgba(0,0,0,0.18) 0%, transparent 30%)'
            : 'linear-gradient(0deg, rgba(0,0,0,0.04) 0%, transparent 30%)',
        }}
      />
    </>
  )
}

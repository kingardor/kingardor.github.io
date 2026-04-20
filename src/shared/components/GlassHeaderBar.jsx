import { useTheme } from '../contexts/ThemeContext'

export default function GlassHeaderBar() {
  const { theme } = useTheme()

  const isDark = theme !== 'light'

  return (
    <>
      {/* Base glass layer — excluded from data-transitioning to avoid backdrop-filter repaint every frame */}
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl"
        aria-hidden="true"
        data-no-transition
        style={{
          background: isDark ? 'rgba(17,17,22,0.5)' : 'rgba(228,233,240,0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          willChange: 'backdrop-filter',
          transform: 'translateZ(0)',
        }}
      />

      {/* Top-edge highlight — the signature "glass pane" glint */}
      <div
        className="absolute pointer-events-none rounded-2xl"
        aria-hidden="true"
        style={{
          inset: 0,
          background: isDark
            ? 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 40%)'
            : 'linear-gradient(180deg, rgba(255,255,255,0.30) 0%, transparent 40%)',
        }}
      />

      {/* Bottom-edge shadow line */}
      <div
        className="absolute pointer-events-none rounded-2xl"
        aria-hidden="true"
        style={{
          inset: 0,
          background: isDark
            ? 'linear-gradient(0deg, rgba(0,0,0,0.09) 0%, transparent 30%)'
            : 'linear-gradient(0deg, rgba(0,0,0,0.02) 0%, transparent 30%)',
        }}
      />
    </>
  )
}

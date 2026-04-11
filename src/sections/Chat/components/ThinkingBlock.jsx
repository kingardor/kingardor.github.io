import React from 'react'

/**
 * ThinkingBlock — two modes:
 *   isLive=true  → expanded panel with pulsing dot, auto-scrolls as tokens stream in
 *   isLive=false → collapsed "THOUGHT PROCESS" pill the user can click to expand
 */
export default function ThinkingBlock({ text, isLive = false }) {
  const [open, setOpen] = React.useState(false)
  const scrollRef = React.useRef(null)

  // Auto-scroll to bottom while thinking is streaming
  React.useEffect(() => {
    if (isLive && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [text, isLive])

  if (!text) return null

  /* ── Live / expanded mode ── */
  if (isLive) {
    return (
      <div style={{
        marginBottom: '0.75rem',
        border: '1px solid var(--nm-border)',
        borderLeft: '2px solid var(--nm-accent)',
        borderRadius: '0.5rem',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.4rem 0.75rem',
          background: 'var(--nm-surface)',
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
            background: 'var(--nm-accent)',
            animation: 'pulseGlow 1s ease-in-out infinite',
          }} />
          <span className="hud-text" style={{
            fontSize: '0.55rem', color: 'var(--nm-accent)', letterSpacing: '0.14em',
          }}>
            THINKING
          </span>
        </div>
        <div
          ref={scrollRef}
          style={{
            padding: '0.5rem 0.75rem',
            background: 'var(--nm-bg)',
            borderTop: '1px solid var(--nm-border)',
            maxHeight: 140,
            overflowY: 'auto',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: 'var(--nm-text-subtle)',
            lineHeight: 1.75,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {text}
        </div>
      </div>
    )
  }

  /* ── Collapsed / done mode ── */
  return (
    <div style={{
      marginBottom: '0.6rem',
      border: '1px solid var(--nm-border)',
      borderRadius: '0.5rem',
      overflow: 'hidden',
      opacity: 0.6,
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.35rem 0.75rem',
          background: 'var(--nm-surface)',
          border: 'none', cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span style={{
          width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
          background: 'var(--nm-text-muted)',
        }} />
        <span className="hud-text" style={{
          fontSize: '0.52rem', color: 'var(--nm-text-muted)',
          letterSpacing: '0.12em', flex: 1,
        }}>
          THOUGHT PROCESS
        </span>
        <span style={{ color: 'var(--nm-text-subtle)', fontSize: '0.6rem' }}>
          {open ? '▴' : '▾'}
        </span>
      </button>
      {open && (
        <div style={{
          padding: '0.5rem 0.75rem',
          background: 'var(--nm-bg)',
          borderTop: '1px solid var(--nm-border)',
          maxHeight: 200, overflowY: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          color: 'var(--nm-text-subtle)',
          lineHeight: 1.75,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          {text}
        </div>
      )}
    </div>
  )
}

import React from 'react'

/**
 * ThinkingBlock — collapsible chain-of-thought panel above AI response.
 * Hidden entirely if `text` is empty.
 */
export default function ThinkingBlock({ text }) {
  const [open, setOpen] = React.useState(false)

  if (!text) return null

  return (
    <div
      style={{
        marginBottom: '0.6rem',
        border: '1px solid var(--nm-border)',
        borderRadius: '0.5rem',
        overflow: 'hidden',
        opacity: 0.75,
      }}
    >
      {/* Header toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 0.75rem',
          background: 'var(--nm-surface)',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {/* Pulse dot */}
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            flexShrink: 0,
            background: 'var(--nm-text-muted)',
          }}
        />
        <span
          className="hud-text"
          style={{ fontSize: '0.55rem', color: 'var(--nm-text-muted)', letterSpacing: '0.12em', flex: 1 }}
        >
          VERONICA IS THINKING
        </span>
        <span style={{ color: 'var(--nm-text-subtle)', fontSize: '0.65rem' }}>
          {open ? '▴' : '▾'}
        </span>
      </button>

      {/* Expanded body */}
      {open && (
        <div
          style={{
            padding: '0.6rem 0.75rem',
            background: 'var(--nm-bg)',
            borderTop: '1px solid var(--nm-border)',
            maxHeight: 200,
            overflowY: 'auto',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            color: 'var(--nm-text-subtle)',
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {text}
        </div>
      )}
    </div>
  )
}

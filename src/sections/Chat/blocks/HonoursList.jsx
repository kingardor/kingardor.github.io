import React from 'react'

export default function HonoursList({ data }) {
  const honours = data?.honours ?? []
  if (!honours.length) return null

  return (
    <div style={{ marginTop: '0.75rem' }}>
      <div
        className="hud-text"
        style={{ fontSize: '0.55rem', color: 'var(--nm-text-muted)', letterSpacing: '0.12em', marginBottom: '0.5rem' }}
      >
        HONOURS & RECOGNITION
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {honours.map((h, i) => (
          <a
            key={i}
            href={h.url}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.5rem 0.75rem',
              background: 'var(--nm-surface)',
              border: '1px solid var(--nm-border)',
              borderLeft: '2px solid var(--nm-accent)',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderRightColor = 'var(--nm-accent)'}
            onMouseLeave={e => e.currentTarget.style.borderRightColor = 'var(--nm-border)'}
          >
            <span style={{ color: 'var(--nm-accent)', fontSize: '0.9rem', flexShrink: 0 }}>★</span>
            <span style={{ color: 'var(--nm-text)', fontSize: '0.78rem', lineHeight: 1.4 }}>{h.title}</span>
            <span style={{ color: 'var(--nm-text-muted)', fontSize: '0.7rem', marginLeft: 'auto', flexShrink: 0 }}>↗</span>
          </a>
        ))}
      </div>
    </div>
  )
}

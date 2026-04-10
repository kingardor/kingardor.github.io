import React from 'react'

export default function PublicationList({ data }) {
  const pubs = data?.publications ?? []
  if (!pubs.length) return null

  return (
    <div style={{ marginTop: '0.75rem' }}>
      <div
        className="hud-text"
        style={{ fontSize: '0.55rem', color: 'var(--nm-text-muted)', letterSpacing: '0.12em', marginBottom: '0.5rem' }}
      >
        PUBLISHED WRITING
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {pubs.map((p, i) => {
          const Tag = p.url ? 'a' : 'div'
          const linkProps = p.url ? { href: p.url, target: '_blank', rel: 'noreferrer' } : {}
          return (
          <Tag
            key={i}
            {...linkProps}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.5rem 0.75rem',
              background: 'var(--nm-surface)',
              border: '1px solid var(--nm-border)',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--nm-accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--nm-border)'}
          >
            <span
              style={{
                padding: '0.1rem 0.35rem',
                background: 'var(--nm-bg)',
                border: '1px solid var(--nm-border)',
                borderRadius: 3,
                fontSize: '0.58rem',
                color: 'var(--nm-accent)',
                fontFamily: 'var(--font-mono)',
                flexShrink: 0,
              }}
            >
              {p.platform}
            </span>
            <span style={{ color: 'var(--nm-text)', fontSize: '0.78rem', lineHeight: 1.4 }}>
              {p.title}
            </span>
            <span style={{ color: 'var(--nm-text-muted)', fontSize: '0.7rem', marginLeft: 'auto', flexShrink: 0 }}>↗</span>
          </Tag>
          )
        })}
      </div>
    </div>
  )
}

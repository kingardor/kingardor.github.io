import React from 'react'

export default function ProjectGrid({ data }) {
  const projects = data?.projects ?? []
  if (!projects.length) return null

  return (
    <div style={{ marginTop: '0.75rem' }}>
      <div
        className="hud-text"
        style={{ fontSize: '0.55rem', color: 'var(--nm-text-muted)', letterSpacing: '0.12em', marginBottom: '0.5rem' }}
      >
        OPEN SOURCE PROJECTS
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.6rem' }}>
        {projects.map(p => (
          <a
            key={p.name}
            href={p.url}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'block',
              padding: '0.75rem',
              background: 'var(--nm-surface)',
              border: '1px solid var(--nm-border)',
              borderRadius: '0.6rem',
              textDecoration: 'none',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--nm-accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--nm-border)'}
          >
            <div style={{ color: 'var(--nm-text)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', lineHeight: 1.3 }}>
              {p.name}
            </div>
            <div style={{ color: 'var(--nm-text-muted)', fontSize: '0.72rem', lineHeight: 1.5, marginBottom: '0.5rem' }}>
              {p.desc}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
              {(p.tags || []).map(tag => (
                <span
                  key={tag}
                  style={{
                    padding: '0.15rem 0.4rem',
                    background: 'var(--nm-bg)',
                    border: '1px solid var(--nm-border)',
                    borderRadius: 4,
                    fontSize: '0.62rem',
                    color: 'var(--nm-accent)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

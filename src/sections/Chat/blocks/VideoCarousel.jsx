import React from 'react'

function timeAgo(isoStr) {
  if (!isoStr) return ''
  const diff = Date.now() - new Date(isoStr).getTime()
  const d = Math.floor(diff / 86400000)
  if (d < 1)  return 'today'
  if (d < 7)  return `${d}d ago`
  if (d < 30) return `${Math.floor(d / 7)}w ago`
  if (d < 365) return `${Math.floor(d / 30)}mo ago`
  return `${Math.floor(d / 365)}y ago`
}

export default function VideoCarousel({ data }) {
  const items = data?.items ?? []
  if (!items.length) return null

  return (
    <div style={{ marginTop: '0.75rem' }}>
      <div
        className="hud-text"
        style={{ fontSize: '0.55rem', color: 'var(--nm-text-muted)', letterSpacing: '0.12em', marginBottom: '0.5rem' }}
      >
        LATEST VIDEOS
      </div>
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--nm-border) transparent',
        }}
      >
        {items.map(v => (
          <a
            key={v.id}
            href={v.url}
            target="_blank"
            rel="noreferrer"
            style={{
              flexShrink: 0,
              width: 180,
              background: 'var(--nm-surface)',
              border: '1px solid var(--nm-border)',
              borderRadius: '0.6rem',
              overflow: 'hidden',
              textDecoration: 'none',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--nm-accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--nm-border)'}
          >
            {/* Thumbnail */}
            <div style={{ position: 'relative', aspectRatio: '16/9', background: 'var(--nm-bg)', overflow: 'hidden' }}>
              <img
                src={v.thumb}
                alt={v.title}
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {/* Play icon overlay */}
              <div
                style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(0,0,0,0.35)',
                }}
              >
                <div style={{
                  width: 0, height: 0,
                  borderLeft: '16px solid rgba(255,255,255,0.9)',
                  borderTop: '10px solid transparent',
                  borderBottom: '10px solid transparent',
                  marginLeft: 4,
                }} />
              </div>
            </div>
            {/* Meta */}
            <div style={{ padding: '0.5rem 0.65rem' }}>
              <div style={{
                color: 'var(--nm-text)',
                fontSize: '0.75rem',
                fontWeight: 600,
                lineHeight: 1.35,
                marginBottom: '0.3rem',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {v.title}
              </div>
              <div style={{ color: 'var(--nm-text-muted)', fontSize: '0.65rem' }}>
                {timeAgo(v.publishedAt)}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

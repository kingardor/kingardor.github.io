import { useEffect, useState } from 'react'
import { DATA } from '../prototype/dataAdapter.js'
import { SectionHead } from './lib/effects.jsx'

function getYTId(url) {
  return url?.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1] || null
}

function SmartThumb({ id, thumb }) {
  const initial = id ? `https://i.ytimg.com/vi/${id}/maxresdefault.jpg` : (thumb || '')
  const [src, setSrc] = useState(initial)
  if (!src) return null
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      onLoad={e => { if (id && e.target.naturalWidth <= 120) setSrc(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`) }}
      onError={() => { if (id) setSrc(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`) }}
    />
  )
}

/** Screening room: one large hairline frame + a mono episode index beside it. */
export default function VideosSection({ videos: propVideos }) {
  const videosData = propVideos || DATA.videos
  const [active, setActive] = useState(0)
  const [playing, setPlaying] = useState(false)
  const allVideos = [videosData.featured, ...(videosData.strip || [])].filter(Boolean)
  const cur = allVideos[active] || allVideos[0]

  useEffect(() => { setPlaying(false) }, [active])

  if (!cur) return null
  const curId = getYTId(cur.url)

  return (
    <section className="ob-videos" id="videos" data-screen-label="05 Signals">
      <div className="ob-wrap">
        <SectionHead kicker="SIGNALS" index="004" title="Live from the workshop." />
        <div className="ob-screening">
          <div className="ob-screen reveal">
            {playing && curId ? (
              <iframe
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                src={`https://www.youtube.com/embed/${curId}?autoplay=1`}
                title={cur.title || 'YouTube video'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <>
                {curId && <SmartThumb key={curId} id={curId} thumb={cur.thumb} />}
                <div className="ob-screen-shade" />
                <div className="ob-screen-rec mono-ob"><span className="ob-live-dot" />REC · CH {cur.num}</div>
                <button
                  className="ob-screen-play"
                  onClick={() => curId ? setPlaying(true) : cur.url && window.open(cur.url, '_blank')}
                  aria-label="Play video"
                >
                  <svg width="22" height="22" viewBox="0 0 28 28" fill="none"><path d="M9 6L22 14L9 22V6Z" fill="currentColor" /></svg>
                </button>
                {cur.title && <div className="ob-screen-title">{cur.title}</div>}
              </>
            )}
          </div>
          <ol className="ob-episodes mono-ob">
            {allVideos.map((v, i) => (
              <li key={getYTId(v.url) || i}>
                <button
                  className={`ob-episode${active === i ? ' active' : ''}`}
                  onClick={() => setActive(i)}
                >
                  <span className="ob-episode-num">CH {v.num}</span>
                  <span className="ob-episode-title">{v.title || 'TRANSMISSION'}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

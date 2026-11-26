import { useEffect, useRef, useState } from 'react'
import { TALKS } from '../../content/index.js'
import { Talker } from './parts.jsx'
import { isReduced } from './data.js'

const ytId = url => url?.match(/[?&]v=([\w-]{11})/)?.[1]
const KIND = { panel: 'LIVE PANEL!', workshop: 'HANDS-ON!', exhibit: 'ON DISPLAY!', stage: 'ON STAGE!', demo: 'LIVE DEMO!', webinar: 'WEBINAR!', show: 'TV SHOW!', talk: 'TALK!' }
const fmt = d => {
  if (!d) return 'Date on request'
  if (/–/.test(d)) return d
  const [y, m, day] = d.split('-')
  const M = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  return [day && +day, m && M[+m - 1], y].filter(Boolean).join(' ')
}
const sealOf = t => (t.where.includes('GTC') ? t.where.split('·')[0].trim() : null)

/** Talks as a retro TV with a channel dial and a printed TV guide. */
export default function TVSpots() {
  const [ch, setCh] = useState(TALKS.findIndex(t => t.video))
  const [playing, setPlaying] = useState(false)
  const [static_, setStatic] = useState(false)
  const reduced = useRef(isReduced()).current
  const t = TALKS[ch]
  const id = ytId(t.video)
  const seal = sealOf(t)

  useEffect(() => {
    if (reduced) return
    setStatic(true)
    const tm = setTimeout(() => setStatic(false), 320)
    return () => clearTimeout(tm)
  }, [ch, reduced])

  const tune = (i) => { setPlaying(false); setCh((i + TALKS.length) % TALKS.length) }

  return (
    <section id="mb-tv" className="mb-tv" aria-labelledby="mb-tv-title">
      <Talker kicker="Act V · talks, stages, booths" title={<span id="mb-tv-title">As seen on TV</span>} sub="Ten spots, one channel dial. Two of them actually play. The rest you had to be there for." tone="pink" />

      <div className="mb-tv-row">
        <div className="mb-set-tv">
          <div className="mb-crt">
            <div className="mb-crt-screen">
              {playing && id ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
                  title={t.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen
                />
              ) : (
                <div className="mb-slate" aria-live="polite">
                  {id && <img className="mb-slate-thumb" src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" width="480" height="360" loading="lazy" />}
                  <div className="mb-slate-in">
                    <span className="mb-slate-kind">{KIND[t.kind] || 'ON AIR!'}</span>
                    <p className="mb-slate-where">AS SEEN AT<br /><b>{t.where}</b></p>
                    <h3 className="mb-slate-title">{t.title}</h3>
                    <p className="mb-slate-date">{fmt(t.date)}</p>
                    {id && (
                      <button type="button" className="mb-btn mb-slate-play" onClick={() => setPlaying(true)}>▶ PLAY THE SPOT</button>
                    )}
                  </div>
                </div>
              )}
              <span className="mb-crt-osd" aria-hidden="true">CH {String(ch + 1).padStart(2, '0')}</span>
              <i className={`mb-crt-static${static_ ? ' is-on' : ''}`} aria-hidden="true" />
              <i className="mb-crt-glass" aria-hidden="true" />
            </div>
            <div className="mb-crt-panel">
              <span className="mb-crt-brand">AJ·VISION</span>
              <div className="mb-crt-knob" style={{ '--a': `${ch * 36}deg` }} aria-hidden="true"><i /></div>
              <div className="mb-crt-btns">
                <button type="button" onClick={() => tune(ch - 1)} aria-label="Previous channel">CH ▾</button>
                <button type="button" onClick={() => tune(ch + 1)} aria-label="Next channel">CH ▴</button>
              </div>
              <span className="mb-crt-grille" aria-hidden="true" />
            </div>
          </div>
          {seal && (
            <div className="mb-tv-seal" aria-label={`As seen at ${seal}`}>
              <span>AS SEEN AT</span><b>{seal.replace('NVIDIA ', 'NVIDIA ')}</b>
            </div>
          )}
        </div>

        <div className="mb-guide">
          <div className="mb-guide-h"><b>TV GUIDE</b><span>AKASH JAMES · ALL CHANNELS</span></div>
          <ol className="mb-guide-list">
            {TALKS.map((x, i) => (
              <li key={x.title}>
                <button type="button" className={`mb-guide-row${i === ch ? ' is-on' : ''}`} onClick={() => tune(i)} aria-current={i === ch}>
                  <span className="mb-guide-ch">{String(i + 1).padStart(2, '0')}</span>
                  <span className="mb-guide-main">
                    <b>{x.title}</b>
                    <span>{x.where} · {fmt(x.date)}</span>
                  </span>
                  {x.video && <span className="mb-guide-tag">PLAYS</span>}
                  {sealOf(x) && <span className="mb-guide-tag mb-guide-tag--gtc">GTC</span>}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

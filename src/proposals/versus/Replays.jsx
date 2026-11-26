import { useState } from 'react'
import { REPLAYS } from './data.js'
import { ModeHeader } from './StoryMode.jsx'
import { useEnter } from './fx.js'

const TAPES = REPLAYS.filter(r => r.yt)
const fmt = (d) => (d ? d.replace(/-/g, '.') : 'UNDATED')

function Theatre() {
  const [tape, setTape] = useState(0)
  const [playing, setPlaying] = useState(false)
  const t = TAPES[tape]
  return (
    <div className="vs-theatre">
      <div className="vs-theatre-screen">
        <span className="vs-rec" aria-hidden="true"><i />REC</span>
        <span className="vs-theatre-tc" aria-hidden="true">REPLAY {String(t.n).padStart(2, '0')} · {t.where.toUpperCase()}</span>
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${t.yt}?autoplay=1&rel=0`}
            title={t.title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button type="button" className="vs-theatre-play" onClick={() => setPlaying(true)} aria-label={`Play replay: ${t.title}`}>
            <img src={`/work/${t.yt}.jpg`} alt="" width="480" height="360" loading="lazy" />
            <span className="vs-theatre-btn" aria-hidden="true">
              <svg viewBox="0 0 40 40"><path d="M13 9 L32 20 L13 31Z" /></svg>
              PLAY REPLAY
            </span>
          </button>
        )}
      </div>
      <div className="vs-theatre-side">
        <p className="vs-theatre-label">TAPES ON FILE · {TAPES.length}</p>
        {TAPES.map((x, i) => (
          <button
            key={x.yt} type="button"
            className={`vs-tape${i === tape ? ' is-on' : ''}`}
            onClick={() => { setTape(i); setPlaying(i === tape ? true : false) }}
            aria-pressed={i === tape}
          >
            <span className="vs-tape-n">TAPE {String.fromCharCode(65 + i)}</span>
            <span className="vs-tape-title">{x.title}</span>
            <span className="vs-tape-where">{x.where}</span>
          </button>
        ))}
        <p className="vs-theatre-note">Plays inline from youtube-nocookie. Nothing loads until you press play.</p>
      </div>
    </div>
  )
}

function Match({ r }) {
  const ref = useEnter((el) => el.classList.add('is-in'), { line: 0.92 })
  return (
    <li className={`vs-match${r.best ? ' is-best' : ''}`} ref={ref}>
      <span className="vs-match-n">{String(r.n).padStart(2, '0')}</span>
      <div className="vs-match-body">
        <p className="vs-match-vs"><b>AKASH</b> <i>vs</i> <span>{r.where}</span></p>
        <p className="vs-match-title">{r.title}</p>
      </div>
      <div className="vs-match-meta">
        <span className="vs-match-kind">{r.kind.toUpperCase()}</span>
        <span className="vs-match-date">{fmt(r.date)}</span>
        {r.best && <span className="vs-best">BEST MOMENT</span>}
        {r.yt && <span className="vs-match-tape">ON TAPE</span>}
      </div>
    </li>
  )
}

export default function Replays() {
  return (
    <section id="vs-replays" className="vs-section vs-replays" aria-labelledby="vs-replays-h">
      <ModeHeader
        id="vs-replays-h"
        no={5}
        title="REPLAY THEATRE"
        sub="TALKS · STAGES · BOOTHS · WORKSHOPS · PANELS"
        taunt="Watch the tape. Study the footwork."
        side="right"
      />
      <Theatre />
      <div className="vs-history">
        <h3 className="vs-history-h"><span>MATCH HISTORY</span> <span>{REPLAYS.length} ON RECORD</span></h3>
        <ol className="vs-history-list">
          {REPLAYS.map(r => <Match key={r.title} r={r} />)}
        </ol>
      </div>
    </section>
  )
}

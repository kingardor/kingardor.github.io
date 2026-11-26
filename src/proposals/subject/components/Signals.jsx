import { useState } from 'react'
import { TALKS } from '../../../content/index.js'
import { CLS, KIND_CLS, waveform, ytId } from '../lib/data.js'
import { notePlay } from '../lib/session.js'
import SecHead from './SecHead.jsx'

function Wave({ seed, cls }) {
  const bars = waveform(seed, 22)
  return (
    <svg className="sj-wave" viewBox="0 0 66 16" width="66" height="16" aria-hidden="true" style={{ '--c': CLS[cls] }}>
      {bars.map((b, i) => <rect key={i} x={i * 3} y={8 - b * 7} width="1.5" height={Math.max(1, b * 14)} />)}
    </svg>
  )
}

// Where he is in each thumbnail (frame-relative): left, top, width, height
const CLIP_BOX = { '1VQXLXshKNY': [0.6, 0.17, 0.31, 0.62], J0fhEByPzVQ: [0.1, 0.36, 0.15, 0.28] }

function Clip({ talk }) {
  const [on, setOn] = useState(false)
  const id = ytId(talk.video)
  const cb = CLIP_BOX[id] || [0.35, 0.15, 0.3, 0.6]
  return (
    <figure className="sj-clip">
      <div className="sj-clip-frame">
        {on ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            title={talk.title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button type="button" className="sj-clip-play" onClick={() => { setOn(true); notePlay(talk.title) }} aria-label={`Play: ${talk.title}`}>
            <img src={`/work/${id}.jpg`} alt="" width="480" height="360" loading="lazy" decoding="async" />
            <span className="sj-box sj-on sj-clip-box" style={{ '--c': CLS.person, left: `${cb[0] * 100}%`, top: `${cb[1] * 100}%`, width: `${cb[2] * 100}%`, height: `${cb[3] * 100}%` }}>
              <span className="sj-box-tab"><span className="sj-box-label">person 0.97 · id 001 · talking</span></span>
            </span>
            <span className="sj-clip-btn">play signal ▸</span>
          </button>
        )}
      </div>
      <figcaption><span className="sj-k">{talk.where}</span> {talk.title}</figcaption>
    </figure>
  )
}

export default function Signals() {
  const clips = TALKS.filter(t => t.video)
  return (
    <section id="sj-signals" className="sj-sec sj-signals" aria-labelledby="sj-signals-h">
      <div className="sj-flank sj-flank-l">
        <SecHead n={6} act={5} cls="screen" id="sj-signals-h" label="signals" title="SIGNALS"
          dek="Stages, booths, panels and workshops. The red light means it’s on. It has always been on." />
        <div className="sj-clips">{clips.map(t => <Clip key={t.video} talk={t} />)}</div>
      </div>
      <div className="sj-flank sj-flank-r">
        <ol className="sj-plate sj-siglog" aria-label="Signal log">
          {TALKS.map((t, i) => (
            <li key={t.title} className="sj-sig">
              <span className="sj-sig-t sj-dot">{t.date || '—'}</span>
              <Wave seed={t.title} cls={KIND_CLS[t.kind] || 'unknown'} />
              <span className="sj-sig-x">
                <span className="sj-sig-k" style={{ '--c': CLS[KIND_CLS[t.kind] || 'unknown'] }}>{t.kind}</span>
                <b>{t.title}</b>
                <span className="sj-sig-w">{t.where}</span>
                {t.video && <a className="sj-link" href={t.video} target="_blank" rel="noreferrer">watch on YouTube ↗</a>}
              </span>
              <span className="sj-sig-n">sig {String(i + 1).padStart(2, '0')}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

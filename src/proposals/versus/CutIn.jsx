import { useEffect, useRef, useState } from 'react'
import { useFilmAct } from '../shared/useFilm.js'
import { getFilm } from '../../components/story/filmPosition.js'
import { META, photoOf } from '../../components/portrait/portraitSets.js'
import { SUPERS } from './data.js'
import { reduced, isVsOpen } from './fx.js'
import { Streaks } from './Art.jsx'

// How long a cut-in stays up; matches --vs-cut in versus.css.
const CUT_MS = 2400

// Where his eyes sit in each act's footage (v, 0..1), for the eye-line crop.
// (Film only: under the portrait stage the crop comes from the photo itself.)
const EYES = [0.33, 0.33, 0.36, 0.35, 0.37, 0.37, 0.45, 0.36]

const photos = {}
function photo(set) {
  if (!photos[set]) { photos[set] = new Image(); photos[set].src = photoOf(set) }
  return photos[set]
}

/** Eye line from the studio photo: centred on his sunglasses, strip-shaped. */
function drawPhotoEyes(ctx, w, h) {
  const set = document.querySelector('.portrait-stage')?.dataset.set || 'wide'
  const m = META[set]
  const img = photo(set)
  const draw = () => {
    const [a, b] = m.lenses
    const cx = ((Math.min(a[0], b[0]) + Math.max(a[2], b[2])) / 2) * m.width
    const cy = ((Math.min(a[1], b[1]) + Math.max(a[3], b[3])) / 2) * m.height
    const sw = (Math.max(a[2], b[2]) - Math.min(a[0], b[0])) * m.width * 1.9
    const sh = (sw * h) / w
    ctx.drawImage(img, cx - sw / 2, cy - sh / 2, sw, sh, 0, 0, w, h)
  }
  if (img.complete && img.naturalWidth) draw()
  else img.addEventListener('load', draw, { once: true })
}

/**
 * Super cut-in: on every act change, a diagonal strip tears across with that
 * act's super name and a duotone crop of his eyes, taken live from the film
 * canvas or, under the portrait stage, from the studio photo.
 */
export default function CutIn() {
  const act = useFilmAct()
  const prev = useRef(act)
  const [shot, setShot] = useState(null)
  const eyeRef = useRef(null)

  useEffect(() => {
    if (act === prev.current) return
    const forward = act > prev.current
    prev.current = act
    if (reduced() || isVsOpen()) return
    setShot({ act, forward, key: Date.now() })
    const t = setTimeout(() => setShot(null), CUT_MS)
    return () => clearTimeout(t)
  }, [act])

  // Grab the eye line from the film canvas as the strip mounts.
  useEffect(() => {
    if (!shot) return
    const src = document.querySelector('.lab-film canvas')
    const dst = eyeRef.current
    if (!dst) return
    if (!src) { drawPhotoEyes(dst.getContext('2d'), dst.width, dst.height); return }
    const { rect } = getFilm()
    if (!rect.w) return
    const dpr = src.width / window.innerWidth
    const v = EYES[shot.act] ?? 0.35
    const sx = (rect.x + rect.w * 0.3) * dpr, sw = rect.w * 0.4 * dpr
    const sy = (rect.y + rect.h * (v - 0.075)) * dpr, sh = rect.h * 0.15 * dpr
    const ctx = dst.getContext('2d')
    try {
      ctx.drawImage(src, sx, sy, sw, sh, 0, 0, dst.width, dst.height)
    } catch { /* canvas not ready */ }
  }, [shot])

  if (!shot) return null
  return (
    <div className={`vs-cutin${shot.forward ? '' : ' is-back'}`} key={shot.key} aria-hidden="true">
      <div className="vs-cutin-strip">
        <Streaks className="vs-cutin-streaks" seed={shot.act + 3} />
        <canvas ref={eyeRef} className="vs-cutin-eyes" width="640" height="180" />
        <div className="vs-cutin-text">
          <span className="vs-cutin-kicker">SUPER ART {String(shot.act + 1).padStart(2, '0')} / 08</span>
          <span className="vs-cutin-name vs-mis" data-text={SUPERS[shot.act]}>{SUPERS[shot.act]}</span>
        </div>
      </div>
    </div>
  )
}

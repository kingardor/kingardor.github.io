import PortraitStage from '../../components/portrait/PortraitStage.jsx'
import FlankName from '../../components/portrait/FlankName.jsx'
import useLoaderRelease from '../shared/useLoaderRelease.js'
import './portrait-lab.css'

// Six acts, one per chapter below; each gets its own look.
const ACTS = [
  { id: 'pt-cover' }, { id: 'pt-ember' }, { id: 'pt-lens' },
  { id: 'pt-cool' }, { id: 'pt-rec' }, { id: 'pt-final' },
]
const LOOKS = [
  { zoom: 1.00, fx: 0.50, fy: 0.40, warm: 0.55, cool: 0.45, lens: 0.20, rec: 0 },
  { zoom: 1.05, fx: 0.47, fy: 0.40, warm: 1.00, cool: 0.10, lens: 0.20, rec: 0 },
  { zoom: 1.14, fx: 0.495, fy: 0.30, warm: 0.45, cool: 0.50, lens: 1.00, rec: 0 },
  { zoom: 1.05, fx: 0.53, fy: 0.40, warm: 0.10, cool: 1.00, lens: 0.30, rec: 0 },
  { zoom: 1.12, fx: 0.50, fy: 0.31, warm: 0.40, cool: 0.60, lens: 0.60, rec: 1 },
  { zoom: 1.00, fx: 0.50, fy: 0.42, warm: 0.80, cool: 0.80, lens: 0.30, rec: 0 },
]
// Brightest shots where the camera pushes in on the lenses (chapters 03 and 05).
const REFLECTIONS = [
  '/work/noir/rover.webp', '/work/vector/vector.webp', '/work/copcars/garage.webp',
  '/work/q-pocket/board.webp', '/work/hermes/console.webp', '/work/veronica/hud.webp',
]

const CHAPTERS = [
  {
    id: 'pt-ember', side: 'right', n: '02', label: 'Key light',
    title: 'The light follows you.',
    body: 'Move the cursor. The ember rim on his left and the blue on his right trade places, a soft key light slides across his face, and the room shifts in depth: backdrop, name and subject on three planes.',
  },
  {
    id: 'pt-lens', side: 'left', n: '03', label: 'Reflections',
    title: 'His glasses see the work.',
    body: 'The camera pushes in on the lenses. Each section puts something new in them: here, the covers of his projects, mirrored, the way a real lens would hold them.',
  },
  {
    id: 'pt-cool', side: 'left', n: '04', label: 'Cool side',
    title: 'Every section has a look.',
    body: 'Zoom, framing and the balance of the two lights are set per section and travel between them as you scroll. Scroll back and you get the same shot: it is a function of where you are.',
  },
  {
    id: 'pt-rec', side: 'right', n: '05', label: 'REC',
    title: 'The camera on his face is on.',
    body: 'Those are camera glasses. In the recording acts the capture LED at the right temple lights up. Cameras record everything; he teaches them to remember.',
  },
]

export default function PortraitLab() {
  useLoaderRelease('600 1rem "Clash Display"')
  return (
    <div className="pt-root">
      <PortraitStage acts={ACTS} looks={LOOKS} reflections={REFLECTIONS} layerClass="lab-film" scrim={false} compactActs={6} pane={null} midground={<FlankName />} />
      <main className="lab-root pt-main">
        <section id="pt-cover" className="pt-hero">
          <h1 className="pt-name-front">AKASH <span>JAMES<b>.</b></span></h1>
          <p className="pt-tag">Director AI - BLUE.<br />I teach cameras to remember.</p>
          <p className="pt-cue">Scroll<span className="pt-cue-ptr"> · move the cursor</span></p>
        </section>
        {CHAPTERS.map(c => (
          <section key={c.id} id={c.id} className={`pt-ch pt-${c.side}`}>
            <div className="pt-card">
              <p className="pt-label"><span>{c.n}</span> {c.label}</p>
              <h2>{c.title}</h2>
              <p>{c.body}</p>
            </div>
          </section>
        ))}
        <section id="pt-final" className="pt-ch pt-final">
          <div className="pt-card">
            <p className="pt-label"><span>06</span> In place</p>
            <h2>See it under the real pages.</h2>
            <p>It replaces the cyborg film everywhere: same sections, same hooks for overlays. Add <code>?bg=film</code> to any page to compare with the old film.</p>
            <ul className="pt-links">
              <li><a href="#/mint">Mint in Box</a></li>
              <li><a href="#/versus">Versus</a></li>
              <li><a href="#/">Pick an edition</a></li>
              <li><a href="#/lab">Back to the lab</a></li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  )
}

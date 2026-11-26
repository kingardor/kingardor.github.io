import { useEffect } from 'react'
import PortraitStage from '../components/portrait/PortraitStage.jsx'
import FlankName from '../components/portrait/FlankName.jsx'
import useLoaderRelease from '../proposals/shared/useLoaderRelease.js'
import { EDITIONS, ORDER, lastEdition } from './editions.js'
import '../proposals/shared/film.css'
import '../proposals/versus/fonts.css'
import './editions.css'

const ACTS = [{ id: 'ed-pick' }]
const LOOKS = [{ zoom: 1.0, fx: 0.5, fy: 0.42, warm: 0.75, cool: 0.7, lens: 0.25, rec: 0 }]

/**
 * The front door of the peer-review build: his portrait, and the two
 * candidate designs as editions to pick from. `?edition=mint|versus` skips
 * straight to one (for sharing a specific edition).
 */
export default function EditionPicker() {
  useLoaderRelease('600 1rem "Clash Display"')
  useEffect(() => {
    const m = window.location.search.match(/[?&]edition=(mint|versus)\b/)
    if (m) window.location.replace(`#/${m[1]}`)
  }, [])
  const last = lastEdition()

  return (
    <div className="ed-root">
      <PortraitStage acts={ACTS} looks={LOOKS} layerClass="lab-film" scrim={false} compactActs={1} pane={null} midground={<FlankName />} />
      <main id="ed-pick" className="lab-root ed-main">
        <h1 className="ed-name">Akash <span>James<b>.</b></span></h1>
        <header className="ed-head">
          <p className="ed-k">Director AI - BLUE</p>
          <p className="ed-sub">Two editions of this site are in review. Pick one; switch any time from the bar at the bottom.</p>
        </header>
        <div className="ed-cards">
          {ORDER.map(k => {
            const e = EDITIONS[k]
            return (
              <a key={k} href={`#/${k}`} className={`ed-card ed-card-${k}`}>
                <span className="ed-card-in">
                  {last === k && <span className="ed-last">Last viewed</span>}
                  <span className="ed-kind">{e.kind}</span>
                  <span className="ed-title">{e.name}</span>
                  <span className="ed-pitch">{e.pitch}</span>
                  <span className="ed-cta">{e.cta} <i aria-hidden="true">▸</i></span>
                </span>
              </a>
            )
          })}
        </div>
      </main>
    </div>
  )
}

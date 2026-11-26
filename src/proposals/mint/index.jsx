import { useEffect, useState } from 'react'
import FilmStage from '../../components/portrait/FilmStage.jsx'
import useLoaderRelease from '../shared/useLoaderRelease.js'
import { subscribe } from '../../shared/scroll/scrollStore.js'
import { PROJECTS } from '../../content/index.js'
import HeroBox from './HeroBox.jsx'
import BlueSet from './BlueSet.jsx'
import Provenance from './Provenance.jsx'
import Accessories from './Accessories.jsx'
import Pegboard from './Pegboard.jsx'
import Playset from './Playset.jsx'
import TVSpots from './TVSpots.jsx'
import Manuals from './Manuals.jsx'
import TrophyShelf from './TrophyShelf.jsx'
import ShipLabel from './ShipLabel.jsx'
import { StickerLayer } from './Stickers.jsx'
import { Chrome } from './parts.jsx'
import { useCollection } from './collection.js'
import '../shared/film.css' // pins the stage (.lab-film); also loaded outside the lab router
import './mint.css'
import './sections.css'
import './box.css'
import { ACTS } from './acts.js'

function TopTag() {
  const { opened } = useCollection()
  const [on, setOn] = useState(false)
  useEffect(() => subscribe((y) => { const v = y > window.innerHeight * 1.9; setOn(o => (o === v ? o : v)); return false }), [])
  return (
    <nav className={`mb-top${on ? ' is-on' : ''}`} aria-label="Mint in Box">
      <a className="mb-top-logo" href="#mb-box" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0 }) }}>
        <Chrome text="AJ" /><small>MINT IN BOX · No. 001</small>
      </a>
      <div className="mb-top-r">
        <a className="mb-top-count" href="#mb-wall" aria-label={`Collected ${opened.length} of 8 boxes. Go to the pegboard`}>
          COLLECTED {opened.length}/8
          <i aria-hidden="true">{PROJECTS.map(p => <b key={p.slug} className={opened.includes(p.slug) ? 'on' : ''} />)}</i>
        </a>
        <a className="mb-btn mb-top-ask" href="#/chat">ASK VERONICA ▸</a>
      </div>
    </nav>
  )
}

export default function Proposal() {
  useLoaderRelease('italic 900 1rem "MB Mona"')
  return (
    <>
      <FilmStage acts={ACTS} layerClass="lab-film" scrim={false} compactActs={8} pane={null} />
      <main className="lab-root mb-root">
        <div className="mb-garage-dim" aria-hidden="true" />
        <TopTag />
        <HeroBox />
        <div className="mb-after">
          <BlueSet />
          <Provenance />
          <Accessories />
          <Pegboard />
          <Playset />
          <TVSpots />
          <Manuals />
          <TrophyShelf />
          <ShipLabel />
        </div>
        <StickerLayer />
      </main>
    </>
  )
}

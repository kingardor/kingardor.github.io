import { useState } from 'react'
import FilmStage from '../../components/portrait/FilmStage.jsx'
import useLoaderRelease from '../shared/useLoaderRelease.js'
import { ACTS } from './data.js'
import TitleScreen from './TitleScreen.jsx'
import { Hud, Combo, Credits, Announcer, FlashLayer } from './Hud.jsx'
import CutIn from './CutIn.jsx'
import { StoryMode, FinalRound } from './StoryMode.jsx'
import MoveList from './MoveList.jsx'
import CharacterSelect from './CharacterSelect.jsx'
import TrainingStage from './TrainingStage.jsx'
import Replays from './Replays.jsx'
import Lore from './Lore.jsx'
import Trophies from './Trophies.jsx'
import Continue from './Continue.jsx'
import '../shared/film.css' // pins the stage (.lab-film); also loaded outside the lab router
import './fonts.css'
import './versus.css'
import './sections.css'
import './select.css'
import './rest.css'

/**
 * VERSUS: the homepage as a fighting game's menu system, printed like a
 * riso fight poster. Akash is Player 1 (his lit portrait behind every
 * screen), the projects are the roster.
 */
export default function Versus() {
  useLoaderRelease('900 1rem "Big Shoulders Display"')
  const [live, setLive] = useState(false)
  return (
    <>
      <FilmStage acts={ACTS} layerClass="lab-film" scrim={false} compactActs={8} pane={null} />
      <div className="vs-print" aria-hidden="true" />
      <main className={`lab-root vs-root${live ? ' is-live' : ''}`}>
        <a className="vs-skip" href="#vs-story">Skip to story mode</a>
        <Hud live={live} />
        <TitleScreen live={live} onLive={() => setLive(true)} />
        <StoryMode />
        <FinalRound />
        <MoveList />
        <CharacterSelect />
        <TrainingStage />
        <Replays />
        <Lore />
        <Trophies />
        <Continue />
        <Combo />
        <Credits />
        <CutIn />
        <Announcer />
        <FlashLayer />
      </main>
    </>
  )
}

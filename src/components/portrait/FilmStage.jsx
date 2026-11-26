import SequenceCanvas from '../story/SequenceCanvas.jsx'
import PortraitStage from './PortraitStage.jsx'
import { portraitBg } from './portraitFlag.js'

/** The story film, or the portrait stage when the page was opened with ?bg=portrait. */
export default function FilmStage(props) {
  return portraitBg() ? <PortraitStage {...props} /> : <SequenceCanvas {...props} />
}

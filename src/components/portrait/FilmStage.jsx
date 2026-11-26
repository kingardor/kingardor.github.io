import SequenceCanvas from '../story/SequenceCanvas.jsx'
import PortraitStage from './PortraitStage.jsx'
import { portraitBg } from './portraitFlag.js'

/** The portrait stage, or the old story film when the page was opened with ?bg=film. */
export default function FilmStage(props) {
  return portraitBg() ? <PortraitStage {...props} /> : <SequenceCanvas {...props} />
}

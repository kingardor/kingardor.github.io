import LazyBench from '../../anatomy/LazyBench.jsx'
import { ModeHeader } from './StoryMode.jsx'
import './training.css'

/** The anatomy bench as the stage the roster trains on between fights. */
export default function TrainingStage() {
  return (
    <section id="vs-training" className="vs-section vs-training" aria-labelledby="vs-training-h">
      <ModeHeader
        id="vs-training-h"
        no="EX"
        title="TRAINING STAGE"
        sub="THE BENCH · 9 OBJECTS · HOVER TO INSPECT · OR LET IT TOUR"
        taunt="Where the roster trains between fights."
        ink="yellow"
        side="right"
      />
      <div className="vs-training-frame">
        <span className="vs-training-tag" aria-hidden="true">STAGE · THE BENCH</span>
        <LazyBench />
      </div>
    </section>
  )
}

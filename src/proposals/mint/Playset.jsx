import LazyBench from '../../anatomy/LazyBench.jsx'
import { Barcode, Burst, PrintMarks, AgeBadge, Talker } from './parts.jsx'
import './playset.css'

/** The anatomy bench, boxed as the playset you buy to keep the figures in. */
export default function Playset() {
  return (
    <section id="mb-playset" className="mb-play" aria-labelledby="mb-play-title">
      <Talker
        kicker="Sold separately"
        title={<span id="mb-play-title">Workshop playset</span>}
        sub="Where the figures live when they're off the pegboard. Nine pieces, one mug. Hover anything."
        tone="pink"
      />
      <div className="mb-play-box">
        <div className="mb-play-head">
          <span>AKASH JAMES COLLECTIBLES · PLAYSET No. 01</span>
          <span className="mb-play-head-r">THE BENCH</span>
        </div>
        <div className="mb-play-window">
          <LazyBench />
        </div>
        <div className="mb-play-foot">
          <PrintMarks className="mb-play-marks" />
          <p className="mb-fine">Assembly required. Cables included. Mug may be spotted by rover. Figures shown sold separately, obviously.</p>
          <AgeBadge />
          <Barcode seed="akash-james-playset" className="mb-play-barcode" />
        </div>
        <Burst className="mb-play-burst" fill="#FFD400" ink="#111" points={16}>
          <small>9 PIECES</small><b>LIVE!</b>
        </Burst>
      </div>
    </section>
  )
}

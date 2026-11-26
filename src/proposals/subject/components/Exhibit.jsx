import LazyBench from '../../../anatomy/LazyBench.jsx'
import { CLS } from '../lib/data.js'

/** EXHIBIT: the bench, framed as evidence. Extends act 4; the figure labels itself. */
export default function Exhibit() {
  return (
    <section id="sj-exhibit" className="sj-exhibit" aria-labelledby="sj-exhibit-h">
      <div className="sj-exhibit-frame" style={{ '--c': CLS.hardware }}>
        <p className="sj-exhibit-tab">
          <span className="sj-tab" id="sj-exhibit-h">exhibit · the bench · 9 objects</span>
          <span className="sj-k">seized from his desk · act 04 cont.</span>
        </p>
        <LazyBench className="sj-exhibit-fig" />
      </div>
    </section>
  )
}

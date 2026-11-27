import { Burst } from '../../../../proposals/versus/Art.jsx'
import Notation from './Notation.jsx'
import { guessInput } from './moves.js'

/** Her holographic face, cropped from the Voice screen (as on the roster). */
export function Face({ className = '' }) {
  return (
    <span className={`vq-face ${className}`} aria-hidden="true">
      <img src="/work/veronica/hud.webp" width="1280" height="820" alt="" decoding="async" />
    </span>
  )
}

/**
 * Empty state: HERE COMES A NEW CHALLENGER! The visitor (1P) vs Veronica,
 * No.03 THE QUEEN, and the suggestions as a command list of moves.
 */
export default function Splash({ suggestions, onPick, disabled }) {
  return (
    <section className="vq-splash" aria-labelledby="vq-splash-h">
      <p className="vq-splash-call" id="vq-splash-h">
        <span className="vq-mis" data-text="HERE COMES A NEW CHALLENGER!">HERE COMES A NEW CHALLENGER!</span>
      </p>

      <div className="vq-vs">
        <div className="vq-vs-p1">
          <span className="vq-vs-tag">1P</span>
          <span className="vq-vs-you vq-mis" data-text="YOU">YOU</span>
          <span className="vq-vs-sub">CHALLENGER · ASKS THE QUESTIONS</span>
        </div>
        <div className="vq-vs-crash" aria-hidden="true">
          <Burst className="vq-vs-burst" seed={31} spikes={16} inks={['hi', 'spot']} />
          <span className="vq-vs-word">VS</span>
        </div>
        <div className="vq-vs-p2">
          <Face className="vq-vs-face" />
          <div className="vq-vs-p2-label">
            <span className="vq-vs-no">No.03 · THE QUEEN</span>
            <span className="vq-vs-name vq-mis" data-text="VERONICA">VERONICA</span>
            <span className="vq-vs-sub">HIS WEB TWIN · ANSWERS FOR HIM</span>
          </div>
        </div>
      </div>

      <div className="vq-cmd">
        <div className="vq-cmd-head">
          <h2 className="vq-cmd-h">COMMAND LIST</h2>
          <span className="vq-cmd-n">{suggestions.length} MOVES · PICK ONE OR TYPE YOUR OWN</span>
        </div>
        <ol className="vq-cmd-list">
          {suggestions.map((s, i) => {
            const input = guessInput(s)
            return (
              <li key={s}>
                <button type="button" className="vq-cmd-b" onClick={() => onPick(s)} disabled={disabled} style={{ '--n': i }}>
                  <span className="vq-cmd-no" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <span className="vq-cmd-text">{s}</span>
                  <Notation input={input} small />
                  <span className="vq-cmd-go" aria-hidden="true">▸</span>
                </button>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

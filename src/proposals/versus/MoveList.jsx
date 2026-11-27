import { SUPER_ARTS, SPECIALS, NORMALS, TRAINING, BUTTONS, describeInput } from './data.js'
import { InputNotation } from './Art.jsx'
import { ModeHeader } from './StoryMode.jsx'
import { useEnter } from './fx.js'

function MoveRow({ m, tier }) {
  return (
    <tr className={`vs-move vs-move-${tier}`} tabIndex={0}>
      <th scope="row" className="vs-move-name">
        <span>{m.name}</span>
        <small>{m.from}</small>
      </th>
      <td className="vs-move-input"><InputNotation input={m.input} label={describeInput(m.input)} /></td>
      <td className="vs-move-startup" data-label="STARTUP">{m.startup}</td>
      <td className="vs-move-hit" data-label="ON HIT">{m.hit}</td>
      <td className="vs-move-notes" data-label="NOTES">{m.notes}</td>
    </tr>
  )
}

function MoveTable({ title, tag, moves, tier }) {
  return (
    <table className={`vs-moves-table vs-moves-${tier}`}>
      <caption>
        <span className="vs-moves-cap">{title}</span>
        <span className="vs-moves-cap-tag">{tag}</span>
      </caption>
      <thead>
        <tr>
          <th scope="col">MOVE</th>
          <th scope="col">INPUT</th>
          <th scope="col">STARTUP</th>
          <th scope="col">ON HIT</th>
          <th scope="col">NOTES</th>
        </tr>
      </thead>
      <tbody>
        {moves.map(m => <MoveRow key={m.name} m={m} tier={tier} />)}
      </tbody>
    </table>
  )
}

export default function MoveList() {
  const ref = useEnter((el) => el.classList.add('is-in'), { line: 0.8 })
  return (
    <section id="vs-moves" className="vs-section vs-moves" aria-labelledby="vs-moves-h">
      <ModeHeader
        id="vs-moves-h"
        no={3}
        title="MOVE LIST"
        sub="COMMAND LIST · FRAME DATA FROM THE RECEIPTS · HOVER A MOVE TO INPUT IT"
        taunt="Learn the inputs. You still won’t land them."
        side="right"
        ink="hi"
      />
      <div className="vs-moves-pad" ref={ref}>
        <div className="vs-moves-legend" aria-label="Button legend">
          {BUTTONS.map(b => (
            <span key={b.k} className="vs-legend-item">
              <svg className={`vs-key vs-key-btn vs-btn-${b.k}`} viewBox="0 0 32 32" aria-hidden="true">
                <circle cx="16" cy="16" r="14" /><text x="16" y="21.5" textAnchor="middle">{b.k}</text>
              </svg>
              {b.name.toUpperCase()}
            </span>
          ))}
          <span className="vs-legend-note">NUMPAD NOTATION · 6 = FORWARD</span>
        </div>

        <MoveTable title="SUPER ARTS" tag="BLUE · COSTS FULL METER" moves={SUPER_ARTS} tier="super" />
        <MoveTable title="SPECIAL MOVES" tag="FROM THE RECORD BOOKS" moves={SPECIALS} tier="special" />

        <div className="vs-normals">
          <h3 className="vs-normals-title">COMMAND NORMALS</h3>
          {NORMALS.map(g => (
            <div className="vs-normal" key={g.name}>
              <span className="vs-normal-btn">
                <svg className={`vs-key vs-key-btn vs-btn-${g.button}`} viewBox="0 0 32 32" aria-hidden="true">
                  <circle cx="16" cy="16" r="14" /><text x="16" y="21.5" textAnchor="middle">{g.button}</text>
                </svg>
                <span>{g.name.toUpperCase()}</span>
              </span>
              <ul className="vs-normal-items">
                {g.items.map(it => <li key={it}>{it}</li>)}
              </ul>
            </div>
          ))}
        </div>

        <table className="vs-train">
          <caption><span className="vs-moves-cap">TRAINING MODE</span><span className="vs-moves-cap-tag">YEARS IN THE LAB</span></caption>
          <thead>
            <tr><th scope="col">TECH</th><th scope="col">YEARS</th><th scope="col">LEVEL</th></tr>
          </thead>
          <tbody>
            {TRAINING.map(t => (
              <tr key={t.tech}>
                <th scope="row">{t.tech}</th>
                <td><span className="vs-train-bar" style={{ '--vs-w': t.years / 8 }} aria-hidden="true" /><span>{t.years} YRS</span></td>
                <td className={`vs-train-lv vs-train-${t.level.toLowerCase()}`}>{t.level.toUpperCase()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

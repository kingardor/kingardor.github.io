import { EDITIONS, ORDER, switchEdition } from './editions.js'
import './editions.css'

/** Floating edition toggle on both candidate designs (peer-review build). */
export default function EditionSwitch({ current }) {
  return (
    <nav className="ed-switch" aria-label="Site edition">
      <a className="ed-switch-k" href="#/" aria-label="All editions">Edition</a>
      {ORDER.map(k => (
        <button
          key={k}
          type="button"
          className={`ed-switch-b ed-${k}${k === current ? ' is-on' : ''}`}
          aria-pressed={k === current}
          onClick={() => { if (k !== current) switchEdition(k) }}
        >
          {EDITIONS[k].name}
        </button>
      ))}
    </nav>
  )
}

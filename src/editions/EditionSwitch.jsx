import { useEffect, useState } from 'react'
import { subscribe } from '../shared/scroll/scrollStore.js'
import { EDITIONS, ORDER, switchEdition } from './editions.js'
import './editions.css'

/**
 * Floating edition toggle on both candidate designs (peer-review build).
 * It stays out of each edition's title screen (where its own furniture
 * lives, and the visitor has only just picked) and appears once they scroll.
 */
export default function EditionSwitch({ current }) {
  const [on, setOn] = useState(false)
  useEffect(() => {
    document.documentElement.classList.add('ed-has-switch')
    const off = subscribe((y) => {
      const v = y > window.innerHeight * 0.55
      document.documentElement.classList.toggle('ed-switch-on', v)
      setOn(o => (o === v ? o : v))
      return false
    })
    return () => { off(); document.documentElement.classList.remove('ed-has-switch', 'ed-switch-on') }
  }, [])
  return (
    <nav className={`ed-switch${on ? ' is-on' : ''}`} aria-label="Site edition">
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

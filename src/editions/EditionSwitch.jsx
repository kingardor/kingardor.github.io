import { useEffect, useState } from 'react'
import { subscribe } from '../shared/scroll/scrollStore.js'
import { EDITIONS, ORDER, switchEdition } from './editions.js'
import './editions.css'

const NARROW = '(max-width: 900px), (max-width: 1000px) and (max-height: 500px)'

/**
 * Floating edition toggle on both candidate designs (peer-review build).
 * It stays out of each edition's title screen (where its own furniture lives
 * and the visitor has only just picked). Past it, wide screens keep it up;
 * on phones it gets out of the way while you read down the page and comes
 * back when you scroll up or reach the end. Open viewers (box, VS screen)
 * hide it via CSS.
 */
/**
 * onPick: handle the choice in place (the chat swaps Veronica's skin) instead
 * of navigating. always: skip the scroll-driven show/hide (pages that don't
 * scroll the window).
 */
export default function EditionSwitch({ current, onPick, always = false }) {
  const [on, setOn] = useState(always)
  useEffect(() => {
    if (always) return
    const root = document.documentElement
    root.classList.add('ed-has-switch')
    const narrow = window.matchMedia(NARROW)
    let lastY = -1
    let shown = false
    const set = (v) => {
      if (v === shown) return
      shown = v
      root.classList.toggle('ed-switch-on', v)
      setOn(v)
    }
    const off = subscribe((y) => {
      const past = y > window.innerHeight * 0.55
      root.classList.toggle('ed-past-title', past)
      const dy = lastY < 0 ? Infinity : y - lastY
      lastY = y
      if (!past) set(false)
      else if (!narrow.matches) set(true)
      else if (Math.abs(dy) > window.innerHeight * 0.9) set(true) // landed: first paint, edition switch, jump
      else if (y + window.innerHeight >= document.documentElement.scrollHeight - 80) set(true)
      else if (dy > 6) set(false)
      else if (dy < -6) set(true)
      return false
    })
    return () => { off(); root.classList.remove('ed-has-switch', 'ed-switch-on', 'ed-past-title') }
  }, [always])
  return (
    <nav className={`ed-switch${on ? ' is-on' : ''}`} aria-label="Site edition">
      <a className="ed-switch-k" href="#/" aria-label="All editions">Edition</a>
      {ORDER.map(k => (
        <button
          key={k}
          type="button"
          className={`ed-switch-b ed-${k}${k === current ? ' is-on' : ''}`}
          aria-pressed={k === current}
          onClick={() => { if (k !== current) (onPick ? onPick(k) : switchEdition(k)) }}
        >
          {EDITIONS[k].name}
        </button>
      ))}
    </nav>
  )
}

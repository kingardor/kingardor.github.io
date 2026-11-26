import { useEffect, useRef, useState } from 'react'
import { onFilm } from '../../components/story/filmPosition.js'

/**
 * Film position for overlays.
 *   useFilm(cb)   → calls cb(state) on every drawn frame, no re-renders (preferred:
 *                   write styles on refs inside cb)
 *   useFilmAct()  → re-renders only when the act on screen changes
 */
export function useFilm(cb) {
  const ref = useRef(cb)
  useEffect(() => { ref.current = cb })
  useEffect(() => onFilm(s => ref.current?.(s)), [])
}

export function useFilmAct() {
  const [act, setAct] = useState(0)
  useEffect(() => onFilm(s => setAct(a => (a === s.act ? a : s.act))), [])
  return act
}

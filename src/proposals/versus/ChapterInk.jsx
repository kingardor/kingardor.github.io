import { useEffect } from 'react'
import { useFilmAct } from '../shared/useFilm.js'
import { CHAPTER_INKS } from './data.js'

/** Chapter colours (data.js CHAPTER_INKS): sets --vs-act on <html> (so the stage, which sits outside .vs-root, sees
 *  it too); versus.css registers it as a <color> so it cross-fades. */
export default function ChapterInk() {
  const act = useFilmAct()
  useEffect(() => {
    document.documentElement.style.setProperty('--vs-act', CHAPTER_INKS[act] ?? CHAPTER_INKS[0])
  }, [act])
  useEffect(() => () => document.documentElement.style.removeProperty('--vs-act'), [])
  return null
}

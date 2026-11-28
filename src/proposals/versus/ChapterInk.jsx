import { useEffect } from 'react'
import { useFilmAct } from '../shared/useFilm.js'
import { ACTS, CHAPTER_INKS } from './data.js'

// The fixed layers that sit over every section and follow the act on screen:
// the portrait's tint, the halftone print, the HUD and the combo meter.
// (Banners, round calls and the VS screen take their ink when they mount.)
const CHROME = '.vs-film, .vs-print, .vs-hud, .vs-combo'

/**
 * Chapter colours (data.js CHAPTER_INKS) as --vs-spot.
 *
 * Each section wears its own chapter's ink, set once when the page mounts
 * (sections between acts, like the final round, take the act before them), so
 * a chapter change restyles nothing in the page itself; only the few fixed
 * CHROME layers are updated. One inherited variable on <html> did the same job
 * but restyled and repainted the whole page at every chapter change, which is
 * what made the section banners stutter.
 */
export default function ChapterInk() {
  const act = useFilmAct()

  useEffect(() => {
    let ink = CHAPTER_INKS[0]
    for (const el of document.querySelectorAll('.vs-root > section[id]')) {
      const i = ACTS.findIndex(a => a.id === el.id)
      if (i >= 0) ink = CHAPTER_INKS[i] ?? ink
      el.style.setProperty('--vs-spot', ink)
    }
  }, [])

  useEffect(() => {
    const ink = CHAPTER_INKS[act] ?? CHAPTER_INKS[0]
    for (const el of document.querySelectorAll(CHROME)) el.style.setProperty('--vs-spot', ink)
  }, [act])

  return null
}

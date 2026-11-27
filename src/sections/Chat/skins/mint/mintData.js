// Mint skin: the non-component bits (maps, helpers, hooks), kept out of the
// .jsx files so fast refresh stays happy.
import { useEffect, useState } from 'react'

/** Blocks ChatBlocks actually draws. The Worker also sends get_bio,
 *  get_blue_work and get_talks blocks, which render nothing. */
export const RENDERABLE = ['get_projects', 'get_career_timeline', 'get_skills', 'get_youtube_videos', 'get_publications', 'get_honours']

/** Every tool is a part in Veronica's box. */
export const PACKS = {
  get_projects: 'Projects pack',
  get_career_timeline: 'Career file cards',
  get_youtube_videos: 'Video tapes',
  get_skills: 'Skill charts',
  get_publications: 'Instruction manuals',
  get_honours: 'Trophy set',
  get_bio: 'Bio card',
  get_blue_work: 'BLUE files',
  get_talks: 'Stage passes',
}
/** The booklet's CONTENTS: each line asks her about something she can fetch. */
export const CONTENTS = [
  ['Meet the figure', 'Give me a 10-sec intro', 2],
  ['The robots', 'Show me the robots', 4],
  ['Career, in story order', 'Walk me through his career', 6],
  ['Hyper Memory & BLUE', 'What is Hyper Memory?', 9],
  ['Talks & stage time', 'Link the NVIDIA GTC talks', 11],
  ['Skills & toolkit', 'What are his skills?', 13],
  ['The writing', 'What has he written?', 15],
  ['Honours & trophies', 'What has he won?', 17],
  ['Contacting the owner', 'How can I contact you?', 19],
]

export const packName = (name) => PACKS[name] || name.replace(/^get_/, '').replace(/_/g, ' ')

/** Tool timings per turn (keyed by the turn's startedAt), recorded by the
 *  skin as tools arrive. Module-level, so they survive a skin switch. */
export const TAPES = new Map()
/** Tools already present when a turn was first seen (a mid-turn skin switch,
 *  or stale engine state): their arrival time is unknown, so no pulse and no
 *  call-out. Only tools the skin watches arrive get stamped. */
export const UNTIMED = new Map()

export const renderable = (blocks) => (blocks || []).filter(b => RENDERABLE.includes(b.type))

export const secs = (ms) => (ms / 1000).toFixed(1)

/** Real timings for a finished turn, or null where the turn never got there. */
export function turnStats(meta) {
  if (!meta || !meta.startedAt) return null
  const { startedAt, firstThinkAt, firstTextAt, doneAt, tools = [], words = 0 } = meta
  return {
    firstWord: firstTextAt ? firstTextAt - startedAt : null,
    thought: firstThinkAt ? (firstTextAt || doneAt) - firstThinkAt : null,
    talked: firstTextAt && doneAt ? doneAt - firstTextAt : null,
    total: doneAt ? doneAt - startedAt : null,
    words,
    parts: tools.length,
  }
}

/** Ticks while `on`; a still clock otherwise (no idle work). */
export function useNow(on, ms = 100) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!on) return
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), ms)
    return () => clearInterval(id)
  }, [on, ms])
  return now
}

/** Plain-text version of an answer for the screen-reader log. */
export const plain = (md) => (md || '')
  .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
  .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  .replace(/[*_`#>]+/g, '')
  .replace(/\s+/g, ' ')
  .trim()

export const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

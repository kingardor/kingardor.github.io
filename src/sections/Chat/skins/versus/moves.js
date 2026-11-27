// Veronica's tools, named after the Versus section that holds the same data,
// with a numpad motion (6 = forward, 2 = down, 3 = down-forward …) ending on
// her Q button. The notation is a label, not a stat.
export const MOVES = {
  get_projects: { name: 'CHARACTER SELECT', page: 'ROSTER', input: [2, 3, 6] },
  get_career_timeline: { name: 'STORY MODE', page: 'ROUNDS', input: [6, 2, 3] },
  get_youtube_videos: { name: 'REPLAY THEATRE', page: 'TAPES', input: [2, 1, 4] },
  get_skills: { name: 'MOVE LIST', page: 'FRAME DATA', input: [4, 1, 2, 3, 6] },
  get_publications: { name: 'LORE CODEX', page: 'ENTRIES', input: [6, 3, 2, 1, 4] },
  get_honours: { name: 'TROPHY ROOM', page: 'TROPHIES', input: [4, 6] },
  get_bio: { name: 'PLAYER PROFILE', page: 'PROFILE', input: [2, 2] },
  get_blue_work: { name: 'FINAL ROUND: BLUE', page: 'BOSS FILES', input: [2, 3, 6, 2, 3, 6] },
  get_talks: { name: 'MAIN STAGE', page: 'STAGES', input: [6, 6] },
}

// Blocks ChatBlocks actually draws; the Worker also sends get_bio,
// get_blue_work and get_talks, which render nothing.
export const RENDERABLE = ['get_projects', 'get_career_timeline', 'get_skills', 'get_youtube_videos', 'get_publications', 'get_honours']

export function moveOf(name) {
  return MOVES[name] || { name: String(name || 'MOVE').replace(/^get_/, '').replace(/_/g, ' ').toUpperCase(), page: 'DATA', input: [6] }
}

// What each block holds, as a count for the "data loaded" chip.
export function blockCount(b) {
  const d = b?.data || {}
  const arr = d.projects || d.career || d.items || d.publications || d.honours || d.tech_bars || d.radar
  return Array.isArray(arr) ? arr.length : 0
}

// Suggestions in the command list get the motion of the move they'll likely
// trigger; anything unrecognised is a plain Q (she just talks).
export function guessInput(text) {
  if (/robot|project/i.test(text)) return MOVES.get_projects.input
  if (/hyper memory|blue/i.test(text)) return MOVES.get_blue_work.input
  if (/talk|gtc|video/i.test(text)) return MOVES.get_youtube_videos.input
  if (/career|timeline/i.test(text)) return MOVES.get_career_timeline.input
  if (/intro|who/i.test(text)) return MOVES.get_bio.input
  if (/skill|stack/i.test(text)) return MOVES.get_skills.input
  return []
}

export const wordCount = (t) => ((t || '').match(/\S+/g) || []).length

const WORD = { 6: 'forward', 3: 'down-forward', 2: 'down', 1: 'down-back', 4: 'back', 7: 'up-back', 8: 'up', 9: 'up-forward' }
/** Screen-reader words for a motion plus her Q button. */
export function describe(input) {
  return [...input.map(d => WORD[d]), 'Q'].join(', ')
}

import { getFilm } from '../components/story/filmPosition.js'
import navigate from '../shared/utils/navigate.js'
import { ACTS as MINT_ACTS } from '../proposals/mint/acts.js'
import { ACTS as VERSUS_ACTS } from '../proposals/versus/acts.js'

/**
 * The two candidate designs, as editions a visitor can pick and switch between
 * (peer-review build). Both run on the same content and the same portrait.
 */
export const EDITIONS = {
  mint: {
    key: 'mint', name: 'Mint in Box', kind: 'Collector’s edition',
    pitch: 'He comes boxed, never opened. The projects hang on a pegboard: pick one up, flip it, tear it open.',
    cta: 'Open the box', acts: MINT_ACTS,
  },
  versus: {
    key: 'versus', name: 'Versus', kind: 'Arcade edition',
    pitch: 'The site as a fighting game. His career is story mode, the projects are the roster, the stats are frame data.',
    cta: 'Press start', acts: VERSUS_ACTS,
  },
}
export const ORDER = ['mint', 'versus']

const KEY = 'edition'
const PLACE = 'edition:act'

export function lastEdition() {
  try { const v = localStorage.getItem(KEY); return EDITIONS[v] ? v : null } catch { return null }
}
export function rememberEdition(key) {
  try { localStorage.setItem(KEY, key) } catch { /* private mode: fine */ }
}

/** Jump to the other edition at the same act (same story beat), not the top. */
export function switchEdition(to) {
  try { sessionStorage.setItem(PLACE, String(getFilm().act || 0)) } catch { /* fine */ }
  rememberEdition(to)
  navigate(`#/${to}`)
}

/** The act to land on after a switch, or 0. Cleared once the page has landed
 *  (not on read: effects can run twice in development). */
export function peekPlace() {
  try { return Number(sessionStorage.getItem(PLACE)) || 0 } catch { return 0 }
}
export function clearPlace() {
  try { sessionStorage.removeItem(PLACE) } catch { /* fine */ }
}

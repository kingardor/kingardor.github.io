import META from './portrait.meta.json'

// Two shots of one studio session (see scripts/portrait). The stage uses the
// one whose aspect ratio is closer to the screen's: their geometric mean is
// ≈1.15, so anything narrower than that (phones held upright, tablets in
// portrait, tall windows) gets the tall shot.
export { META }
export const SPLIT = Math.sqrt((META.wide.width / META.wide.height) * (META.tall.width / META.tall.height))
export const pickSet = (w, h) => (w / Math.max(1, h) < SPLIT ? 'tall' : 'wide')
export const setDir = (set) => `/portrait/${set}/`
/** The untouched photo for a set: VS screens, cut-ins, posters. */
export const photoOf = (set) => `/portrait/${set}/photo.webp`

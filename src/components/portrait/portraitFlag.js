// The studio-portrait stage is the default background; `?bg=film` (in the
// query or the hash) brings back the scroll-scrubbed cyborg film to compare.
const FILM = /[?&]bg=film\b/
export function filmBg() {
  if (typeof window === 'undefined') return false
  return FILM.test(window.location.search) || FILM.test(window.location.hash)
}
export const portraitBg = () => !filmBg()

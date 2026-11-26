// `?bg=portrait` (in the query or the hash) swaps the cyborg film for the
// studio-portrait stage wherever a layout mounts FilmStage.
export function portraitBg() {
  if (typeof window === 'undefined') return false
  const re = /[?&]bg=portrait\b/
  return re.test(window.location.search) || re.test(window.location.hash)
}

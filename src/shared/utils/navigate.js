/**
 * Hash navigation wrapped in the View Transitions API when available —
 * the CSS in index.css turns route swaps into a clip-wipe + blur. Fallback
 * is the plain hash assignment (instant, harmless).
 *
 * The callback resolves two rAFs after the hash change so React has a
 * chance to commit the new route before the transition snapshot completes.
 */
export default function navigate(hash) {
  const go = () => { location.hash = hash }
  if (document.startViewTransition) {
    const t = document.startViewTransition(
      () => new Promise(resolve => {
        go()
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      })
    )
    // A second navigation can skip an in-flight transition — that's fine
    t.finished?.catch(() => {})
    t.ready?.catch(() => {})
  } else {
    go()
  }
}

/**
 * filmPosition — where the story film is, for overlays that want to sync to it.
 *
 * SequenceCanvas publishes on every drawn frame:
 *   P      timeline position: act index + progress through that act (0..acts)
 *   act    index of the act on screen, id its section id, seq its sequence
 *   t      progress through that act, 0..1
 *   frame  frame index inside the act's sequence, n frames in total
 *   rect   where the footage is drawn, in CSS px: { x, y, w, h }. Footage is
 *          4:3 drawn with object-fit: cover, so a point (u, v) in 0..1 image
 *          space lands at (rect.x + u * rect.w, rect.y + v * rect.h).
 *
 *   const off = onFilm(({ act, t, rect }) => { …position overlays… })
 */

const subs = new Set()
let state = { P: 0, act: 0, id: null, seq: null, t: 0, frame: 0, n: 0, rect: { x: 0, y: 0, w: 0, h: 0 } }

export function setFilm(next) {
  state = next
  for (const fn of subs) fn(state)
}

export function onFilm(fn) {
  subs.add(fn)
  fn(state)
  return () => { subs.delete(fn) }
}

export function getFilm() {
  return state
}

/** Map a point in footage space (0..1) to viewport CSS px. */
export function toScreen(u, v, rect = state.rect) {
  return { x: rect.x + u * rect.w, y: rect.y + v * rect.h }
}

import manifest from './sequences.generated.json'

/**
 * Frame cache for the story sequences.
 *
 * Compressed AVIF blobs are fetched coarse-to-fine (every 8th frame first, so
 * a scrub shows the whole arc early, then the gaps fill) and kept for the
 * session — ~25KB each. Decoded ImageBitmaps (~3MB each at 1024w) are only
 * held in a small window around the playhead and closed as it moves on, so
 * memory stays flat however far the visitor scrolls.
 */

const CONCURRENCY = 6
const WINDOW = 8 // decoded frames kept on each side of the playhead

export const FPS = manifest.fps

export function createSequenceStore({ variant }) {
  const seqs = new Map() // name → { blobs[], bitmaps Map, decoding Set }
  const queue = []
  let inflight = 0
  let onReady = () => {}

  const info = (name) => manifest.sequences[name]
  const frameUrl = (name, i) =>
    `/seq/${info(name).dir}/${variant}/${String(i + 1).padStart(4, '0')}.avif`
  const countOf = (name) => info(name)?.[variant]?.count || 0

  const seq = (name) => {
    let s = seqs.get(name)
    if (!s) {
      s = { blobs: new Array(countOf(name)), bitmaps: new Map(), decoding: new Set(), queued: false }
      seqs.set(name, s)
    }
    return s
  }

  const pump = () => {
    while (inflight < CONCURRENCY && queue.length) {
      const { name, i } = queue.shift()
      const s = seq(name)
      if (s.blobs[i]) continue
      inflight++
      fetch(frameUrl(name, i))
        .then(r => (r.ok ? r.blob() : null))
        .then(b => { if (b) { s.blobs[i] = b; onReady() } })
        .catch(() => {})
        .finally(() => { inflight--; pump() })
    }
  }

  /** Queue a whole sequence, coarse-to-fine. Earlier calls load first. */
  const load = (name) => {
    if (!info(name)) return
    const s = seq(name)
    if (s.queued) return
    s.queued = true
    const n = countOf(name)
    const seen = new Set()
    for (const step of [8, 4, 2, 1]) {
      for (let i = 0; i < n; i += step) if (!seen.has(i)) { seen.add(i); queue.push({ name, i }) }
    }
    if (!seen.has(n - 1)) queue.push({ name, i: n - 1 })
    pump()
  }

  /** Re-prioritise: these sequences jump the queue, in order. */
  const prioritise = (names) => {
    for (const name of [...names].reverse()) {
      const mine = queue.filter(q => q.name === name)
      if (!mine.length) continue
      for (let k = queue.length - 1; k >= 0; k--) if (queue[k].name === name) queue.splice(k, 1)
      queue.unshift(...mine)
    }
    names.forEach(load)
  }

  /** Decode the window around `center`, release everything outside it. */
  const focus = (name, center) => {
    const s = seqs.get(name)
    if (!s) return
    const lo = Math.max(0, center - WINDOW)
    const hi = Math.min(s.blobs.length - 1, center + WINDOW)
    for (const [i, bmp] of s.bitmaps) {
      if (i < lo || i > hi) { bmp.close?.(); s.bitmaps.delete(i) }
    }
    for (let i = lo; i <= hi; i++) {
      if (s.bitmaps.has(i) || s.decoding.has(i) || !s.blobs[i]) continue
      s.decoding.add(i)
      createImageBitmap(s.blobs[i])
        .then(bmp => {
          s.decoding.delete(i)
          // Playhead may have moved on while decoding
          if (Math.abs(i - center) > WINDOW * 2) { bmp.close?.(); return }
          s.bitmaps.set(i, bmp)
          onReady()
        })
        .catch(() => s.decoding.delete(i))
    }
  }

  /** Nearest decoded bitmap to frame i (searching outward), or null. */
  const nearest = (name, i) => {
    const s = seqs.get(name)
    if (!s) return null
    if (s.bitmaps.has(i)) return { bmp: s.bitmaps.get(i), i }
    for (let d = 1; d <= WINDOW; d++) {
      if (s.bitmaps.has(i - d)) return { bmp: s.bitmaps.get(i - d), i: i - d }
      if (s.bitmaps.has(i + d)) return { bmp: s.bitmaps.get(i + d), i: i + d }
    }
    return null
  }

  const releaseOthers = (keep) => {
    for (const [name, s] of seqs) {
      if (keep.includes(name)) continue
      for (const bmp of s.bitmaps.values()) bmp.close?.()
      s.bitmaps.clear()
    }
  }

  return {
    countOf, frameUrl, load, prioritise, focus, nearest, releaseOthers,
    set onReady(fn) { onReady = fn },
    dispose() { releaseOthers([]); queue.length = 0 },
  }
}

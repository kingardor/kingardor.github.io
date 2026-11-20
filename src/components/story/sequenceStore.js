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

export function createSequenceStore({ variant, onProgress, onError }) {
  const seqs = new Map() // name → { blobs[], bitmaps Map, decoding Set }
  const queue = []
  const controller = new AbortController()
  let total = 0
  let completed = 0
  let decoding = 0
  let inflight = 0
  let onReady = () => {}

  const info = (name) => manifest.sequences[name]
  const frameUrl = (name, i) =>
    `/seq/${info(name).dir}/${variant}/${String(i + 1).padStart(4, '0')}.avif`
  const countOf = (name) => info(name)?.[variant]?.count || 0

  const seq = (name) => {
    let s = seqs.get(name)
    if (!s) {
      s = { blobs: new Array(countOf(name)), bitmaps: new Map(), previews: new Map(), decoding: new Set(), center: -Infinity, queued: false }
      seqs.set(name, s)
    }
    return s
  }

  const pump = () => {
    while (inflight < CONCURRENCY && queue.length) {
      const job = queue.shift()
      const { name, i } = job
      const s = seq(name)
      inflight++
      fetch(frameUrl(name, i), { signal: controller.signal })
        .then(async response => {
          if (!response.ok) throw new Error('Frame unavailable')
          const blob = await response.blob()
          // Keep sparse, small decoded frames for immediate display after a jump.
          if (i % 8 === 0 || i === countOf(name) - 1) {
            const preview = await createImageBitmap(blob, { resizeWidth: 256 })
            if (controller.signal.aborted) { preview.close(); return }
            s.previews.set(i, preview)
          }
          if (controller.signal.aborted) return
          s.blobs[i] = blob
          onProgress?.(++completed, total)
          onReady()
        })
        .catch(() => {
          if (controller.signal.aborted) return
          if (!job.retried) queue.unshift({ ...job, retried: true })
          else { controller.abort(); queue.length = 0; onError() }
        })
        .finally(() => { inflight--; if (!controller.signal.aborted) pump() })
    }
  }

  /** Queue a whole sequence, coarse-to-fine. Earlier calls load first. */
  const load = (name) => {
    if (!info(name)) return
    const s = seq(name)
    if (s.queued) return
    s.queued = true
    const n = countOf(name)
    total += n
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
    s.center = center
    const lo = Math.max(0, center - WINDOW)
    const hi = Math.min(s.blobs.length - 1, center + WINDOW)
    for (const [i, bmp] of s.bitmaps) {
      if (i < lo || i > hi) { bmp.close?.(); s.bitmaps.delete(i) }
    }
    // Admit the target first and bound outstanding decodes across scroll events.
    for (let d = 0; d <= WINDOW * 2 && decoding < 3; d++) {
      const i = center + (d % 2 ? (d + 1) / 2 : -d / 2)
      if (i < lo || i > hi) continue
      if (s.bitmaps.has(i) || s.decoding.has(i) || !s.blobs[i]) continue
      decoding++
      s.decoding.add(i)
      createImageBitmap(s.blobs[i])
        .then(bmp => {
          // Playhead may have moved on while decoding
          if (controller.signal.aborted || Math.abs(i - s.center) > WINDOW) { bmp.close?.(); return }
          s.bitmaps.set(i, bmp)
        })
        .catch(() => { if (!controller.signal.aborted) onError() })
        .finally(() => {
          decoding--
          s.decoding.delete(i)
          if (!controller.signal.aborted) onReady()
        })
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
    let best = null
    for (const [index, bmp] of s.previews) {
      if (!best || Math.abs(index - i) < Math.abs(best.i - i)) best = { bmp, i: index }
    }
    return best
  }

  const releaseOthers = (keep) => {
    for (const [name, s] of seqs) {
      if (keep.includes(name)) continue
      s.center = -Infinity
      for (const bmp of s.bitmaps.values()) bmp.close?.()
      s.bitmaps.clear()
    }
  }

  return {
    countOf, frameUrl, load, prioritise, focus, nearest, releaseOthers,
    set onReady(fn) { onReady = fn },
    dispose() {
      controller.abort()
      queue.length = 0
      releaseOthers([])
      for (const s of seqs.values()) {
        for (const bmp of s.previews.values()) bmp.close()
        s.previews.clear()
      }
    },
  }
}

/**
 * build-sequences.mjs — turns story footage into scroll-scrubbable frame
 * sequences for SequenceCanvas.
 *
 * Video can't be scrubbed smoothly: every scroll frame becomes a seek + GOP
 * decode (≈9 visible updates/s in Chromium, worse reversing in Safari). An
 * image sequence draws any frame instantly in either direction.
 *
 *   media-src/story/<name>.mp4 (+ <name>-m.mp4)  →  ffmpeg (fps, PNG)  →  sharp (AVIF)
 *   public/seq/<name>-<hash>/{d,m}/0001.avif …    (hash in the path ⇒ cache-forever)
 *   src/components/story/sequences.generated.json (manifest the client imports)
 *
 * Cached by source hash + encoder settings, so re-runs are near-instant. Fails
 * when a sequence blows its byte budget. Usage: node scripts/build-sequences.mjs [--force]
 */

import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'
import sharp from 'sharp'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'media-src/story')
const OUT = join(ROOT, 'public/seq')
const MANIFEST = join(ROOT, 'src/components/story/sequences.generated.json')
const FORCE = process.argv.includes('--force')

const FPS = 15
// AVIF q45 measured ~25–30KB/frame at 1024w on this footage — ~40% under
// WebP q70 with no visible banding in the void gradients.
const ENCODE = { quality: 45, effort: 4, chromaSubsampling: '4:2:0' }
const VARIANTS = [
  { key: 'd', suffix: '', budget: 3.2e6 },   // desktop: source width, never upscaled
  { key: 'm', suffix: '-m', budget: 1.6e6 }, // mobile: the -m encodes (720w)
]

// One sequence per story segment, in scroll order.
const SEQUENCES = ['story-1', 'story-2', 'story-3', 'story-4', 'story-5', 'story-6', 'story-7', 'story-8']

const hashOf = (files) => {
  const h = createHash('sha1').update(JSON.stringify({ FPS, ENCODE }))
  for (const f of files) h.update(readFileSync(f))
  return h.digest('hex').slice(0, 8)
}

async function pool(items, n, fn) {
  let i = 0
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < items.length) { const k = i++; await fn(items[k], k) }
  }))
}

const old = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : { sequences: {} }
const manifest = { fps: FPS, sequences: {} }
let failed = false

for (const name of SEQUENCES) {
  const sources = VARIANTS.map(v => join(SRC, `${name}${v.suffix}.mp4`))
  const missing = sources.filter(f => !existsSync(f))
  if (missing.length) throw new Error(`missing source(s): ${missing.join(', ')}`)
  const hash = hashOf(sources)
  const dir = `${name}-${hash}`
  const prev = old.sequences?.[name]

  if (!FORCE && prev?.dir === dir && existsSync(join(OUT, dir))) {
    manifest.sequences[name] = prev
    console.log(`= ${name} (cached ${dir})`)
    continue
  }

  // Drop stale outputs for this sequence
  if (existsSync(OUT)) for (const d of readdirSync(OUT)) if (d.startsWith(`${name}-`)) rmSync(join(OUT, d), { recursive: true })

  const entry = { dir, count: 0 }
  for (const v of VARIANTS) {
    const tmp = join(tmpdir(), `seq-${dir}-${v.key}`)
    rmSync(tmp, { recursive: true, force: true }); mkdirSync(tmp, { recursive: true })
    execFileSync('ffmpeg', ['-v', 'error', '-i', join(SRC, `${name}${v.suffix}.mp4`), '-vf', `fps=${FPS}`, join(tmp, '%04d.png')])
    const frames = readdirSync(tmp).filter(f => f.endsWith('.png')).sort()
    const outDir = join(OUT, dir, v.key)
    mkdirSync(outDir, { recursive: true })
    let bytes = 0, w = 0, h = 0
    await pool(frames, 8, async (f) => {
      const img = sharp(join(tmp, f))
      if (!w) ({ width: w, height: h } = await img.metadata())
      const buf = await img.avif(ENCODE).toBuffer()
      writeFileSync(join(outDir, f.replace('.png', '.avif')), buf)
      bytes += buf.length
    })
    rmSync(tmp, { recursive: true, force: true })
    if (entry.count && entry.count !== frames.length) {
      console.warn(`! ${name}: ${v.key} has ${frames.length} frames, expected ${entry.count}`)
    }
    entry.count = Math.max(entry.count, frames.length)
    entry[v.key] = { w, h, count: frames.length, bytes }
    const over = bytes > v.budget
    if (over) failed = true
    console.log(`${over ? '✗' : '✓'} ${name}/${v.key}: ${frames.length} frames ${w}×${h}, ${(bytes / 1e6).toFixed(2)}MB${over ? ` > budget ${(v.budget / 1e6).toFixed(1)}MB` : ''}`)
  }
  manifest.sequences[name] = entry
}

writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n')
const total = (k) => Object.values(manifest.sequences).reduce((s, e) => s + (e[k]?.bytes || 0), 0)
console.log(`total: desktop ${(total('d') / 1e6).toFixed(2)}MB, mobile ${(total('m') / 1e6).toFixed(2)}MB`)
if (failed) { console.error('sequence budget exceeded'); process.exit(1) }


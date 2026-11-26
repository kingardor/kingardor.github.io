// Packaging art direction per project. Facts stay in src/content; this file
// only decides colours and the loud microcopy printed on each box.
import { PROJECTS } from '../../content/index.js'

export const PACK = {
  noir: { card: '#121212', ink: '#FFD400', accent: '#FFD400', text: '#FFD400', chrome: 'gold', warn: 'WARNING: keeps a diary about you. With citations. Do not confess near the rover.' },
  vector: { card: '#FF2BD6', ink: '#1E1B22', accent: '#1E1B22', text: '#1E1B22', chrome: 'chrome', warn: 'WARNING: will roast you. Not suitable for thin skin or brewing coffee.' },
  veronica: { card: '#7A4CFF', ink: '#E9E8F0', accent: '#C9CBD6', text: '#FFFFFF', chrome: 'chrome', warn: 'WARNING: contains small agents. Not suitable for clouds.' },
  hermes: { card: '#FF6A00', ink: '#8A0F0F', accent: '#8A0F0F', text: '#2A0505', chrome: 'chrome', warn: 'WARNING: finds fire. Do not use as a lighter. Lands itself if you wander off.' },
  'q-pocket': { card: '#00A6A6', ink: '#FFFFFF', accent: '#FFFFFF', text: '#FFFFFF', chrome: 'chrome', warn: 'CAUTION: pocket-sized. The ego is not. No NPU was harmed.' },
  copcars: { card: '#FF2E88', ink: '#1A0710', accent: '#F2F2F2', text: '#1A0710', chrome: 'chrome', warn: 'WARNING: takes real money. Yours. Collectors refresh at midnight.' },
  zassistant: { card: '#2C5BFF', ink: '#FFFFFF', accent: '#FFFFFF', text: '#FFFFFF', chrome: 'chrome', warn: 'NOTICE: GPU sold separately. Borrowed, actually. Returns with page numbers.' },
  shred: { card: '#9DFF00', ink: '#0A0A0A', accent: '#0A0A0A', text: '#0A0A0A', chrome: 'dark', warn: 'WARNING: draws boxes only. Ethics included. Aim not included.' },
}

/** The punchiest fact for the starburst: the shortest value reads loudest. */
export function burstFact(p) {
  return [...p.facts].sort((a, b) => a.v.length - b.v.length)[0]
}

/** "Hermes reads … DCF tracker. MediaMTX …" → a handful of FEATURES! bullets. */
export function featureBullets(story, max = 5) {
  return story
    .split(/(?<=[.!?])\s+(?=[A-Z“])/)
    .map(s => s.trim().replace(/\.$/, ''))
    .filter(Boolean)
    .slice(0, max)
}

export const PROJECT_SLUGS = PROJECTS.map(p => p.slug)

/** Stable small hash for batch codes and barcodes. */
export function hash(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}

export function batchCode(seed) {
  const h = hash(seed).toString(36).toUpperCase().padStart(7, '0')
  return `AJ-${h.slice(0, 3)}-${h.slice(3, 7)}`
}

export const isReduced = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !!window.__PRERENDER)

export const packVars = (p) => {
  const k = PACK[p.slug]
  return { '--c-card': k.card, '--c-ink': k.ink, '--c-accent': k.accent, '--c-text': k.text }
}

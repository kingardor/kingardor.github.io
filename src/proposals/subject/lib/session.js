// The visit, as the page sees it. In memory + localStorage only: nothing
// leaves the browser. Dwell is counted per section (the one under the
// viewport's middle line), per sighting card (≥50% visible), per open case.
import { SECTIONS } from './data.js'

const LS_ID = 'sj:visitor'
const LS_VISIT = 'sj:visit'

const read = (k) => { try { return JSON.parse(localStorage.getItem(k)) } catch { return null } }
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }

function visitorId() {
  let id = null
  try { id = localStorage.getItem(LS_ID) } catch {}
  if (!/^\d{4}$/.test(id || '')) {
    id = String(1000 + Math.floor(Math.random() * 9000))
    try { localStorage.setItem(LS_ID, id) } catch {}
  }
  return id
}

const listeners = new Set()
const S = {
  ready: false,
  id: '0000',
  visit: 1,
  prev: null,
  startedAt: 0,
  dwell: {},        // sectionId → ms
  cards: {},        // slug → ms
  cases: {},        // slug → { opens, ms }
  searches: [],
  played: [],
  wrote: null,      // 'email' | 'chat' | 'linkedin' …
  idles: 0,
  log: [],          // { t, row }
  active: null,
  openCase: null,
  openedAt: 0,
}

function emit() { for (const fn of listeners) fn(S) }

export function getSession() { return S }
export function onSession(fn) { listeners.add(fn); return () => listeners.delete(fn) }

export function elapsed() { return S.startedAt ? (performance.now() - S.startedAt) / 1000 : 0 }

/** Append a memory row to the visitor's log (Hyper Memory renders it). */
export function remember(row) {
  S.log = [...S.log.slice(-30), { t: elapsed(), row }]
  emit()
}

export function initSession() {
  if (S.ready) return S
  S.ready = true
  S.id = visitorId()
  const stored = read(LS_VISIT) || {}
  // The last page load's summary becomes "last time"
  S.prev = stored.current && stored.current.total > 3 ? stored.current : stored.prev || null
  S.visit = (stored.visits || 0) + 1
  write(LS_VISIT, { visits: S.visit, prev: S.prev, current: null })
  S.startedAt = performance.now()
  remember(`visitor#${S.id} detected ; visit=${S.visit}`)
  return S
}

export function summary() {
  const top = (obj) => Object.entries(obj).sort((a, b) => b[1] - a[1])[0] || null
  const cardsMs = Object.fromEntries(Object.entries(S.cards).map(([k, v]) => [k, v + (S.cases[k]?.ms || 0)]))
  return {
    at: Date.now(),
    total: Math.round(elapsed()),
    topCard: top(cardsMs),
    topSection: top(Object.fromEntries(Object.entries(S.dwell).filter(([k]) => k !== 'sj-deepscan'))),
    wrote: S.wrote,
    cases: Object.keys(S.cases),
    searches: S.searches.slice(-5),
  }
}

let saveT = 0
function save(force) {
  const now = performance.now()
  if (!force && now - saveT < 2000) return
  saveT = now
  const stored = read(LS_VISIT) || {}
  write(LS_VISIT, { ...stored, visits: S.visit, prev: S.prev, current: summary() })
}

// ── Dwell ticker (runs only while the tab is visible) ──
let last = 0
let visibleCards = new Set()
let timer = 0
function tick() {
  const now = performance.now()
  const dt = last ? Math.min(1000, now - last) : 0
  last = now
  if (S.active) S.dwell[S.active] = (S.dwell[S.active] || 0) + dt
  if (S.openCase) {
    const c = S.cases[S.openCase]
    if (c) c.ms += dt
  } else {
    for (const slug of visibleCards) S.cards[slug] = (S.cards[slug] || 0) + dt
  }
  save()
}
function startTicker() { if (!timer) { last = performance.now(); timer = setInterval(tick, 500) } }
function stopTicker() { if (timer) { tick(); clearInterval(timer); timer = 0; last = 0 } }

const sectionName = id => SECTIONS.find(s => s.id === id)?.name || id

/** Observe the sections + sighting cards. Returns a cleanup. */
export function startTracking() {
  const ios = []
  const line = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting && S.active !== e.target.id) {
        S.active = e.target.id
        remember(`visitor#${S.id} enters @${e.target.id.replace('sj-', '')}`)
      }
    }
  }, { rootMargin: '-50% 0px -50% 0px' })
  SECTIONS.forEach(s => { const el = document.getElementById(s.id); if (el) line.observe(el) })
  ios.push(line)

  const cards = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const slug = e.target.dataset.sjCard
      if (e.intersectionRatio >= 0.5) visibleCards.add(slug)
      else visibleCards.delete(slug)
    }
  }, { threshold: [0, 0.5, 1] })
  document.querySelectorAll('[data-sj-card]').forEach(el => cards.observe(el))
  ios.push(cards)

  const onVis = () => (document.hidden ? stopTicker() : startTicker())
  document.addEventListener('visibilitychange', onVis)
  const onHide = () => save(true)
  window.addEventListener('pagehide', onHide)
  if (!document.hidden) startTicker()
  return () => {
    ios.forEach(io => io.disconnect())
    document.removeEventListener('visibilitychange', onVis)
    window.removeEventListener('pagehide', onHide)
    stopTicker()
    save(true)
  }
}

export function openCase(slug, name) {
  S.openCase = slug
  S.cases[slug] = S.cases[slug] || { opens: 0, ms: 0 }
  S.cases[slug].opens++
  remember(`visitor#${S.id} opens case#${slug} ; ${name}`)
}
export function closeCase() {
  if (S.openCase) remember(`visitor#${S.id} closes case#${S.openCase} ; ${Math.round((S.cases[S.openCase]?.ms || 0) / 1000)}s`)
  S.openCase = null
}
export function noteSearch(q) {
  const s = q.trim()
  if (!s || S.searches[S.searches.length - 1] === s) return
  // collapse keystrokes: replace the last entry if this one extends it
  const lastQ = S.searches[S.searches.length - 1]
  if (lastQ && (s.startsWith(lastQ) || lastQ.startsWith(s))) S.searches[S.searches.length - 1] = s
  else S.searches.push(s)
}
export function commitSearch(q) {
  if (q.trim()) remember(`visitor#${S.id} asks "${q.trim().slice(0, 24)}"`)
}
export function notePlay(title) {
  S.played.push(title)
  remember(`visitor#${S.id} plays signal ; "${title.slice(0, 28)}…"`)
}
export function noteWrote(channel) {
  S.wrote = S.wrote || channel
  remember(`visitor#${S.id} reaches out ; via ${channel}`)
  save(true)
}
export function noteIdle() {
  S.idles++
  if (S.idles <= 6) remember(`visitor#${S.id} idles 4s @${(S.active || 'sj-acquire').replace('sj-', '')}`)
}

export { sectionName }

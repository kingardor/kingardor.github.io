// What this visitor has picked off the wall, kept in localStorage so the
// COLLECT ALL 8 checklist and the chase variant survive a reload.
import { useSyncExternalStore } from 'react'

const KEY = 'mb:collected'
const PEEK = 'mb:peeked'
const subs = new Set()

const read = (k, d) => {
  try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d }
}
let state = { opened: read(KEY, []), peeked: read(PEEK, false) }

function set(next) {
  state = { ...state, ...next }
  try {
    localStorage.setItem(KEY, JSON.stringify(state.opened))
    localStorage.setItem(PEEK, JSON.stringify(state.peeked))
  } catch { /* private mode: keep it in memory */ }
  subs.forEach(fn => fn())
}

export function markOpened(slug) {
  if (!state.opened.includes(slug)) set({ opened: [...state.opened, slug] })
}
export function peekChase() { set({ peeked: true }) }
export function resetCollection() { set({ opened: [], peeked: false }) }

const subscribe = fn => { subs.add(fn); return () => subs.delete(fn) }
const snap = () => state

export function useCollection() {
  return useSyncExternalStore(subscribe, snap, snap)
}

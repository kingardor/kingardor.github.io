import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { scoreEntry } from '../../shared/utils/fuzzy.js'
import usePaletteIndex, { askVeronica } from './usePaletteIndex.js'

const MAX_RESULTS = 9

/**
 * ⌘K command palette — fuzzy navigation over sections, projects, notes and
 * commands; anything that doesn't match routes to Veronica as a question.
 */
export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [sel, setSel] = useState(0)
  const inputRef = useRef(null)
  const index = usePaletteIndex()

  const close = useCallback(() => { setOpen(false); setQuery(''); setSel(0) }, [])

  // Global shortcuts: ⌘K / Ctrl+K toggle; `/` opens when no input is focused
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(o => !o)
        return
      }
      if (e.key === '/' && !open) {
        const tag = document.activeElement?.tagName
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
          e.preventDefault()
          setOpen(true)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    const onOpen = () => setOpen(true)
    window.addEventListener('ob:palette', onOpen)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('ob:palette', onOpen)
    }
  }, [open])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30)
  }, [open])

  const results = useMemo(() => {
    if (!query.trim()) return index.slice(0, MAX_RESULTS)
    return index
      .map(e => ({ e, s: scoreEntry(query, e) }))
      .filter(r => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, MAX_RESULTS)
      .map(r => r.e)
  }, [query, index])

  // Veronica fallback is always the final row
  const rows = useMemo(() => [
    ...results,
    ...(query.trim()
      ? [{ type: 'ASK', label: `Ask Veronica: “${query.trim()}”`, sub: 'Route to the agent', action: () => askVeronica(query.trim()) }]
      : []),
  ], [results, query])

  useEffect(() => { setSel(0) }, [query])

  const run = (entry) => {
    close()
    // Let the palette unmount before scroll/route side effects
    setTimeout(() => entry.action?.(), 10)
  }

  const onKeyDown = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); close() }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(rows.length - 1, s + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(s => Math.max(0, s - 1)) }
    else if (e.key === 'Enter' && rows[sel]) { e.preventDefault(); run(rows[sel]) }
  }

  if (!open) return null

  return createPortal(
    <div className="ob-palette-backdrop" onMouseDown={close}>
      <div className="ob-palette" role="dialog" aria-label="Command palette" onMouseDown={e => e.stopPropagation()}>
        <div className="ob-palette-bar">
          <span className="ob-palette-sigil">V</span>
          <input
            ref={inputRef}
            className="ob-palette-input"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type a destination, project, or question…"
            autoComplete="off"
            spellCheck={false}
            aria-label="Search"
          />
          <span className="ob-palette-esc mono-ob">ESC</span>
        </div>
        <ul className="ob-palette-list">
          {rows.map((r, i) => (
            <li key={r.type + r.label}>
              <button
                className={`ob-palette-row${i === sel ? ' selected' : ''}${r.type === 'ASK' ? ' ask' : ''}`}
                onClick={() => run(r)}
                onMouseEnter={() => setSel(i)}
              >
                <span className="ob-palette-type mono-ob">{r.type}</span>
                <span className="ob-palette-label">{r.label}</span>
                {r.sub && <span className="ob-palette-sub">{r.sub}</span>}
              </button>
            </li>
          ))}
          {!rows.length && (
            <li className="ob-palette-empty mono-ob">NO SIGNAL — TYPE TO ASK VERONICA</li>
          )}
        </ul>
      </div>
    </div>,
    document.body,
  )
}

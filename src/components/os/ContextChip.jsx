import { askVeronica } from './usePaletteIndex.js'

/** Per-section handoff into the agent: a mono pill with a canned question. */
export default function ContextChip({ question }) {
  if (!question) return null
  return (
    <button className="ob-chip mono-ob" onClick={() => askVeronica(question)}>
      ASK VERONICA ABOUT THIS <span aria-hidden="true">↗</span>
    </button>
  )
}

import { useLayoutEffect, useRef } from 'react'
import { CLS, FRAMES_PER_ACT, FPS, tc } from '../lib/data.js'

/** Size the display title so its widest line fills the column at rest (wdth 62). */
function useFit(ref) {
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const fit = () => {
      const cs = getComputedStyle(el.parentElement)
      const box = el.parentElement.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
      if (!box) return
      el.style.fontSize = '100px'
      el.style.fontVariationSettings = "'wdth' 62"
      const spans = [...el.querySelectorAll('.sj-fit-line')]
      const w = Math.max(...spans.map(x => x.getBoundingClientRect().width), 1)
      el.style.fontVariationSettings = ''
      const max = window.innerWidth <= 900 ? window.innerWidth * 0.3 : Math.min(168, window.innerWidth * 0.093)
      el.style.fontSize = `${Math.min(max, (100 * box) / w).toFixed(1)}px`
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el.parentElement)
    document.fonts?.ready.then(fit)
    return () => ro.disconnect()
  }, [ref])
}

/** Section header: a detector tab (index · act · film timecode), the display title, a dek. */
export default function SecHead({ n, act, cls = 'unknown', id, title, dek, label }) {
  const at = tc((act - 1) * (FRAMES_PER_ACT / FPS))
  const h = useRef(null)
  useFit(h)
  const lines = typeof title === 'string' ? [title] : title
  return (
    <header className="sj-head">
      <p className="sj-head-tab">
        <span className="sj-tab" style={{ '--c': CLS[cls] }}>{String(n).padStart(2, '0')} · {label || 'section'}</span>
        <span className="sj-head-meta">act {String(act).padStart(2, '0')} · film {at}</span>
      </p>
      <h2 id={id} ref={h} className="sj-disp sj-h2">
        {lines.map((l, i) => <span key={i} className="sj-fit-line">{l}</span>)}
      </h2>
      {dek && <p className="sj-dek">{dek}</p>}
    </header>
  )
}

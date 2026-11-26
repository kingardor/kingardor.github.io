import { useEffect, useRef } from 'react'
import { scramble, reducedMotion } from '../lib/fx.js'
import { getSession, noteIdle } from '../lib/session.js'

const INTERACTIVE = 'a, button, input, [role="tab"], [data-sj-intent]'
const K = 0.22 // spring follow per frame (≈ 60 fps)

/**
 * The visitor is a subject too. A detector box lags behind the cursor,
 * wraps whatever you are about to click, and gets judgemental when you
 * stop moving. Touch: no cursor box; each tap gets a brief detection.
 */
export default function VisitorBox() {
  const boxRef = useRef(null)
  const labRef = useRef(null)
  const tapsRef = useRef(null)

  useEffect(() => {
    if (reducedMotion()) return
    const id = getSession().id
    const fine = window.matchMedia('(pointer: fine)').matches
    const box = boxRef.current
    const lab = labRef.current
    let raf = 0
    let tx = -200, ty = -200, tw = 56, th = 66
    let x = tx, y = ty, w = tw, h = th
    let mode = ''
    let idleT = 0
    let conf = 0.87
    let confT = 0

    const setMode = (m, text) => {
      if (mode === m) return
      mode = m
      box.dataset.mode = m
      scramble(lab, text, { ms: 220 })
    }
    const idleText = () => `visitor · idle · still deciding?`
    const trackText = () => `visitor ${conf.toFixed(2)} · id ${id}`

    const loop = () => {
      raf = 0
      x += (tx - x) * K; y += (ty - y) * K
      w += (tw - w) * K; h += (th - h) * K
      box.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
      box.style.width = `${w.toFixed(1)}px`
      box.style.height = `${h.toFixed(1)}px`
      if (Math.abs(tx - x) + Math.abs(ty - y) + Math.abs(tw - w) + Math.abs(th - h) > 0.3) raf = requestAnimationFrame(loop)
    }
    const wake = () => { if (!raf) raf = requestAnimationFrame(loop) }

    const armIdle = () => {
      clearTimeout(idleT)
      idleT = setTimeout(() => {
        if (mode === 'intent') return
        setMode('idle', idleText())
        noteIdle()
      }, 4000)
    }

    const onMove = (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return
      box.classList.add('sj-on')
      const target = e.target.closest?.(INTERACTIVE)
      if (target && !target.closest('.sj-feed')) {
        const r = target.getBoundingClientRect()
        tx = r.left - 5; ty = r.top - 5; tw = r.width + 10; th = r.height + 10
        setMode('intent', `visitor · intent ${(0.9 + Math.random() * 0.08).toFixed(2)}`)
      } else {
        tw = 56; th = 66
        tx = e.clientX - tw / 2; ty = e.clientY - th / 2
        const now = performance.now()
        if (mode !== 'track' || now - confT > 1400) {
          confT = now
          conf = 0.84 + Math.random() * 0.07
          mode = ''
          setMode('track', trackText())
        }
      }
      armIdle()
      wake()
    }
    const onLeave = () => { box.classList.remove('sj-on'); clearTimeout(idleT) }
    const onScroll = () => { if (mode === 'intent') { mode = ''; setMode('track', trackText()) } }

    const onTap = (e) => {
      if (e.pointerType === 'mouse') return
      const host = tapsRef.current
      if (!host) return
      const t = document.createElement('div')
      t.className = 'sj-box sj-tap sj-on sj-snap'
      t.style.transform = `translate3d(${e.clientX - 36}px, ${e.clientY - 36}px, 0)`
      t.innerHTML = `<span class="sj-box-tab"><span class="sj-box-label">visitor ${(0.8 + Math.random() * 0.15).toFixed(2)} · tap</span></span>`
      host.appendChild(t)
      setTimeout(() => t.remove(), 900)
    }

    if (fine) {
      window.addEventListener('pointermove', onMove, { passive: true })
      document.documentElement.addEventListener('pointerleave', onLeave)
      window.addEventListener('scroll', onScroll, { passive: true })
    }
    window.addEventListener('pointerdown', onTap, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(idleT)
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointerdown', onTap)
    }
  }, [])

  return (
    <div className="sj-visitor-layer" aria-hidden="true">
      <div ref={boxRef} className="sj-box sj-visitor">
        <span className="sj-box-tab"><span ref={labRef} className="sj-box-label" /></span>
      </div>
      <div ref={tapsRef} />
    </div>
  )
}

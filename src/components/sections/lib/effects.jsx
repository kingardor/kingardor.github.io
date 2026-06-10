import React, { useEffect, useRef, useState } from 'react'

/** Scrambles into the final text when `trigger` flips true. */
export function ScrambleText({ text, className, trigger }) {
  const [display, setDisplay] = useState(text)
  const fired = useRef(false)
  useEffect(() => {
    if (!trigger || fired.current) return
    fired.current = true
    const CHARS = '!<>[]{}—_*#$@/\\?ABCDEFGHIJKLMNOPQRSTUVWXYZ01'
    let frame = 0
    const STEPS = 22
    const tick = () => {
      setDisplay(
        text.split('').map((ch, i) => {
          if (ch === ' ' || ch === '.') return ch
          if (i < Math.floor((frame / STEPS) * text.length * 1.4)) return ch
          return CHARS[Math.floor(Math.random() * CHARS.length)]
        }).join('')
      )
      frame++
      if (frame <= STEPS) requestAnimationFrame(tick)
      else setDisplay(text)
    }
    const id = setTimeout(() => requestAnimationFrame(tick), 300)
    return () => clearTimeout(id)
  }, [trigger, text])
  return <span className={className}>{display}</span>
}

/** Types out text when scrolled into view. */
export function TypewriterKicker({ text }) {
  const [display, setDisplay] = useState('')
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let timer
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      io.disconnect()
      let i = 0
      timer = setInterval(() => {
        setDisplay(text.slice(0, i + 1))
        i++
        if (i >= text.length) clearInterval(timer)
      }, 38)
    }, { threshold: 0.3 })
    io.observe(el)
    return () => { io.disconnect(); clearInterval(timer) }
  }, [text])
  return <span ref={ref}>{display}<span className="cursor-blink">▌</span></span>
}

/** Element leans toward the cursor on hover. */
export function MagneticButton({ tag = 'a', children, className, style, ...props }) {
  const Tag = tag
  const ref = useRef(null)
  const onMove = (e) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const dx = (e.clientX - (r.left + r.width / 2)) * 0.32
    const dy = (e.clientY - (r.top + r.height / 2)) * 0.32
    el.style.transform = `translate(${dx}px, ${dy}px)`
  }
  const onLeave = () => { if (ref.current) ref.current.style.transform = '' }
  return (
    <Tag ref={ref} className={className} style={{ transition: 'transform 0.4s cubic-bezier(.22,1,.36,1)', ...style }}
      onMouseMove={onMove} onMouseLeave={onLeave} {...props}>
      {children}
    </Tag>
  )
}

/** Section header shared by all chapters. */
export function SectionHead({ kicker, index, title }) {
  return (
    <header className="ob-sec-head reveal">
      <div className="ob-kicker mono-ob"><span className="ob-ember">{kicker}</span> · {index}</div>
      <h2 className="ob-sec-title">{title}</h2>
    </header>
  )
}

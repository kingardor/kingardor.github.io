import { useEffect, useRef } from 'react'
import { isMobile, prefersReduced } from '../../shared/utils/capabilities.js'

// One video segment per section. Segment N ends on the exact keyframe that
// segment N+1 starts on, so holding a finished segment's last frame is
// pixel-identical to the next segment's first frame — boundaries are silent.
const SEGMENTS = [
  { id: 'top' },      // selfie → circuits wake, dusk falls   (hero + manifesto)
  { id: 'career' },   // twilight, armor assembles, blueprints
  { id: 'skills' },   // void; head opens: PCB + wiring
  { id: 'projects' }, // chrome plate completes, schematics
  { id: 'videos' },   // red eye ignites, REC
  { id: 'writing' },  // glyph rain, contemplative
  { id: 'honours' },  // mirror polish, crown light
  { id: 'contact' },  // slow push-in, final form
]

const SEEK_EPS = 1 / 30      // forward: don't reseek for sub-frame deltas
const SEEK_EPS_BACK = 0.07   // backward: fewer, larger steps — every reverse
                             // seek re-decodes its GOP, and Safari stops
                             // repainting under per-frame backward seeks
const MAX_RATE = 1.5      // video-seconds per real second — the cinematic leash:
                          // scroll sets the destination, the footage never plays
                          // faster than 1.5× its authored speed getting there
const CHASE_LAMBDA = 3    // easing as the displayed frame settles onto the target
const SWITCH_FADE_MS = 300

/**
 * Fixed full-viewport story layer scrubbed by scroll. The active section's
 * segment is visible and its currentTime follows section progress; all
 * other segments hide. Ports the old hero's battle-tested mobile machinery:
 * iOS gesture priming, single-seek-in-flight gating, decoder wake on tab
 * restore. Reduced motion gets a static poster.
 */
export default function StoryScrub() {
  const rootRef = useRef(null)

  useEffect(() => {
    if (prefersReduced || window.__PRERENDER) return
    const root = rootRef.current
    if (!root) return
    const videos = Array.from(root.querySelectorAll('video'))

    // ── Seek gating: one in-flight seek per video, coalesce to latest ──
    const pending = new Array(videos.length).fill(null)
    const onSeeked = videos.map((v, i) => () => {
      if (pending[i] !== null) {
        const t = pending[i]
        pending[i] = null
        v.currentTime = t
      }
    })
    videos.forEach((v, i) => v.addEventListener('seeked', onSeeked[i]))

    const seekSec = (i, sec) => {
      const v = videos[i]
      if (v.readyState < 2 || !v.duration) return
      const target = Math.min(v.duration - 0.05, Math.max(0, sec))
      const delta = target - v.currentTime
      if (Math.abs(delta) < (delta < 0 ? SEEK_EPS_BACK : SEEK_EPS)) return
      if (v.seeking) pending[i] = target
      else v.currentTime = target
    }

    // ── Cinematic decoupling: scroll computes a TARGET time, but each
    // segment's displayed frame chases it — eased, and never faster than
    // MAX_RATE — so fast scrolling moves the page at full speed while the
    // footage keeps its own rhythm and settles a beat later. ──
    const shown = new Array(videos.length).fill(0)
    const chase = (i, targetSec, dt) => {
      const dur = videos[i].duration || 6
      const tgt = Math.min(dur - 0.05, Math.max(0, targetSec))
      let step = (tgt - shown[i]) * (1 - Math.exp(-CHASE_LAMBDA * dt))
      const cap = MAX_RATE * dt
      if (step > cap) step = cap
      else if (step < -cap) step = -cap
      shown[i] += step
      seekSec(i, shown[i])
    }

    // ── iOS: videos can't seek until a user gesture activates them.
    // Prime every segment inside the first touch gesture. ──
    let primed = false
    const prime = () => {
      if (primed) return
      primed = true
      videos.forEach(v => v.play().then(() => v.pause()).catch(() => {}))
    }
    window.addEventListener('touchstart', prime, { once: true, passive: true })

    // ── Contiguous partition of the whole scroll space: segment i owns
    // [anchor_i, anchor_i+1) where an anchor sits just before its section
    // scrolls into view. The story timeline is therefore strictly monotonic
    // with scroll, and handoffs land exactly on the shared keyframes. ──
    let anchors = []
    const measure = () => {
      const vh = window.innerHeight
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - vh)
      anchors = SEGMENTS.map((s, i) => {
        if (i === 0) return 0
        const el = document.getElementById(s.id)
        if (!el) return null
        const top = el.getBoundingClientRect().top + window.scrollY
        return Math.min(maxScroll - 1, Math.max(0, top - vh * 0.85))
      }).filter(a => a !== null)
      anchors.push(maxScroll)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)

    // ── rAF driver: pick active segment, chase its target, manage preload ──
    let raf
    let lastActive = -1
    let prevActive = -1
    let fadeUntil = 0
    let lastNow = performance.now()
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const now = performance.now()
      const dt = Math.min(0.05, (now - lastNow) / 1000) // clamp tab-jank spikes
      lastNow = now

      const y = window.scrollY
      let active = 0
      for (let i = 0; i < anchors.length - 1; i++) {
        if (y >= anchors[i]) active = i
        else break
      }
      const span = Math.max(1, anchors[active + 1] - anchors[active])
      const t = Math.min(1, Math.max(0, (y - anchors[active]) / span))
      if (active !== lastActive) {
        videos.forEach((v, i) => {
          v.style.opacity = i === active ? '1' : '0'
          // keep neighbors warm, let distant segments idle
          const near = Math.abs(i - active) <= 1
          if (near && v.preload !== 'auto') v.preload = 'auto'
        })
        // The incoming segment performs from its shared boundary keyframe
        // toward wherever the scroll landed — a scene settling in, not a jump
        if (lastActive !== -1) {
          shown[active] = active > lastActive ? 0 : (videos[active].duration || 6)
          prevActive = lastActive
          fadeUntil = now + SWITCH_FADE_MS
        }
        lastActive = active
      }
      // At rest the full-res hero.webp sits on top — the 1024w video frame
      // reads soft when upscaled. It yields as soon as scrubbing begins.
      const still = root.querySelector('.story-still')
      if (still) still.style.opacity = active === 0 ? (1 - Math.min(1, t / 0.06)).toFixed(3) : '0'

      chase(active, t * (videos[active].duration || 6), dt)
      // While the 0.25s opacity crossfade runs, the outgoing segment keeps
      // performing toward its boundary keyframe instead of freezing mid-frame
      if (prevActive !== -1 && prevActive !== active && now < fadeUntil) {
        chase(prevActive, prevActive < active ? (videos[prevActive].duration || 6) : 0, dt)
      }
    }
    raf = requestAnimationFrame(tick)

    // ── Tab restore: the browser evicts background decoders; wake the
    // active one and force a real re-decode at the current frame ──
    const onVisibility = () => {
      if (document.visibilityState !== 'visible' || lastActive < 0) return
      requestAnimationFrame(() => {
        const v = videos[lastActive]
        if (!v?.duration) return
        const target = v.currentTime
        v.play()
          .then(() => { v.pause(); v.currentTime = target })
          .catch(() => { v.currentTime = target + 0.0001 })
      })
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('touchstart', prime)
      document.removeEventListener('visibilitychange', onVisibility)
      videos.forEach((v, i) => v.removeEventListener('seeked', onSeeked[i]))
    }
  }, [])

  if (prefersReduced || (typeof window !== 'undefined' && window.__PRERENDER)) {
    return <div className="story-layer story-poster" aria-hidden="true" />
  }

  const mobile = isMobile
  return (
    <div className="story-layer" ref={rootRef} aria-hidden="true">
      {SEGMENTS.map((s, i) => (
        <video
          key={s.id}
          className="story-video"
          src={`/story/story-${i + 1}${mobile ? '-m' : ''}.mp4`}
          muted
          playsInline
          preload={i === 0 ? 'auto' : 'metadata'}
          style={{ opacity: i === 0 ? 1 : 0 }}
        />
      ))}
      <img className="story-still" src="/hero.webp" alt="" />
      <div className="story-scrim" />
    </div>
  )
}

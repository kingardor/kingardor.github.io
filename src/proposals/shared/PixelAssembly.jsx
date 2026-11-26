import { useEffect, useState } from 'react'
import HeroParticles from '../../components/prototype/HeroParticles.jsx'
import { portraitBg } from '../../components/portrait/portraitFlag.js'

/**
 * The pixel-assembly intro, packaged for any layout: the Golden Gate selfie
 * flies together from scattered pixels, then crossfades into the story
 * film's first frame (the same image, drawn with the same cover + 22% focus).
 *
 * Place it inside a full-viewport, position: relative container that sits
 * exactly over the film (the hero's sticky pin). It unmounts itself when done.
 * `onAssembled` fires as the crossfade starts (≈1.5 s after the loader lifts).
 * Skipped under ?bg=portrait: that stage has its own reveal and a different photo.
 */
export default function PixelAssembly({ onAssembled, className = '' }) {
  const [phase, setPhase] = useState(() =>
    typeof window !== 'undefined' &&
      (window.__PRERENDER || portraitBg() || window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      ? 'done'
      : 'assembling')

  useEffect(() => {
    if (phase !== 'fading') return
    const id = setTimeout(() => setPhase('done'), 1100) // matches the CSS fade
    return () => clearTimeout(id)
  }, [phase])

  useEffect(() => {
    if (phase === 'done') onAssembled?.()
    // fire once for reduced motion / prerender, where there is no animation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (phase === 'done') return null
  return (
    <div className={`ob-hero-assembly${phase === 'fading' ? ' fading' : ''} ${className}`} aria-hidden="true">
      <HeroParticles onAssembled={() => { setPhase('fading'); onAssembled?.() }} />
    </div>
  )
}

import { useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Vector2 } from 'three'
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing'
import Monolith from './Monolith.jsx'
import { useLenis } from '../../shared/components/SmoothScroll.jsx'
import { webglTier } from '../../shared/utils/capabilities.js'

// Scroll velocity → chromatic aberration intensity (subtle at rest)
function CAController({ offset }) {
  const lenisRef = useLenis()
  useFrame(() => {
    const v = Math.abs(lenisRef?.current?.velocity ?? 0)
    const o = Math.min(0.003, 0.0006 + v * 0.000015)
    offset.set(o, o)
  })
  return null
}

export default function MonolithCanvas() {
  // Shared Vector2: the CA effect holds it as its uniform value, the
  // controller mutates it per frame
  const caOffset = useMemo(() => new Vector2(0.0006, 0.0006), [])
  const tier = webglTier()
  if (tier === 0) return null

  return (
    <div className="monolith-canvas" aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 5], fov: 45 }}
      >
        <Monolith subdivisions={tier === 1 ? 24 : 64} />
        <CAController offset={caOffset} />
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur intensity={0.35} luminanceThreshold={0.6} luminanceSmoothing={0.2} />
          <ChromaticAberration offset={caOffset} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}

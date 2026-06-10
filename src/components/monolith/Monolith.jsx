import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import vertexShader from './monolith.vert.js'
import fragmentShader from './monolith.frag.js'
import { poseAt, POSE_KEYS } from './keyframes.js'
import { useScrollProgress, useLenis } from '../../shared/components/SmoothScroll.jsx'
import useSectionRanges from './useSectionRanges.js'

const INTRO_MS = 2200 // materialize duration after mount (uDissolve 1 → 0)

export default function Monolith({ subdivisions = 64 }) {
  const meshRef = useRef(null)
  const scrollRef = useScrollProgress()
  const lenisRef = useLenis()
  const stopsRef = useSectionRanges()
  const { viewport } = useThree()

  const mountedAt = useMemo(() => performance.now(), [])
  // Scratch objects — reused every frame, no allocation in useFrame
  const target = useMemo(() => Object.fromEntries(POSE_KEYS.map(k => [k, 0])), [])
  const current = useMemo(() => ({ rotY: 0 }), [])

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uNoiseAmp: { value: 0.04 },
    uStretchY: { value: 2.2 },
    uTwist: { value: 0 },
    uDissolve: { value: 1 },
    uShard: { value: 0 },
    uEmber: { value: 0.15 },
    uFacet: { value: 0.85 },
  }), [])

  const geometry = useMemo(() => new THREE.IcosahedronGeometry(1, subdivisions), [subdivisions])

  useFrame((state, delta) => {
    const mesh = meshRef.current
    if (!mesh) return
    const t = state.clock.elapsedTime
    uniforms.uTime.value = t

    const p = scrollRef.current ?? 0
    poseAt(stopsRef.current, p, target)

    // Heavy cinematic lag: damp every channel toward its target
    const d = (cur, tgt, lambda = 2.5) => THREE.MathUtils.damp(cur, tgt, lambda, delta)

    // Normalized viewport coords → world units at z≈0 (clamped on narrow screens)
    const halfW = viewport.width / 2
    const halfH = viewport.height / 2
    const tx = THREE.MathUtils.clamp(target.x, -1, 1) * halfW * 0.78
    const ty = THREE.MathUtils.clamp(target.y, -1, 1) * halfH * 0.7

    mesh.position.x = d(mesh.position.x, tx)
    mesh.position.y = d(mesh.position.y, ty)
    mesh.position.z = d(mesh.position.z, target.z)
    const s = d(mesh.scale.x, target.scale)
    mesh.scale.setScalar(s)

    uniforms.uStretchY.value = d(uniforms.uStretchY.value, target.stretchY)
    uniforms.uNoiseAmp.value = d(uniforms.uNoiseAmp.value, target.noiseAmp)
    uniforms.uTwist.value = d(uniforms.uTwist.value, target.twist)
    uniforms.uShard.value = d(uniforms.uShard.value, target.shard)
    uniforms.uEmber.value = d(uniforms.uEmber.value, target.ember)
    uniforms.uFacet.value = d(uniforms.uFacet.value, target.facet)

    // Materialize intro overrides the pose dissolve for the first beats
    const intro = Math.min(1, (performance.now() - mountedAt) / INTRO_MS)
    const introDissolve = 1 - (1 - Math.pow(1 - intro, 3)) // ease-out cubic, 1 → 0
    uniforms.uDissolve.value = Math.max(introDissolve, 0)

    // Continuous slow rotation + scroll-velocity agitation
    const vel = Math.abs(lenisRef?.current?.velocity ?? 0)
    current.rotY += delta * (target.rotSpeed + Math.min(0.25, vel * 0.0004))
    mesh.rotation.y = current.rotY
    mesh.rotation.x = Math.sin(t * 0.07) * 0.06
  })

  return (
    <mesh ref={meshRef} geometry={geometry} position={[2.2, 0, 0]}>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  )
}

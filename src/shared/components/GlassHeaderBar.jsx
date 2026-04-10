/* eslint-disable react/no-unknown-property */
import * as THREE from 'three'
import { useRef, useState, useEffect } from 'react'
import { Canvas, createPortal, useFrame } from '@react-three/fiber'
import { useFBO, useGLTF, Stars, MeshTransmissionMaterial } from '@react-three/drei'
// Stars is used inside createPortal (captured into FBO for refraction, not rendered directly)
import { useTheme } from '../contexts/ThemeContext'

function BarMesh() {
  const ref = useRef()
  const buffer = useFBO()
  const [bgScene] = useState(() => new THREE.Scene())
  const { nodes } = useGLTF('/assets/3d/bar.glb')
  const geoWidthRef = useRef(1)

  useEffect(() => {
    const geo = nodes['Cube']?.geometry
    if (!geo) return
    geo.computeBoundingBox()
    const bb = geo.boundingBox
    geoWidthRef.current = bb.max.x - bb.min.x || 1
  }, [nodes])

  useFrame((state) => {
    const { gl, viewport: vp, camera } = state
    const v = vp.getCurrentViewport(camera, [0, 0, 15])

    // Center in the header canvas
    ref.current.position.set(0, 0, 15)

    // Scale to fill ~95% of canvas width
    const desired = (v.width * 0.95) / geoWidthRef.current
    ref.current.scale.setScalar(Math.min(desired, 0.25))

    gl.setRenderTarget(buffer)
    gl.render(bgScene, camera)
    gl.setRenderTarget(null)
  })

  return (
    <>
      {createPortal(
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={0.6} />,
        bgScene
      )}
      {/* Glass bar mesh — canvas is transparent everywhere else */}
      <mesh ref={ref} geometry={nodes['Cube']?.geometry} rotation-x={Math.PI / 2}>
        <MeshTransmissionMaterial
          buffer={buffer.texture}
          ior={1.15}
          thickness={10}
          transmission={1}
          roughness={0}
          chromaticAberration={0.05}
          anisotropy={0.01}
          color="#ffffff"
          attenuationColor="#ffffff"
          attenuationDistance={0.25}
        />
      </mesh>
    </>
  )
}

export default function GlassHeaderBar() {
  const { theme } = useTheme()

  // Light mode: CSS glass fallback
  if (theme === 'light') {
    return (
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl"
        aria-hidden="true"
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      />
    )
  }

  return (
    <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 20], fov: 15 }} gl={{ alpha: true }}>
        <BarMesh />
      </Canvas>
    </div>
  )
}

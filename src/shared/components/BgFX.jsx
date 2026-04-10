import * as THREE from 'three'
import { useRef, useState } from 'react'
import { Canvas, createPortal, useFrame, useThree } from '@react-three/fiber'
import { Stars, useFBO, MeshTransmissionMaterial } from '@react-three/drei'
import { easing } from 'maath'
import { useTheme } from '../contexts/ThemeContext'

/* ─── Glass lens that refracts the star field ─────────────────────────────── */
function StarLens({ visible }) {
  const meshRef = useRef()
  const buffer  = useFBO()
  const [bgScene] = useState(() => new THREE.Scene())
  const { viewport } = useThree()

  useFrame((state, delta) => {
    const { gl, camera, pointer, viewport: vp } = state
    const v = vp.getCurrentViewport(camera, [0, 0, 15])

    // Smooth cursor tracking
    easing.damp3(
      meshRef.current.position,
      [(pointer.x * v.width) / 2, (pointer.y * v.height) / 2, 15],
      0.12,
      delta
    )

    // Render the star scene into the FBO so the lens can refract it
    gl.setRenderTarget(buffer)
    gl.render(bgScene, camera)
    gl.setRenderTarget(null)
  })

  return (
    <>
      {/* Stars rendered into a secondary scene for capture */}
      {createPortal(
        <Stars radius={100} depth={50} count={4500} factor={4} saturation={0} fade speed={0.8} />,
        bgScene
      )}

      {/* Full-screen plane that displays the captured star field */}
      <mesh scale={[viewport.width, viewport.height, 1]} visible={visible}>
        <planeGeometry />
        <meshBasicMaterial map={buffer.texture} />
      </mesh>

      {/* Cursor-following glass cylinder — refracts the star field */}
      <mesh ref={meshRef} scale={0.15} rotation-x={Math.PI / 2} visible={visible}>
        <cylinderGeometry args={[1, 1, 0.3, 64]} />
        <MeshTransmissionMaterial
          buffer={buffer.texture}
          ior={1.35}
          thickness={5}
          anisotropy={0.5}
          chromaticAberration={0.14}
          roughness={0}
          color="#ffffff"
        />
      </mesh>
    </>
  )
}

/* ─── Main component ──────────────────────────────────────────────────────── */
export default function BgFX() {
  const { theme } = useTheme()
  const isDark = theme !== 'light'

  return (
    <div className="fixed inset-0 -z-10 h-full w-full" style={{ background: 'var(--nm-bg)' }}>
      {/* Light mode radial gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.6) 100%)'
            : 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(220,38,38,0.06), transparent 70%)',
          zIndex: isDark ? 10 : 0,
        }}
      />
      {/* Canvas always mounted — avoids expensive teardown on theme switch */}
      <Canvas camera={{ position: [0, 0, 20], fov: 15 }}>
        <StarLens visible={isDark} />
      </Canvas>
    </div>
  )
}

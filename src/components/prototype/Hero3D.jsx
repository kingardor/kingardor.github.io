import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Icosahedron, MeshDistortMaterial } from '@react-three/drei'

function AnimatedShape() {
  const meshRef = useRef(null)

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.getElapsedTime()
    meshRef.current.rotation.x = Math.sin(t / 4)
    meshRef.current.rotation.y = Math.sin(t / 2)
    // Add subtle hover effect based on pointer
    meshRef.current.position.x = (state.pointer.x * state.viewport.width) / 20
    meshRef.current.position.y = (state.pointer.y * state.viewport.height) / 20
  })

  return (
    <Icosahedron args={[1, 2]} ref={meshRef} scale={1.5}>
      <MeshDistortMaterial
        color="#ef2b3a"
        attach="material"
        distort={0.4}
        speed={2}
        roughness={0.2}
        wireframe={true}
      />
    </Icosahedron>
  )
}

export default function Hero3D() {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', opacity: 0.6 }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <AnimatedShape />
      </Canvas>
    </div>
  )
}

import React, { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

function ParticleField({ count = 4000 }) {
    const points = useRef()
    const positions = useMemo(() => {
        const p = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            const r = Math.sqrt(Math.random()) * 12
            const theta = 2 * Math.PI * Math.random()
            const phi = Math.acos(2 * Math.random() - 1)

            const x = r * Math.sin(phi) * Math.cos(theta)
            const y = r * Math.sin(phi) * Math.sin(theta)
            const z = r * Math.cos(phi)

            p[i * 3] = x
            p[i * 3 + 1] = y
            p[i * 3 + 2] = z
        }
        return p
    }, [count])

    useFrame((state) => {
        const time = state.clock.getElapsedTime()

        // Subtle rotation
        points.current.rotation.x = time * 0.05
        points.current.rotation.y = time * 0.03

        // Mouse interaction (if needed in future, adding basic sway here)
        const mouseX = state.mouse.x * 0.5
        const mouseY = state.mouse.y * 0.5
        points.current.rotation.x += (mouseY - points.current.rotation.x) * 0.05
        points.current.rotation.y += (mouseX - points.current.rotation.y) * 0.05
    })

    return (
        <Points ref={points} positions={positions} stride={3} frustumCulled={false}>
            <PointMaterial
                transparent
                color="#d946ef" // Neon Purple
                size={0.035}
                sizeAttenuation={true}
                depthWrite={false}
                opacity={0.6}
                vertexColors={false}
            />
        </Points>
    )
}

export default function DigitalSoul() {
    return (
        <div className="absolute inset-0 z-0">
            <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
                <fog attach="fog" args={['#030305', 5, 20]} />
                <ParticleField />
            </Canvas>
        </div>
    )
}

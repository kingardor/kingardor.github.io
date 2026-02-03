import { Canvas } from '@react-three/fiber'
import { Stars } from '@react-three/drei'

export default function BgFX() {
  return (
    <div className="fixed inset-0 -z-10 h-full w-full bg-[#050505]">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/90 pointer-events-none z-10" />
      <Canvas camera={{ position: [0, 0, 1] }}>
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      </Canvas>
    </div>
  )
}

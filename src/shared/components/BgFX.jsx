import { Canvas } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { useTheme } from '../contexts/ThemeContext'

export default function BgFX() {
  const { theme } = useTheme()

  if (theme === 'light') {
    return (
      <div className="fixed inset-0 -z-10 h-full w-full" style={{ background: 'var(--nm-bg)' }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(220,38,38,0.06), transparent 70%)',
          }}
        />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 -z-10 h-full w-full" style={{ background: 'var(--nm-bg)' }}>
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.6) 100%)' }}
      />
      <Canvas camera={{ position: [0, 0, 1] }}>
        <Stars radius={100} depth={50} count={4500} factor={4} saturation={0} fade speed={0.8} />
      </Canvas>
    </div>
  )
}

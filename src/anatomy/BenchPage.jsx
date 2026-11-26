import useLoaderRelease from '../proposals/shared/useLoaderRelease.js'
import Bench from './Bench.jsx'

// Review page for the anatomy figure (/#/lab/bench).
export default function BenchPage() {
  useLoaderRelease()
  return (
    <main style={{ minHeight: '100svh', background: '#0b0b0d', padding: 'clamp(16px, 4vw, 56px) clamp(8px, 3vw, 48px)' }}>
      <div style={{ maxWidth: 1480, margin: '0 auto' }}>
        <Bench />
      </div>
    </main>
  )
}

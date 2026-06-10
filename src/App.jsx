import React, { Suspense, useEffect } from 'react'
import useHashPath from './shared/hooks/useHashPath'
import { useLenis } from './shared/components/SmoothScroll'
import Home from './components/prototype/Home'

const ChatPage = React.lazy(() => import('./sections/Chat/ChatPage'))

function ChatLoader() {
  return (
    <div style={{
      height: '100svh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '1.5rem',
      background: 'var(--nm-bg)', position: 'relative', overflow: 'hidden',
    }}>
      {/* Subtle radial glow behind sigil */}
      <div style={{
        position: 'absolute', width: 320, height: 320, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,61,0,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* V sigil */}
      <div style={{
        width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg, #ff3d00, #ff6a33)',
        boxShadow: '0 0 40px rgba(255,61,0,0.4), 0 0 80px rgba(255,61,0,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'pulseGlow 1.4s ease-in-out infinite',
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M3 5L12 20L21 5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 5L12 14L17 5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
        </svg>
      </div>

      {/* Label */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem',
          letterSpacing: '-0.04em', color: 'var(--nm-text, #f1f5f9)',
        }}>
          VERONICA
        </div>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem',
          letterSpacing: '0.18em', color: 'var(--nm-text-muted, rgba(148,163,184,0.8))',
          animation: 'blink 1.4s step-end infinite',
        }}>
          INITIALIZING SYSTEMS...
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        width: 160, height: 1,
        background: 'rgba(255,61,0,0.2)',
        borderRadius: 1, overflow: 'hidden',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, height: '100%', width: '40%',
          background: 'linear-gradient(to right, transparent, #ff3d00, transparent)',
          animation: 'chatLoadScan 1.2s ease-in-out infinite',
        }} />
      </div>
    </div>
  )
}

export default function App() {
  const path = useHashPath()
  const lenisRef = useLenis()

  useEffect(() => {
    const lenis = lenisRef?.current
    if (!lenis) return
    if (path.startsWith('/chat')) lenis.stop()
    else lenis.start()
  }, [path, lenisRef])

  if (path.startsWith('/chat')) {
    return (
      <Suspense fallback={<ChatLoader />}>
        <ChatPage />
      </Suspense>
    )
  }

  return <Home />
}

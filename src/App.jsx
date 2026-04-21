import React, { Suspense, useEffect } from 'react'
import useHashPath from './shared/hooks/useHashPath'
import { useLenis } from './shared/components/SmoothScroll'
import Home from './components/prototype/Home'

const ChatPage = React.lazy(() => import('./sections/Chat/ChatPage'))

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
      <Suspense fallback={<div className="text-zinc-400">Loading chat...</div>}>
        <ChatPage />
      </Suspense>
    )
  }

  return <Home />
}

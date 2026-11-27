import React, { Suspense } from 'react'
import useVeronica from './useVeronica.js'
import { lastEdition, rememberEdition } from '../../editions/editions.js'

const SKINS = {
  mint: React.lazy(() => import('./skins/mint/MintChat.jsx')),
  versus: React.lazy(() => import('./skins/versus/VersusChat.jsx')),
  classic: React.lazy(() => import('./ChatPage.jsx')),
}

/** `#/chat?skin=mint|versus|classic`, else the visitor's edition, else Mint. */
function initialSkin() {
  const m = location.hash.match(/[?&]skin=(mint|versus|classic)\b/)
  return m?.[1] || lastEdition() || 'mint'
}

/**
 * Veronica, dressed for the edition the visitor came from. The engine lives
 * here, above the skin, so switching skins mid-conversation keeps the chat.
 * Skins receive { v, skin, setSkin }.
 */
export default function ChatRoute() {
  const v = useVeronica()
  const [skin, setSkinState] = React.useState(initialSkin)
  const setSkin = React.useCallback((next) => {
    if (!SKINS[next]) return
    if (next !== 'classic') rememberEdition(next)
    // Keep the URL in step so a reload (or a shared link) shows the same skin.
    const [path, query = ''] = location.hash.split('?')
    const params = query.split('&').filter(kv => kv && !kv.startsWith('skin='))
    params.unshift(`skin=${next}`)
    try { history.replaceState(history.state, '', `${path}?${params.join('&')}`) } catch { /* ignore */ }
    setSkinState(next)
  }, [])
  const Skin = SKINS[skin]
  return (
    <Suspense fallback={<div style={{ minHeight: '100svh', background: '#050505' }} />}>
      <Skin v={v} skin={skin} setSkin={setSkin} />
    </Suspense>
  )
}

import React from 'react'
import { Counter } from 'counterapi'

const WORKSPACE = 'akashjamesdev'
const COUNTER = 'aj-visits'

/** Site visit count via CounterAPI — increments once per session, then reads. */
export default function useSiteViews() {
  const [views, setViews] = React.useState(null)
  React.useEffect(() => {
    let mounted = true
    const onceKey = `counterapi:${WORKSPACE}:${COUNTER}:hit`
    let shouldHit = true
    try { shouldHit = !sessionStorage.getItem(onceKey) } catch { /* private mode */ }
    const client = new Counter({ workspace: WORKSPACE, timeout: 5000 })

    ;(async () => {
      try {
        const res = shouldHit ? await client.up(COUNTER) : await client.get(COUNTER)
        const v = res?.data?.up_count ?? res?.value ?? null
        if (shouldHit) { try { sessionStorage.setItem(onceKey, '1') } catch { /* ignore */ } }
        if (mounted && v != null) setViews(v)
      } catch { /* cell hides itself */ }
    })()

    return () => { mounted = false }
  }, [])
  return views
}

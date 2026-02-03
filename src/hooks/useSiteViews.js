import React from 'react'
import { Counter } from 'counterapi'
import { COUNTER } from '../data/content'

export default function useSiteViews() {
  const [views, setViews] = React.useState(null)
  React.useEffect(() => {
    let mounted = true
    const onceKey = `counterapi:${COUNTER.workspace}:${COUNTER.counter}:hit`
    const shouldHit = !sessionStorage.getItem(onceKey)
    const client = new Counter({ workspace: COUNTER.workspace, timeout: 5000 })

      ; (async () => {
        try {
          const res = shouldHit ? await client.up(COUNTER.counter) : await client.get(COUNTER.counter)
          const v = res?.data?.up_count ?? res?.value ?? null
          if (shouldHit) sessionStorage.setItem(onceKey, '1')
          if (mounted && v != null) setViews(v)
        } catch (e) {
          console.error('CounterAPI error:', e)
        }
      })()

    return () => { mounted = false }
  }, [])
  return views
}

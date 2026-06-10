import { useEffect, useState } from 'react'
import { fetchGithubEvents, istNow } from '../../shared/utils/telemetry.js'
import useSiteViews from '../../shared/hooks/useSiteViews.js'
import { prefetched } from '../../shared/utils/prefetch.js'

const TICKER_MS = 6000

/**
 * Live telemetry strip pinned to the bottom edge: GitHub activity ticker,
 * YouTube feed size, visitor count, Bengaluru clock, system status.
 * Every remote cell hides itself on failure; the strip never errors visibly.
 */
export default function TelemetryHud() {
  const [ghEvents, setGhEvents] = useState(null)
  const [ghIdx, setGhIdx] = useState(0)
  const [ytCount, setYtCount] = useState(null)
  const [time, setTime] = useState(istNow)
  const [fails, setFails] = useState(0)
  const views = useSiteViews()

  // Remote feeds — fetched once on idle, cells hide on failure
  useEffect(() => {
    let mounted = true
    const start = () => {
      fetchGithubEvents().then(ev => {
        if (!mounted) return
        if (ev?.length) setGhEvents(ev)
        else setFails(f => f + 1)
      })
      prefetched.youtube.then(data => {
        if (!mounted) return
        if (data?.items?.length) setYtCount(data.items.length)
        else setFails(f => f + 1)
      }).catch(() => mounted && setFails(f => f + 1))
    }
    const id = 'requestIdleCallback' in window
      ? requestIdleCallback(start, { timeout: 3000 })
      : setTimeout(start, 500)
    return () => {
      mounted = false
      if ('requestIdleCallback' in window) cancelIdleCallback(id)
      else clearTimeout(id)
    }
  }, [])

  // Clock — 1s tick
  useEffect(() => {
    const id = setInterval(() => setTime(istNow()), 1000)
    return () => clearInterval(id)
  }, [])

  // GitHub ticker rotation
  useEffect(() => {
    if (!ghEvents || ghEvents.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setGhIdx(i => (i + 1) % ghEvents.length), TICKER_MS)
    return () => clearInterval(id)
  }, [ghEvents])

  return (
    <div className="ob-hud mono-ob" aria-hidden="true">
      <span className="ob-hud-cell ob-hud-id"><span className="ob-hud-dot" />AJ·SYS</span>
      {ghEvents && (
        <span className="ob-hud-cell ob-hud-opt" key={ghIdx}>
          <span className="ob-hud-k">GH</span>{ghEvents[ghIdx]}
        </span>
      )}
      {ytCount != null && (
        <span className="ob-hud-cell ob-hud-opt">
          <span className="ob-hud-k">YT</span>{ytCount} TRANSMISSIONS
        </span>
      )}
      {views != null && (
        <span className="ob-hud-cell ob-hud-opt">
          <span className="ob-hud-k">VIS</span>{views.toLocaleString('en-US')}
        </span>
      )}
      <span className="ob-hud-spacer" />
      <span className="ob-hud-cell">BLR {time} IST</span>
      <span className="ob-hud-cell">
        <span className="ob-hud-k">SYS</span>{fails >= 2 ? 'DEGRADED' : 'NOMINAL'}
      </span>
    </div>
  )
}

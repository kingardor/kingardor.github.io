// Telemetry feeds for the HUD strip. Everything degrades to null — cells
// hide themselves rather than retry (GitHub unauth quota is 60 req/h per IP).

const GH_KEY = 'tlm:gh'
const GH_TTL = 10 * 60 * 1000 // 10 min

function ago(iso) {
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (mins < 60) return `${mins}M`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}H`
  return `${Math.round(hrs / 24)}D`
}

function formatEvent(e) {
  const repo = e.repo?.name?.split('/')[1] ?? e.repo?.name
  if (!repo) return null
  const t = ago(e.created_at)
  switch (e.type) {
    case 'PushEvent': return `PUSH ${repo} · ${t}`
    case 'CreateEvent': return `NEW ${e.payload?.ref_type === 'repository' ? 'REPO' : e.payload?.ref_type ?? ''} ${repo} · ${t}`
    case 'PullRequestEvent': return `PR ${repo} · ${t}`
    case 'IssuesEvent': return `ISSUE ${repo} · ${t}`
    case 'WatchEvent': return `STAR ${repo} · ${t}`
    case 'ReleaseEvent': return `RELEASE ${repo} · ${t}`
    case 'ForkEvent': return `FORK ${repo} · ${t}`
    default: return null
  }
}

/** Recent public GitHub activity as short HUD strings, or null on any failure. */
export async function fetchGithubEvents(user = 'kingardor') {
  try {
    const cached = JSON.parse(sessionStorage.getItem(GH_KEY) || 'null')
    if (cached && Date.now() - cached.at < GH_TTL) return cached.events
  } catch { /* corrupt cache → refetch */ }
  try {
    const r = await fetch(`https://api.github.com/users/${user}/events/public?per_page=10`)
    if (!r.ok) return null
    const data = await r.json()
    const events = data.map(formatEvent).filter(Boolean).slice(0, 6)
    if (!events.length) return null
    try { sessionStorage.setItem(GH_KEY, JSON.stringify({ at: Date.now(), events })) } catch { /* quota */ }
    return events
  } catch {
    return null
  }
}

const IST_FMT = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Kolkata',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

export function istNow() {
  return IST_FMT.format(new Date())
}

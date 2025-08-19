export function prepareHistory(history, { maxTurns = 10 } = {}) {
  const arr = Array.isArray(history) ? history : []

  const userIdxs = []
  for (let i = 0; i < arr.length; i++) {
    if (arr[i]?.role === 'user') userIdxs.push(i)
  }

  if (userIdxs.length <= maxTurns) {
    return arr.map(m => ({ role: m.role, content: m.content }))
  }

  const start = userIdxs[userIdxs.length - maxTurns]
  return arr.slice(start).map(m => ({ role: m.role, content: m.content }))
}

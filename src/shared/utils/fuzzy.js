/**
 * Dependency-free fuzzy scorer: word-boundary prefix matches score highest,
 * then subsequence matches with adjacency bonuses. Returns 0 for no match.
 */
export function fuzzyScore(query, target) {
  const q = query.toLowerCase().trim()
  const t = target.toLowerCase()
  if (!q) return 0
  if (t.includes(q)) {
    // Direct substring: boost word-boundary and start-of-string hits
    const at = t.indexOf(q)
    if (at === 0) return 100 + q.length * 2
    if (/\s|·|—|-/.test(t[at - 1])) return 80 + q.length * 2
    return 60 + q.length
  }
  // Subsequence with adjacency bonus
  let score = 0
  let ti = 0
  let streak = 0
  for (let qi = 0; qi < q.length; qi++) {
    const c = q[qi]
    if (c === ' ') { streak = 0; continue }
    const found = t.indexOf(c, ti)
    if (found === -1) return 0
    streak = found === ti ? streak + 1 : 1
    score += 2 + streak * 2
    ti = found + 1
  }
  return Math.min(score, 55) // subsequence never beats substring hits
}

/** Score an entry across label + keywords; returns best score. */
export function scoreEntry(query, entry) {
  let best = fuzzyScore(query, entry.label)
  if (entry.sub) best = Math.max(best, fuzzyScore(query, entry.sub) * 0.8)
  if (entry.keywords) best = Math.max(best, fuzzyScore(query, entry.keywords) * 0.9)
  return best
}

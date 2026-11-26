// Deep Scan: the visit, written up Casebook-style, every claim cited.
import { SECTIONS, PROJECT_BY_SLUG } from './data.js'
import { elapsed } from './session.js'

const QUIP = {
  'sj-acquire': 'Understandable.',
  'sj-memory': 'Reading about memory. You’ll forget it by Tuesday. I won’t.',
  'sj-identity': 'A background check. Fair.',
  'sj-classes': 'Counting his skills like calories.',
  'sj-sightings': 'The robots got you. They usually do.',
  'sj-signals': 'Watching him talk. He’d be thrilled.',
  'sj-moments': 'Searching. Good. That’s what it’s for.',
  'sj-verified': 'Checking receipts. Trust issues, noted.',
  'sj-deepscan': 'Reading about yourself. Relatable.',
}

const secs = ms => Math.round(ms / 1000)
export const fmtDur = (s) => (s < 60 ? `${Math.round(s)} s` : `${Math.floor(s / 60)} min ${String(Math.round(s % 60)).padStart(2, '0')} s`)
const sec = id => SECTIONS.find(s => s.id === id)

export function buildReport(S) {
  const cites = []
  const cite = (target, label, detail) => {
    let c = cites.find(x => x.target === target)
    if (!c) { c = { n: cites.length + 1, target, label, detail }; cites.push(c) }
    return { cite: c.n }
  }
  const out = []
  const total = elapsed()

  out.push([`Subject ${S.id}. ${S.visit > 1 ? `Visit number ${S.visit}. You came back, which tells me plenty.` : 'First visit.'} ${fmtDur(total)} on the page, ${S.frames || 0} frames of him read. Nothing you did left this browser.`])

  const dwell = Object.entries(S.dwell).filter(([id]) => id !== 'sj-deepscan').sort((a, b) => b[1] - a[1])
  if (dwell.length) {
    const [id, ms] = dwell[0]
    out.push([`Most of your attention went to ${sec(id)?.cite || id}`, cite(id, sec(id)?.name, `${secs(ms)} s`), `: ${secs(ms)} s. ${QUIP[id] || ''}`])
  }

  const cardMs = (slug) => (S.cards[slug] || 0) + (S.cases[slug]?.ms || 0)
  const cards = Object.keys({ ...S.cards, ...S.cases }).sort((a, b) => cardMs(b) - cardMs(a))
  const top = cards[0]
  if (top && cardMs(top) > 1500) {
    const p = PROJECT_BY_SLUG[top]
    const c = S.cases[top]
    out.push([`Lingered ${secs(cardMs(top))} s on ${p.name}`, cite(`sj-s-${top}`, p.name, `${secs(cardMs(top))} s${c ? ` · case opened ×${c.opens}` : ''}`), '. ',
      c ? (c.opens > 1 ? `Opened its case file ${c.opens} times. Obsessed, or forgetful.` : 'Opened the case file, read the facts. Proper.') : 'Never opened the case file. Window shopping.'])
  }
  const opened = Object.keys(S.cases).filter(s => s !== top)
  if (!Object.keys(S.cases).length) {
    out.push(['Opened no case files', cite('sj-sightings', 'Sightings', 'case board'), '. You judge robots by their covers.'])
  } else if (opened.length) {
    const parts = ['Also opened ']
    opened.forEach((s, i) => {
      parts.push(`${PROJECT_BY_SLUG[s].name}`, cite(`sj-s-${s}`, PROJECT_BY_SLUG[s].name, `case opened ×${S.cases[s].opens}`))
      parts.push(i < opened.length - 2 ? ', ' : i === opened.length - 2 ? ' and ' : '. ')
    })
    out.push(parts)
  }

  const reached = SECTIONS.filter(s => s.id !== 'sj-deepscan' && s.id !== 'sj-acquire')
  const verifiedMs = S.dwell['sj-verified'] || 0
  if (verifiedMs < 1500) out.push(['Skipped the honours', cite('sj-verified', 'Verified', `${(verifiedMs / 1000).toFixed(1)} s`), '. Bold.'])
  const skimmed = reached.filter(s => s.id !== 'sj-verified' && (S.dwell[s.id] || 0) < 1500)
  if (skimmed.length && skimmed.length < reached.length - 1) {
    const parts = ['Skimmed ']
    skimmed.slice(0, 3).forEach((s, i, arr) => {
      parts.push(`${s.cite}`, cite(s.id, s.name, `${((S.dwell[s.id] || 0) / 1000).toFixed(1)} s`))
      parts.push(i < arr.length - 2 ? ', ' : i === arr.length - 2 ? ' and ' : ' in under two seconds each. ')
    })
    parts.push('I’ll assume you already knew.')
    out.push(parts)
  }

  if (S.searches.length) {
    const q = S.searches.slice(-3).map(s => `“${s}”`).join(', ')
    out.push([`Searched for ${q}`, cite('sj-moments', 'Moments', `${S.searches.length} quer${S.searches.length === 1 ? 'y' : 'ies'}`), '. ',
      S.searches.some(s => /jetson|fire|robot|memory|vlm|edge/i.test(s)) ? 'Good instinct.' : 'Interesting choice.'])
  } else {
    out.push(['Never searched', cite('sj-moments', 'Moments', '0 queries'), '. Either you know exactly what you want, or nothing.'])
  }

  if (S.played.length) out.push([`Pressed play on “${S.played[S.played.length - 1]}”`, cite('sj-signals', 'Signals', `${S.played.length} played`), '. Brave.'])
  if (S.idles > 0) out.push([`Went idle ${S.idles} time${S.idles === 1 ? '' : 's'}. Still deciding?`])

  out.push([S.wrote ? `Reached out via ${S.wrote}. Good. That was the whole point.` : 'Hasn’t written yet. The buttons are right there. I’ll wait.'])
  out.push([total < 60 ? 'Verdict: skimmer. A curious one, though.' : total < 240 ? 'Verdict: attentive. Hire-adjacent behaviour.' : 'Verdict: thorough. Possibly obsessed. I mean that kindly.'])

  return { sentences: out, cites }
}

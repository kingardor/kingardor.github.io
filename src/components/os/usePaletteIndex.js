import { useMemo } from 'react'
import { DATA } from '../../components/prototype/dataAdapter.js'
import { PROJECTS } from '../../content/index.js'
import navigate from '../../shared/utils/navigate.js'
import { EDITIONS, currentEdition, lastEdition, openEdition } from '../../editions/editions.js'

const SEED_KEY = 'chat:seed'

export function askVeronica(q) {
  if (q) {
    try { sessionStorage.setItem(SEED_KEY, q) } catch { /* private mode */ }
    navigate(`/chat?q=${encodeURIComponent(q)}`)
  } else {
    navigate('/chat')
  }
}

// Home's sections in story order; both editions have one section per act in
// the same order, so a section jump maps onto them by index.
const ACT_OF = { top: 0, career: 1, skills: 2, spotlight: 3, projects: 3, videos: 4, writing: 5, honours: 6, contact: 7 }

function jumpTo(id) {
  const here = document.getElementById(id)
  if (here && !location.hash.startsWith('#/chat')) { here.scrollIntoView({ behavior: 'smooth' }); return }
  const act = ACT_OF[id] ?? 0
  const ed = currentEdition()
  if (ed) {
    document.getElementById(EDITIONS[ed].acts[act]?.id)?.scrollIntoView({ behavior: 'smooth' })
    return
  }
  // Picker, chat or lab: open the visitor's edition at that section.
  openEdition(lastEdition() ?? 'mint', act)
}

const SECTION_ENTRIES = [
  { id: 'top', label: 'Home', keywords: 'hero start top' },
  { id: 'spotlight', label: 'Selected work', keywords: 'work gallery vector hermes' },
  { id: 'career', label: 'Experience', keywords: 'roles history myblue sparkcognition berkeley chapters' },
  { id: 'skills', label: 'Toolkit', keywords: 'skills arsenal tools deepstream pytorch' },
  { id: 'projects', label: 'Work', keywords: 'projects mission files repos' },
  { id: 'videos', label: 'Talks', keywords: 'videos youtube workshop' },
  { id: 'writing', label: 'Writing', keywords: 'writing articles medium blog' },
  { id: 'honours', label: 'Honours', keywords: 'awards nasa nvidia speaking' },
  { id: 'contact', label: 'Contact', keywords: 'email transmission reach out hire' },
].map(s => ({
  type: 'GOTO',
  label: s.label,
  sub: `Jump to section`,
  keywords: s.keywords,
  action: () => jumpTo(s.id),
}))

/**
 * Builds the command palette index: sections, commands, curated projects,
 * writing, socials.
 */
export default function usePaletteIndex() {
  return useMemo(() => {
    const commands = [
      {
        type: 'CMD', label: 'Ask Veronica', sub: 'Open the chat', keywords: 'chat ai assistant talk',
        action: () => navigate('/chat'),
      },
      {
        type: 'CMD', label: 'Start guided tour', sub: 'Veronica walks the dossier', keywords: 'tour autopilot walkthrough',
        action: () => window.dispatchEvent(new CustomEvent('ob:tour')),
      },
      {
        type: 'CMD', label: 'Copy email', sub: DATA.contactEmail, keywords: 'mail contact address',
        action: () => navigator.clipboard?.writeText(DATA.contactEmail).catch(() => {}),
      },
    ]

    const work = PROJECTS.map(p => {
      const href = p.href || p.repo
      return {
        type: 'WORK', label: p.name, sub: (p.desc || '').slice(0, 80), keywords: (p.tags || []).join(' '),
        action: () => href?.startsWith('#') ? navigate(href.slice(1)) : href && window.open(href, '_blank'),
      }
    })

    const notes = DATA.writing.map(w => ({
      type: 'NOTE', label: w.title, sub: 'Medium', keywords: 'article blog writing',
      action: () => w.href && window.open(w.href, '_blank'),
    }))

    const socials = DATA.socials.map(s => ({
      type: 'LINK', label: s.k, sub: s.v, keywords: 'social profile',
      action: () => s.href && window.open(s.href, '_blank'),
    }))

    return [...commands, ...SECTION_ENTRIES, ...work, ...notes, ...socials]
  }, [])
}

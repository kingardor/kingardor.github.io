import { useEffect, useMemo, useState } from 'react'
import { DATA } from '../../components/prototype/dataAdapter.js'
import { prefetched } from '../../shared/utils/prefetch.js'
import navigate from '../../shared/utils/navigate.js'

const SEED_KEY = 'chat:seed'

export function askVeronica(q) {
  if (q) {
    try { sessionStorage.setItem(SEED_KEY, q) } catch { /* private mode */ }
    navigate(`/chat?q=${encodeURIComponent(q)}`)
  } else {
    navigate('/chat')
  }
}

function jumpTo(id) {
  if (location.hash.startsWith('#/chat')) {
    navigate('/')
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 350)
  } else {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }
}

const SECTION_ENTRIES = [
  { id: 'top', label: 'Home', keywords: 'hero start top' },
  { id: 'career', label: 'Career', keywords: 'roles history myblue sparkcognition berkeley chapters' },
  { id: 'skills', label: 'Stack', keywords: 'skills arsenal tools deepstream pytorch' },
  { id: 'projects', label: 'Work', keywords: 'projects mission files repos' },
  { id: 'videos', label: 'Signals', keywords: 'videos youtube workshop' },
  { id: 'writing', label: 'Notes', keywords: 'writing articles medium blog' },
  { id: 'honours', label: 'Honours', keywords: 'awards patent nvidia speaking' },
  { id: 'contact', label: 'Contact', keywords: 'email transmission reach out hire' },
].map(s => ({
  type: 'GOTO',
  label: s.label,
  sub: `Jump to section`,
  keywords: s.keywords,
  action: () => jumpTo(s.id),
}))

/**
 * Builds the command palette index: sections, commands, projects (static +
 * live GitHub once the prefetch resolves), writing, socials.
 */
export default function usePaletteIndex() {
  const [ghProjects, setGhProjects] = useState([])

  useEffect(() => {
    let mounted = true
    prefetched.github
      .then(repos => { if (mounted && repos?.length) setGhProjects(repos) })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

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

    const projects = [
      ...DATA.projects.map(p => ({
        type: 'WORK', label: p.name, sub: (p.desc || '').slice(0, 80), keywords: (p.tags || []).join(' '),
        action: () => p.href?.startsWith('#') ? navigate(p.href.slice(1)) : p.href && window.open(p.href, '_blank'),
      })),
      ...ghProjects.map(p => ({
        type: 'WORK', label: p.name, sub: (p.desc || '').slice(0, 80), keywords: (p.tags || []).join(' '),
        action: () => p.url && window.open(p.url, '_blank'),
      })),
    ]
    // Dedup by label (static list may overlap the live fetch)
    const seen = new Set()
    const work = projects.filter(p => {
      const k = p.label.toLowerCase()
      if (seen.has(k)) return false
      seen.add(k)
      return true
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
  }, [ghProjects])
}

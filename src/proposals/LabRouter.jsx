import React, { Suspense } from 'react'
import LabIndex from './LabIndex.jsx'
import './shared/film.css'

// Design proposals live at /#/lab/<slug>. Each is a complete, self-contained
// layout over the same content module and the same story film.
const PROPOSALS = {
  subject: React.lazy(() => import('./subject/index.jsx')),
  mint: React.lazy(() => import('./mint/index.jsx')),
  versus: React.lazy(() => import('./versus/index.jsx')),
  bench: React.lazy(() => import('../anatomy/BenchPage.jsx')),
}

export default function LabRouter({ path }) {
  const slug = path.replace(/^\/lab\/?/, '').split(/[/?]/)[0]
  const Proposal = PROPOSALS[slug]
  if (!Proposal) return <LabIndex />
  return (
    <Suspense fallback={<div style={{ minHeight: '100svh', background: '#050505' }} />}>
      <Proposal />
    </Suspense>
  )
}

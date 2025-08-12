import React from 'react'
import { GraduationCap } from 'lucide-react'

import { Section } from './Section'
import { Pill } from './Pill'
import { NOW_ROLES, PAST_ROLES } from '../lib/data'

const RoleCard = ({ r }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
    <div className="flex items-center justify-between">
      <div className="text-zinc-200 font-semibold">{r.title}</div>
      <div className="text-xs text-zinc-400">{r.period}</div>
    </div>
    <div className="text-sm text-zinc-400">{r.org}</div>
    <p className="mt-2 text-sm text-zinc-300/90">{r.blurb}</p>
    <div className="mt-3 flex flex-wrap gap-2">
      {r.tags?.map((t) => (
        <Pill key={t} className="bg-black/40">{t}</Pill>
      ))}
    </div>
  </div>
)

const Experience = () => (
  <Section id="experience" className="pt-12">
    <div className="mb-6 flex items-center gap-3">
      <GraduationCap className="h-5 w-5 text-zinc-300"/>
      <h2 className="text-xl font-semibold text-zinc-100">Experience</h2>
    </div>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {NOW_ROLES.map((r) => <RoleCard key={r.title} r={r}/>) }
      {PAST_ROLES.map((r) => <RoleCard key={r.title} r={r}/>) }
    </div>
  </Section>
)

export default Experience

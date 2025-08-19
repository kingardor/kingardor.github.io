import React from 'react'
import { Section } from '../../shared/components/Primitives'
import { Calendar } from 'lucide-react'
import { NOW_ROLES, PAST_ROLES } from '../../data'

const TIMELINE = [
  ...NOW_ROLES.map(r => ({ ...r, current: true })),
  ...PAST_ROLES.map(r => ({ ...r, current: false }))
]

export default function Timeline() {
  return (
    <Section id="timeline" className="pt-12">
      <div className="mb-6 flex items-center gap-3">
        <Calendar className="h-5 w-5 text-blue-400"/>
        <h2 className="text-xl font-semibold text-zinc-100">Career Timeline</h2>
      </div>
      <div className="relative mx-auto max-w-2xl">
        <div className="border-l-2 border-blue-400/30 pl-10">
          {TIMELINE.map((role, idx) => (
            <div key={role.title + idx} className="mb-10 last:mb-0 relative">
              <div className="absolute -left-6 top-2 w-5 h-5 rounded-full bg-blue-400/80 border-2 border-white/30 shadow" />
              <div className="flex flex-col gap-1">
                <div className="text-base font-semibold text-blue-200">{role.title}</div>
                <div className="text-xs text-zinc-400">{role.org} • {role.period}</div>
                <div className="text-sm text-zinc-100/90">{role.blurb}</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {role.tags?.map(t => (
                    <span key={t} className="bg-blue-400/20 text-blue-200 px-2 py-0.5 rounded-full text-xs">{t}</span>
                  ))}
                </div>
                {role.current && <span className="mt-1 inline-block text-xs text-blue-400 font-bold">Current</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}

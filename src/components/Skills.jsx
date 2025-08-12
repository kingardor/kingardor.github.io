import React from 'react'
import { Cpu } from 'lucide-react'

import { Section } from './Section'
import { SKILLS } from '../lib/data'

const SkillTile = ({ s }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
    <div className="mb-2 flex items-center gap-2 text-zinc-100">
      {s.icon}
      <span className="font-medium">{s.name}</span>
    </div>
    <div className="text-sm text-zinc-400">{s.items.join(' • ')}</div>
  </div>
)

const Skills = () => (
  <Section id="skills" className="pt-12">
    <div className="mb-6 flex items-center gap-3">
      <Cpu className="h-5 w-5 text-zinc-300"/>
      <h2 className="text-xl font-semibold text-zinc-100">Skills</h2>
    </div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {SKILLS.map((s) => <SkillTile key={s.name} s={s}/>) }
    </div>
  </Section>
)

export default Skills

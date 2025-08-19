import React from 'react'
import { Section } from '../../shared/components/Primitives'
// Using recharts for radar chart
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'

const SKILLS = [
  { skill: 'AI/ML', value: 95 },
  { skill: 'Backend', value: 85 },
  { skill: 'DevOps', value: 70 },
  { skill: 'Vision', value: 90 },
  { skill: 'NLP', value: 80 },
  { skill: 'Cloud', value: 75 },
  { skill: 'Leadership', value: 88 }
]

export default function SkillsChart() {
  return (
    <Section id="skills-chart" className="pt-8">
      <h3 className="text-lg font-semibold text-zinc-100 mb-4">Skill Radar</h3>
      <div className="w-full h-72 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={SKILLS}>
            <PolarGrid stroke="#fff2" />
            <PolarAngleAxis dataKey="skill" stroke="#fff" fontSize={12} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar name="Skill" dataKey="value" stroke="#f472b6" fill="#f472b6" fillOpacity={0.5} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </Section>
  )
}

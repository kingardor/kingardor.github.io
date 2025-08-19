import React from 'react'
import { Section } from '../../shared/components/Primitives'
import { Cpu, FileCode2, Brain, Camera } from 'lucide-react'

const SKILLS = [
  { icon: <Brain className="h-4 w-4"/>, name: 'Generative AI', items: ['qLoRA','SFT','DPO','Prompt/Routing','Agents'] },
  { icon: <Camera className="h-4 w-4"/>, name: 'Multimodal', items: ['Vision-Language','Video QA','Re-ID','Tracking'] },
  { icon: <FileCode2 className="h-4 w-4"/>, name: 'RAG / Retrieval', items: ['Hybrid sparse+dense','GraphRAG','Qdrant','Re-rank','Dedup/Cluster'] },
  { icon: <Cpu className="h-4 w-4"/>, name: 'Acceleration', items: ['DeepStream','TensorRT','CUDA','Triton'] },
]

const SkillTile = ({ s }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
    <div className="mb-2 flex items-center gap-2 text-zinc-100">
      {s.icon}
      <span className="font-medium">{s.name}</span>
    </div>
    <div className="text-sm text-zinc-400">{s.items.join(' • ')}</div>
  </div>
)

export default function Skills() {
  return (
    <Section id="skills" className="pt-12">
      <div className="mb-6 flex items-center gap-3">
        <Cpu className="h-5 w-5 text-zinc-300"/>
        <h2 className="text-xl font-semibold text-zinc-100">Skills</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SKILLS.map((s) => <SkillTile key={s.name} s={s}/>)}
      </div>
    </Section>
  )
}

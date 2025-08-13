import React from 'react'
import { Section } from '../../components/Primitives'
import { FileCode2 } from 'lucide-react'
import { PROJECTS } from '../../data'
import Carousel from './Carousel'

export default function Projects() {
  return (
    <Section id="projects" className="pt-12">
      <div className="mb-6 flex items-center gap-3">
        <FileCode2 className="h-5 w-5 text-zinc-300"/>
        <h2 className="text-xl font-semibold text-zinc-100">Featured Projects</h2>
      </div>
      <Carousel items={PROJECTS} />
    </Section>
  )
}

import React, { useEffect, useState } from 'react'
import { Section } from '../../shared/components/Primitives'
import { FileCode2 } from 'lucide-react'
import Carousel from './Carousel'
import { fetchGithubProjects } from '../../shared/utils/fetchGithubProjects'

export default function Projects() {
  const [projects, setProjects] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGithubProjects('kingardor', 6)
      .then(setProjects)
      .catch((e) => setError('Failed to load projects'));
  }, []);

  return (
    <Section id="projects" className="pt-12">
      <div className="mb-6 flex items-center gap-3">
        <FileCode2 className="h-5 w-5 text-zinc-300"/>
        <h2 className="text-xl font-semibold text-zinc-100">Featured Projects</h2>
      </div>
      {error && <div className="text-red-400 mb-4">Error: {error}</div>}
      {!projects && !error && <div className="text-zinc-400 mb-4">Loading projects...</div>}
      {projects && <Carousel items={projects} />}
    </Section>
  )
}

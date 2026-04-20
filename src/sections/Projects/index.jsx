import React, { useEffect, useState } from 'react'
import { Section, SectionHeading } from '../../shared/components/Primitives'
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
      <SectionHeading title="Featured Projects" />
      {error && <div className="text-red-400 mb-4">Error: {error}</div>}
      {!projects && !error && <div className="text-zinc-400 mb-4">Loading projects...</div>}
      {projects && <Carousel items={projects} />}
    </Section>
  )
}

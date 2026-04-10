import React, { useEffect, useState } from 'react'
import { Section } from '../../shared/components/Primitives'
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
      <div className="mb-10">
        <h2
          style={{
            fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            lineHeight: 1.05,
            color: 'var(--nm-text)',
            marginBottom: '1rem',
          }}
        >
          Featured Projects
        </h2>
        <div
          style={{
            height: '1px',
            width: '100%',
            background: 'linear-gradient(to right, var(--nm-accent) 0%, var(--nm-border) 40%, transparent 100%)',
          }}
        />
      </div>
      {error && <div className="text-red-400 mb-4">Error: {error}</div>}
      {!projects && !error && <div className="text-zinc-400 mb-4">Loading projects...</div>}
      {projects && <Carousel items={projects} />}
    </Section>
  )
}

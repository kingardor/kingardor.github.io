import { DATA } from '../prototype/dataAdapter.js'
import { SectionHead } from './lib/effects.jsx'

/**
 * Large editorial case rows (repos carry no imagery — type does the work).
 * Hover: ember underline sweep + description expands. Veronica leads,
 * marked LIVE, and routes into the chat.
 */
export default function ProjectsSection({ projects: propProjects }) {
  const projects = propProjects || DATA.projects
  return (
    <section className="ob-projects" id="projects" data-screen-label="04 Work">
      <div className="ob-wrap">
        <SectionHead kicker="MISSION FILES" index="003" title="Selected works." />
        <div className="ob-project-rows">
          {projects.map((p, i) => {
            const external = p.href && !p.href.startsWith('#')
            return (
              <a
                key={p.name + i}
                className="ob-project-row reveal"
                href={p.href || '#'}
                target={external ? '_blank' : undefined}
                rel={external ? 'noreferrer' : undefined}
                onClick={!p.href ? e => e.preventDefault() : undefined}
                style={{ transitionDelay: `${Math.min(i, 6) * 35}ms` }}
              >
                <span className="ob-project-idx mono-ob">
                  {String(i + 1).padStart(2, '0')}
                  {p.feature && <span className="ob-project-live"><span className="ob-live-dot" />LIVE</span>}
                </span>
                <span className="ob-project-main">
                  <span className="ob-project-name">{p.name}</span>
                  <span className="ob-project-desc">{p.desc}</span>
                </span>
                <span className="ob-project-tags mono-ob">
                  {(p.tags || []).slice(0, 4).map(t => <span key={t}>{t}</span>)}
                </span>
                <span className="ob-project-arrow" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 11L11 3M11 3H5M11 3V9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="square" />
                  </svg>
                </span>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}

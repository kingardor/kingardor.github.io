import { useEffect, useState } from 'react'
import { ArrowUp, ArrowUpRight, Play, Search } from 'lucide-react'
import {
  ARCHIVE,
  CAREER,
  PROJECTS,
  SKILLS,
  HONOURS,
  WRITING,
  VIDEOS,
  EMAIL,
  LINKS,
} from '../../content'
import { prefetched } from '../../shared/utils/prefetch'
const assets = '/work/'
const featured = PROJECTS.filter((p) => p.featured)
const project = (slug) => PROJECTS.find((p) => p.slug === slug)
// Covers: a photo of the real thing when there is one, else the first screen
const coverOf = (p) => p.images.find((i) => i.kind !== 'ui') || p.images[0]
const linkOf = (p) => p.repo || p.href
const linkLabel = (p) => {
  if (p.repo) return 'Source on GitHub'
  if (p.href?.startsWith('#')) return 'Talk to her web twin'
  return 'Visit ' + new URL(p.href).hostname
}
function LinkOut({ to, children }) {
  return (
    <a className="case-link" href={to}>
      {children} <ArrowUpRight size={18} />
    </a>
  )
}
export function PortfolioNav() {
  return (
    <nav className="portfolio-nav" aria-label="Portfolio navigation">
      <a className="brand" href="#top">
        Akash James<span>.</span>
      </a>
      <div>
        <a href="#spotlight">Work</a>
        <a href="#career">Experience</a>
        <a href="#contact">Contact</a>
        <button
          aria-label="Search portfolio"
          onClick={() => window.dispatchEvent(new CustomEvent('ob:palette'))}
        >
          <Search size={18} />
        </button>
      </div>
    </nav>
  )
}
export function ProjectGallery() {
  const [selected, setSelected] = useState(featured[0].slug)
  const item = project(selected)
  const cover = coverOf(item)
  return (
    <section id="spotlight" className="gallery">
      <header>
        <h2>
          Selected work<span>.</span>
        </h2>
        <div role="group" aria-label="Choose a project">
          {featured.map((p) => (
            <button
              key={p.slug}
              aria-pressed={selected === p.slug}
              onClick={() => setSelected(p.slug)}
            >
              {p.name}
            </button>
          ))}
        </div>
      </header>
      <div className="gallery-stage" aria-live="polite">
        <figure>
          <img loading="lazy" src={cover.src} width={cover.w} height={cover.h} alt={cover.alt} />
        </figure>
        <div className="gallery-caption">
          <span>{item.kicker}</span>
          <h3>{item.name}</h3>
          <p className="gallery-pitch">{item.pitch}</p>
          <p>{item.desc}</p>
          <dl className="gallery-facts">
            {item.facts.slice(0, 2).map((f) => (
              <div key={f.k}>
                <dt>{f.k}</dt>
                <dd>{f.v}</dd>
              </div>
            ))}
          </dl>
          <LinkOut to={linkOf(item)}>{linkLabel(item)}</LinkOut>
        </div>
      </div>
    </section>
  )
}
export function Experience() {
  return (
    <section id="career" className="experience surface">
      <div className="section-title">
        <h2>
          Experience<span>.</span>
        </h2>
      </div>
      <div className="positions">
        {CAREER.map((r) => (
          <article key={r.org + r.role}>
            <time>{r.period}</time>
            <div>
              <h3>{r.org}</h3>
              <strong>{r.role}</strong>
              <p>{r.blurb}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
export function Skills() {
  return (
    <section id="skills" className="skills surface">
      <h2>Toolkit</h2>
      <div>
        {SKILLS.groups.map((s) => (
          <article key={s.name}>
            <h3>{s.name}</h3>
            <p>{s.items.join(' · ')}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
export function Projects() {
  const item = project('hermes')
  const photo = coverOf(item)
  return (
    <section id="projects" className="projects surface">
      <h2>
        More work<span>.</span>
      </h2>
      <div className="pair">
        <article className="picture-case">
          <img loading="lazy" src={photo.src} width={photo.w} height={photo.h} alt={photo.alt} />
          <div>
            <h3>{item.name}</h3>
            <p>{item.pitch}</p>
            <LinkOut to={linkOf(item)}>Explore Hermes</LinkOut>
          </div>
        </article>
        <article className="veronica-case">
          <div className="v-art" aria-hidden="true">
            <span>V</span>
          </div>
          <div>
            <h3>Veronica</h3>
            <p>
              The agent behind this portfolio. Ask about a project, a talk, or
              how I built something.
            </p>
            <LinkOut to="#/chat">Ask Veronica</LinkOut>
          </div>
        </article>
      </div>
      <details>
        <summary>
          All projects <span>{PROJECTS.length + ARCHIVE.length}</span>
        </summary>
        {[...PROJECTS, ...ARCHIVE].map((p) => (
          <a key={p.name} href={linkOf(p) || LINKS.github}>
            <strong>{p.name}</strong>
            <small>{p.desc}</small>
            <ArrowUpRight size={18} />
          </a>
        ))}
      </details>
    </section>
  )
}
const fallbackTitles = {
  '1VQXLXshKNY': 'How Akash James approaches computer vision',
  J0fhEByPzVQ:
    'Build high-FPS object detection pipelines with NVIDIA DeepStream and Triton',
}
const fallbackVideos = VIDEOS.map((url) => {
  const id = new URL(url).searchParams.get('v')
  return { id, url, title: fallbackTitles[id] || 'Watch on YouTube' }
})

export function Talks() {
  const [videos, setVideos] = useState(fallbackVideos)
  const [playing, setPlaying] = useState(null)
  useEffect(() => {
    let mounted = true
    prefetched.youtube.then((feed) => {
      const items = feed?.items?.filter((item) => item.id && item.title)
      if (mounted && items?.length) setVideos(items)
    })
    return () => {
      mounted = false
    }
  }, [])
  function card(video) {
    const local = Object.hasOwn(fallbackTitles, video.id)
    return (
      <article key={video.id}>
        <figure>
          {playing === video.id ? (
            <iframe
              title={video.title}
              src={'https://www.youtube.com/embed/' + video.id + '?autoplay=1'}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button
              onClick={() => setPlaying(video.id)}
              aria-label={'Play ' + video.title}
            >
              <img
                alt=""
                loading="lazy"
                src={
                  local
                    ? assets + video.id + '.jpg'
                    : 'https://i.ytimg.com/vi/' + video.id + '/hqdefault.jpg'
                }
              />
              <i>
                <Play size={16} fill="currentColor" />
              </i>
            </button>
          )}
        </figure>
        <h3>
          <a href={video.url}>{video.title}</a>
        </h3>
      </article>
    )
  }
  return (
    <section id="videos" className="videos surface">
      <h2>
        Talks<span>.</span>
      </h2>
      <div>{videos.slice(0, 2).map(card)}</div>
      {videos.length > 2 && (
        <details>
          <summary>More videos</summary>
          {videos.slice(2).map((v) => (
            <a key={v.id} href={v.url}>
              {v.title}
              <ArrowUpRight size={18} />
            </a>
          ))}
        </details>
      )}
    </section>
  )
}
export function Writing() {
  return (
    <section id="writing" className="writing surface">
      <h2>
        Writing<span>.</span>
      </h2>
      <div>
        {WRITING.map((w) => (
          <a key={w.title} href={w.url}>
            {w.title}
            <ArrowUpRight size={20} />
          </a>
        ))}
        <LinkOut to={LINKS.medium}>More on Medium</LinkOut>
      </div>
    </section>
  )
}
export function Footer() {
  return (
    <>
      <section id="honours" className="honours surface">
        <h2>Recognition</h2>
        <div>
          {HONOURS.map((h) => (
            <article key={h.title}>
              <strong>{h.key}</strong>
              <p>{h.url ? <a href={h.url}>{h.title} ↗</a> : h.title}</p>
            </article>
          ))}
        </div>
      </section>
      <footer id="contact">
        <div className="footer-art">
          <div className="footer-scene">
            <img src="/footer/neon-handheld.webp" width="1672" height="941" loading="lazy"
              alt="A neon city and a handheld computer. The words “This guy makes AI look easy” point to Akash." />
            <img className="footer-portrait" src="/footer/akash.webp" width="640" height="640"
              loading="lazy" alt="Akash James in sunglasses and a black blazer" />
          </div>
        </div>
        <div className="contact surface">
          <h2>
            Get in touch<span>.</span>
          </h2>
          <LinkOut to={'mailto:' + EMAIL}>{EMAIL}</LinkOut>
          <div className="last">
            <a href={LINKS.github}>GitHub ↗</a>
            <a href={LINKS.linkedin}>LinkedIn ↗</a>
            <a href="#/chat">Ask Veronica</a>
            <a href="#top">
              Back to top <ArrowUp size={16} />
            </a>
          </div>
        </div>
      </footer>
    </>
  )
}

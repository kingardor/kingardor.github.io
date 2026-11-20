import { useEffect, useState } from 'react'
import { ArrowUp, ArrowUpRight, Play, Search } from 'lucide-react'
import {
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
const work = (id) => PROJECTS.find((project) => project.slug === id)
const assets = '/work/'
const cases = {
  hermes: {
    name: 'Hermes',
    field: 'Computer vision',
    image: 'rig.webp',
    alt: 'Tello drone and Jetson Xavier NX side by side on a workbench',
    summary:
      'A drone streams video to a Jetson Xavier NX. DeepStream and YOLO look for signs of wildfire in the feed.',
    link: 'Explore Hermes',
    project: work('hermes'),
  },
  vector: {
    name: 'Vector',
    field: 'Robotics',
    image: 'vector.webp',
    alt: 'A handheld Anki Vector robot with violet eyes',
    summary:
      'An experiment in bringing language models to Anki Vector, a palm-sized robot with a camera, tracks and a remarkably expressive face.',
    link: 'Explore Vector',
    project: work('vector'),
  },
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
  const [selected, setSelected] = useState('vector')
  const item = cases[selected]
  return (
    <section id="spotlight" className="gallery">
      <header>
        <h2>
          Selected work<span>.</span>
        </h2>
        <div role="group" aria-label="Choose a project">
          {['vector', 'hermes'].map((key) => (
            <button
              key={key}
              aria-pressed={selected === key}
              onClick={() => setSelected(key)}
            >
              {cases[key].name}
            </button>
          ))}
        </div>
      </header>
      <div className="gallery-stage" aria-live="polite">
        <figure>
          <img loading="lazy" src={assets + item.image} alt={item.alt} />
        </figure>
        <div className="gallery-caption">
          <span>{item.field}</span>
          <h3>{item.name}</h3>
          <p>{item.summary}</p>
          <LinkOut to={item.project.repo}>{item.link}</LinkOut>
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
          <article key={r.org}>
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
  const item = cases.hermes
  return (
    <section id="projects" className="projects surface">
      <h2>
        More work<span>.</span>
      </h2>
      <div className="pair">
        <article className="picture-case">
          <img loading="lazy" src={assets + item.image} alt={item.alt} />
          <div>
            <h3>{item.name}</h3>
            <p>{item.summary}</p>
            <LinkOut to={item.project.repo}>{item.link}</LinkOut>
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
          All projects <span>{PROJECTS.length}</span>
        </summary>
        {PROJECTS.map((p) => (
          <a key={p.name} href={p.href || p.repo}>
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
            <article key={h.key}>
              <strong>{h.key}</strong>
              <p>{h.url ? <a href={h.url}>{h.title} ↗</a> : h.title}</p>
            </article>
          ))}
        </div>
      </section>
      <section id="contact" className="contact surface">
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
      </section>
    </>
  )
}

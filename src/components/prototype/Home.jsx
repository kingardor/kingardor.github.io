import { useState, useEffect } from 'react';
import { Hud, Reticle } from './Hud.jsx';
import { Hero, Marquee, Manifesto } from './Hero.jsx';
import { Career, Skills, Projects, Videos, Writing, Honours, Transmission } from './Sections.jsx';
import { TopNav } from './Chrome.jsx';
import { useReveal } from './hooks.js';
import { DATA } from './dataAdapter.js';
import { fetchGithubProjects } from '../../shared/utils/fetchGithubProjects.js';

const API_BASE = 'https://veronica-proxy-vercel.vercel.app';

function toVideoItem(v, i) {
  if (typeof v === 'string') {
    const idMatch = v.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    const id = idMatch ? idMatch[1] : null;
    return {
      num: String(i + 1).padStart(2, '0'),
      title: '',
      url: v,
      thumb: id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null,
    };
  }
  const id = v.id || (v.url?.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1]);
  return {
    num: String(i + 1).padStart(2, '0'),
    title: v.title || '',
    url: v.url || null,
    thumb: id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null,
  };
}

export default function Home() {
  const [projects, setProjects] = useState(null);
  const [videos, setVideos] = useState(null);
  const [showFab, setShowFab] = useState(false);
  useReveal();

  useEffect(() => {
    const onScroll = () => setShowFab(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fetch GitHub projects
  useEffect(() => {
    fetchGithubProjects('kingardor', 6).then(repos => {
      if (!repos.length) return;
      const ghCards = repos.map((p, i) => ({
        code: `PRJ · ${String(i + 2).padStart(2, '0')}`,
        name: p.name,
        desc: p.desc,
        tags: p.tags.map(t => t.toUpperCase()),
        href: p.url,
      }));
      // Keep Veronica card pinned first
      setProjects([DATA.projects[0], ...ghCards]);
    }).catch(() => {});
  }, []);

  // Fetch YouTube feed via Veronica proxy
  useEffect(() => {
    fetch(`${API_BASE}/api/youtube-feed?d=${Date.now()}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.items?.length) {
          const items = data.items.map(toVideoItem);
          setVideos({
            featured: items[0],
            strip: items.slice(1),
          });
        }
      })
      .catch(() => {});
  }, []);

  const goChat = () => { location.hash = '/chat'; };

  return (
    <>
      <button className={`veronica-fab hot${showFab ? ' fab-visible' : ''}`} onClick={goChat} aria-label="Ask Veronica">
        <span className="veronica-fab-v">V</span>
        <span className="veronica-fab-label">ASK VERONICA</span>
      </button>
      <Reticle />
      <Hud />
      <div className="grain" />
      <TopNav onAsk={goChat} />
      <main>
        <Hero bg={{ grid: false }} accent="#ef2b3a" />
        <Marquee />
        <Manifesto />
        <Career bg={{ rain: true }} accent="#ef2b3a" />
        <Skills />
        <Projects projects={projects || undefined} />
        <Videos videos={videos || undefined} />
        <Writing />
        <Honours />
        <Transmission onAsk={goChat} bg={{ aurora: true }} accent="#ef2b3a" />
      </main>
    </>
  );
}

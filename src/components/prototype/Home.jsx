import { useState, useEffect } from 'react';
import { Hud } from './Hud.jsx';
import { Hero, Marquee } from './Hero.jsx';
import { Career, Skills, Projects, Videos, Writing, Honours, Transmission } from './Sections.jsx';
import { TopNav } from './Chrome.jsx';
import { useReveal } from './hooks.js';
import { DATA } from './dataAdapter.js';
import { prefetched } from '../../shared/utils/prefetch.js';

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
  useReveal();

  // Consume pre-fetched promises kicked off in main.jsx during the loader window
  useEffect(() => {
    prefetched.github.then(repos => {
      if (!repos.length) return;
      const ghCards = repos.map((p, i) => ({
        code: `PRJ · ${String(i + 2).padStart(2, '0')}`,
        name: p.name,
        desc: p.desc,
        tags: p.tags.map(t => t.toUpperCase()),
        href: p.url,
      }));
      setProjects([DATA.projects[0], ...ghCards]);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    prefetched.youtube.then(data => {
      if (data?.items?.length) {
        const items = data.items.map(toVideoItem);
        setVideos({ featured: items[0], strip: items.slice(1) });
      }
    }).catch(() => {});
  }, []);

  const goChat = () => { location.hash = '/chat'; };

  return (
    <>
      <Hud />
      <div className="grain" />
      <TopNav onAsk={goChat} />
      <main>
        <Hero bg={{ grid: false }} accent="#ff3d00" />
        <Marquee />
        <Career bg={{ rain: true }} accent="#ff3d00" />
        <Skills />
        <Projects projects={projects || undefined} />
        <Videos videos={videos || undefined} />
        <Writing />
        <Honours />
        <Transmission onAsk={goChat} bg={{ aurora: true }} accent="#ff3d00" />
      </main>
    </>
  );
}

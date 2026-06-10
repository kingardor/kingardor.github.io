import { useState, useEffect, lazy, Suspense } from 'react';
import TelemetryHud from '../os/TelemetryHud.jsx';
import HeroSection, { KeywordStrip } from '../sections/HeroSection.jsx';
import CareerSection from '../sections/CareerSection.jsx';
import SkillsSection from '../sections/SkillsSection.jsx';
import ProjectsSection from '../sections/ProjectsSection.jsx';
import VideosSection from '../sections/VideosSection.jsx';
import WritingSection from '../sections/WritingSection.jsx';
import HonoursSection from '../sections/HonoursSection.jsx';
import ContactSection from '../sections/ContactSection.jsx';
import { TopNav } from './Chrome.jsx';
import { useReveal } from './hooks.js';
import { DATA } from './dataAdapter.js';
import { prefetched } from '../../shared/utils/prefetch.js';
import Poster from '../monolith/Poster.jsx';
import { webglTier } from '../../shared/utils/capabilities.js';

// Heavy WebGL chunk loads post-LCP on capable devices only
const MonolithCanvas = lazy(() => import('../monolith/MonolithCanvas.jsx'));

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
  const [canvasOn, setCanvasOn] = useState(false);
  useReveal([projects, videos]);

  // Mount the monolith canvas after first paint settles (idle), never during
  // prerender / on mobile / under reduced motion (webglTier gates those).
  useEffect(() => {
    if (webglTier() === 0) return;
    const start = () => setCanvasOn(true);
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(start, { timeout: 1500 });
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(start, 200);
    return () => clearTimeout(id);
  }, []);

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
      {canvasOn
        ? <Suspense fallback={<Poster />}><MonolithCanvas /></Suspense>
        : <Poster />}
      <TelemetryHud />
      <div className="grain" />
      <TopNav onAsk={goChat} />
      <main>
        <HeroSection />
        <KeywordStrip />
        <CareerSection />
        <SkillsSection />
        <ProjectsSection projects={projects || undefined} />
        <VideosSection videos={videos || undefined} />
        <WritingSection />
        <HonoursSection />
        <ContactSection onAsk={goChat} />
      </main>
    </>
  );
}

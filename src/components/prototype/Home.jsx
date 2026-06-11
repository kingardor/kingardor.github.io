import { useState, useEffect } from 'react';
import TelemetryHud from '../os/TelemetryHud.jsx';
import GuidedTour from '../os/GuidedTour.jsx';
import HeroSection from '../sections/HeroSection.jsx';
import Marquee from '../sections/Marquee.jsx';
import StatsStrip from '../sections/StatsStrip.jsx';
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
import StoryScrub from '../story/StoryScrub.jsx';
import SectionGate from '../os/SectionGate.jsx';
import navigate from '../../shared/utils/navigate.js';

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
  useReveal([projects, videos]);

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

  const goChat = () => navigate('/chat');

  return (
    <>
      {/* Must precede the sections: its capture wheel listener has to register
          before CareerSection's chapter stepper */}
      <SectionGate />
      <StoryScrub />
      <TelemetryHud />
      <GuidedTour />
      <div className="grain" />
      <TopNav onAsk={goChat} />
      <main>
        <HeroSection />
        <Marquee />
        <StatsStrip />
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

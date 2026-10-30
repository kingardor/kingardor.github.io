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
import { prefetched } from '../../shared/utils/prefetch.js';
import SequenceCanvas from '../story/SequenceCanvas.jsx';
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
  const [videos, setVideos] = useState(null);
  useReveal([videos]);

  // Consume the feed pre-fetched in main.jsx during the loader window
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
      <SequenceCanvas />
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
        <ProjectsSection />
        <VideosSection videos={videos || undefined} />
        <WritingSection />
        <HonoursSection />
        <ContactSection onAsk={goChat} />
      </main>
    </>
  );
}

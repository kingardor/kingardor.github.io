import React, { Suspense, useEffect, useState } from 'react'
import BgFX from './shared/components/BgFX'
import { LINKS } from './data'
import useHashPath from './shared/hooks/useHashPath'
import useSiteViews from './shared/hooks/useSiteViews'
import Header from './sections/Header/Header'
import Hero from './sections/Hero/index'
import Highlights from './sections/Highlights/Highlights'
import Talks from './sections/Talks/Talks'
import About from './sections/About/About'
import Experience from './sections/Experience/Experience'
import Skills from './sections/Skills/Skills'
import Timeline from './sections/Timeline/Timeline'
import SkillsChart from './sections/Skills/SkillsChart'
import Publications from './sections/Publications/Publications'
import Honours from './sections/Honours/Honours'
import Contact from './sections/Contact/Contact'
import ChatFAB from './shared/components/ChatFAB'

const Projects = React.lazy(() => import('./sections/Projects'));
const YouTube = React.lazy(() => import('./sections/YouTube/YouTube'));
const ChatPage = React.lazy(() => import('./sections/Chat/ChatPage'));

const goChat = (prompt) => {
  const seed = (prompt || '').trim()
  if (seed) sessionStorage.setItem('chat:seed', seed)
  const q = seed ? `?q=${encodeURIComponent(seed)}` : ''
  location.hash = `/chat${q}`
}

export default function App() {
  const views = useSiteViews()
  const path = useHashPath()
  const [showFAB, setShowFAB] = useState(false);

  useEffect(() => {
    if (path.startsWith('/chat')) {
      setShowFAB(false);
      return;
    }
    const hero = document.getElementById('top');
    if (!hero) return;
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        setShowFAB(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, [path]);


  return (
    <>
      <BgFX />
      {path.startsWith('/chat') ? (
        <Suspense fallback={<div className="text-zinc-400">Loading chat...</div>}>
          <ChatPage />
        </Suspense>
      ) : (
        <>
          <main className="min-h-screen scroll-smooth font-[ui-sans-serif] text-zinc-100 antialiased">
            <Header/>
            <Hero onSubmit={goChat}/>
            <Highlights/>
            <About/>
            <Experience/>
            <Timeline/>
            <Skills/>
            <SkillsChart/>
            <Suspense fallback={<div className="text-zinc-400">Loading projects...</div>}><Projects/></Suspense>
            <Talks/>
            <Suspense fallback={<div className="text-zinc-400">Loading videos...</div>}><YouTube/></Suspense>
            <Publications/>
            <Honours/>
            <Contact/>
            <footer className="pb-8 text-center text-xs text-zinc-500">
              © {new Date().getFullYear()} Akash James • Built on Tailwind • Deployed on GitHub Pages
              <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-zinc-300 align-middle">
                {views == null ? 'visits — …' : `visits — ${views.toLocaleString()}`}
              </span>
            </footer>
          </main>
          {showFAB && (
            <ChatFAB onClick={() => { location.hash = '/chat'; }} label="ask veronica" />
          )}
        </>
      )}
    </>
  )
}

import React from 'react'

import Header from './components/Header'
import Hero from './components/Hero'
import About from './components/About'
import Highlights from './components/Highlights'
import Experience from './components/Experience'
import Skills from './components/Skills'
import Projects from './components/Projects'
import YouTube from './components/YouTube'
import Publications from './components/Publications'
import Honours from './components/Honours'
import Contact from './components/Contact'
import BgFX from './components/BgFX'
import BackToTop from './components/BackToTop'
import { LINKS } from './lib/data'

export default function App() {
  React.useEffect(() => {
    document.title = 'Akash James — AI Architect'
    const upsert = (sel, create) => { let el = document.head.querySelector(sel); if (!el) { el = create(); document.head.appendChild(el) } return el }
    const setMeta = (key, value, attr = 'name') => { const el = upsert(`meta[${attr}="${key}"]`, () => { const m = document.createElement('meta'); m.setAttribute(attr, key); return m }); el.setAttribute('content', value) }

    setMeta('description', 'Founding AI Architect building agentic, video-first data lakes; ex-UC Berkeley Research Scholar; Z by HP Ambassador; NVIDIA Jetson AI Lab member.')
    setMeta('og:title', 'Akash James — AI Architect', 'property')
    setMeta('og:description', 'Agentic AI • Multimodal • RAG • Edge/Video AI')
    setMeta('og:type', 'website', 'property')
    setMeta('og:image', '/hero.jpg', 'property')
    setMeta('og:url', window.location.href, 'property')
    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', 'Akash James — AI Architect')
    setMeta('twitter:description', 'Agentic AI • Multimodal • RAG • Edge/Video AI')
    setMeta('twitter:image', '/hero.jpg')
    upsert('link[rel="canonical"]', () => { const l = document.createElement('link'); l.setAttribute('rel','canonical'); return l }).setAttribute('href', window.location.href)

    const ld = upsert('script[type="application/ld+json"]', () => { const s = document.createElement('script'); s.type = 'application/ld+json'; return s })
    ld.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Akash James',
      url: window.location.href,
      sameAs: [LINKS.github, LINKS.medium, LINKS.twitter, LINKS.instagram],
      jobTitle: 'AI Architect'
    })
  }, [])
  return (
  <main className="min-h-screen scroll-smooth font-[ui-sans-serif] text-zinc-100 antialiased">
      <BgFX/>
      <Header/>
      <Hero/>
      <About/>
      <Highlights/>
      <Experience/>
      <Skills/>
      <Projects/>
      <YouTube/>
      <Publications/>
      <Honours/>
      <Contact/>
      <BackToTop />
      <footer className="pb-8 text-center text-xs text-zinc-500">© {new Date().getFullYear()} Akash James • Built on Tailwind • Deployed on GitHub Pages</footer>
    </main>
  )
}

import React from 'react'
import BgFX from './components/BgFX'
import { LINKS } from './data'
import useHashPath from './hooks/useHashPath'
import useSiteViews from './hooks/useSiteViews'
import Header from './sections/Header'
import Hero from './sections/Hero'
import Highlights from './sections/Highlights'
import About from './sections/About'
import Experience from './sections/Experience'
import Skills from './sections/Skills'
import Projects from './sections/Projects'
import YouTube from './sections/YouTube'
import Publications from './sections/Publications'
import Honours from './sections/Honours'
import Contact from './sections/Contact'
import ChatPage from './sections/Chat/ChatPage'

const goChat = (prompt) => {
  const seed = (prompt || '').trim()
  if (seed) sessionStorage.setItem('chat:seed', seed)
  const q = seed ? `?q=${encodeURIComponent(seed)}` : ''
  location.hash = `/chat${q}`
}

export default function App() {
  const views = useSiteViews()
  const path = useHashPath()

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

  if (path.startsWith('/chat')) return <ChatPage />

  return (
    <main className="min-h-screen scroll-smooth font-[ui-sans-serif] text-zinc-100 antialiased">
      <BgFX/>
      <Header/>
      <Hero onSubmit={goChat}/>
      <Highlights/>
      <About/>
      <Experience/>
      <Skills/>
      <Projects/>
      <YouTube/>
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
  )
}

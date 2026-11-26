import { useRef, useEffect } from 'react'
import GuidedTour from '../os/GuidedTour'
import FilmStage from '../portrait/FilmStage'
import HeroSection from '../sections/HeroSection'
import {
  PortfolioNav,
  ProjectGallery,
  Experience,
  Skills,
  Projects,
  Talks,
  Writing,
  Footer,
} from './PortfolioSections'
import './portfolio.css'
export default function Home() {
  const readingPane = useRef(null)
  useEffect(() => {
    const root = document.documentElement
    const update = () => {
      const panelTop = readingPane.current.getBoundingClientRect().top
      const height = window.innerHeight
      const progress = Math.min(1, Math.max(0, 1 - panelTop / height))
      root.style.setProperty('--film-progress', String(progress))
      // Start panning only once the reading pane covers the film's right edge.
      const pan = Math.min(1, Math.max(0, -panelTop / (height * 0.5)))
      root.style.setProperty('--pan-progress', String(pan * pan * (3 - 2 * pan)))
      root.classList.toggle('reading-film', panelTop <= 0)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      root.style.removeProperty('--film-progress')
      root.style.removeProperty('--pan-progress')
      root.classList.remove('reading-film')
    }
  }, [])

  return (
    <>
      <FilmStage />
      <GuidedTour />
      <main>
        <HeroSection />
        <div className="portfolio" ref={readingPane}>
          <PortfolioNav />
          <ProjectGallery />
          <Experience />
          <Skills />
          <Projects />
          <Talks />
          <Writing />
          <Footer />
        </div>
      </main>
    </>
  )
}

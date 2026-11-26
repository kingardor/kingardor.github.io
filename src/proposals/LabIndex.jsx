import { ArrowUpRight } from 'lucide-react'
import useLoaderRelease from './shared/useLoaderRelease.js'
import LazyBench from '../anatomy/LazyBench.jsx'
import './lab.css'

// The /lab hub: three proposals, the ideas killed on the way, and the pick.

const KILLED = [
  ['Cyberpunk HUD', 'Cyan brackets, hex grids and scanlines: every “AI” landing page since 2077. It also fights the ember film.'],
  ['Fake OS desktop', 'Draggable windows and a taskbar. PostHog did it properly; a hundred Win95 clones did it badly. Says nothing about him.'],
  ['Terminal portfolio', '`> whoami`. The most generic developer portfolio ever made.'],
  ['Bento grid', 'Apple keynote leftovers. Rounded boxes in a grid are a template, not an idea.'],
  ['Neo-brutalism', 'The design tool’s own first pick: cream, thick borders, hard shadows, Inter, blue. Light-first kills the film.'],
  ['Classified dossier', 'Redacted bars and red stamps now ship as a component library. Commodity.'],
  ['3D room / driving game', 'Henry Heffernan and Bruno Simon own those, and they cost seconds of load for one trick.'],
  ['Twitch stream overlay', 'Tempting (facecam, chat, alerts), but the jokes date in a month and undercut a Director of AI.'],
  ['Tabloid front page', 'Great headlines, but print is static. Kept its loudness, dropped the format.'],
  ['Ember on black, with grain', 'The current look. Killian Herzer and half of Awwwards wear it. The film is unique; the wrapper isn’t.'],
]

const RECEIPTS = [
  ['BLUE, in detail', 'Founding Director of AI since Mar 2025 (stealth until Feb 2026): Hyper Memory, BLUE Agent, Helyx and Mendel-James, BLUE Copilot, BLUE Mini Edge, vLLM down to Jetson Thor.'],
  ['Roles the site never had', 'CopCars.in founder, Sentics sensor fusion (30,000+ points/s), Z by HP ambassador 2023–25, NVIDIA Jetson ambassador 2021–25, IoT & ML engineer 2018–20, iB Hubs 2017.'],
  ['Stages', 'GTC 2025 HP session, two GTC 2024 booth demos, the Boost webinar, Comet’s show, TFUG Coimbatore, Aura8 panel, MIT ADT workshop, India AI Impact Summit.'],
  ['Wins', 'NASA Space Apps 2019 and 2020, Employee of the Year 2019, Top 10 Smart India Hackathon, Best Paper REVA ’18.'],
  ['Eight projects, measured', 'Noir’s 883 tests, Vector’s 98.0%, Q-Pocket’s 180 ms, Hermes’ 67 stars: numbers straight from each README, plus 11 archive builds.'],
]

// Settled with Akash on 26 Nov 2026.
const DECIDED = [
  'Screenshots from the private repos (Veronica’s HUD, CopCars brand art) are published. No code, no repo links.',
  'UC Berkeley reads 2023–24 everywhere.',
  '“50+ models shipped” stays, as your own figure.',
]

const PROPOSALS = [
  {
    slug: 'subject',
    code: 'A',
    name: 'Subject 001',
    line: 'The site is a vision model. It watches him, then it watches you.',
    why: 'His job is teaching cameras to see and remember. So the page is inference output over his film: detection boxes, a self-building identity graph, a search over moments, and at the end a cited write-up of your own visit.',
    moves: ['Ghost boxes collapse onto his face, and his name lands as the class label', 'Your cursor is tracked as subject 0412', 'Projects as case-file sightings with boxes on every image', '“Deep Scan: your visit”: a diary of what you looked at, with citations'],
    risk: 'Surveillance menace can read cold; it lives or dies on the copy and the restraint of the boxes.',
  },
  {
    slug: 'mint',
    code: 'B',
    name: 'Mint in Box',
    line: 'Akash James, AI architect action figure. 1:1 scale. Batteries not included.',
    why: 'He founded a diecast store and builds palm-sized machines. Packaging is the most shameless bragging format there is: starbursts, “NEW!”, “INCLUDES”, “collect them all”.',
    moves: ['The hero is a blister pack with the film inside; scroll and he comes out of the box', 'Projects hang on a pegboard: pick one up, flip it, tear it open', 'Open all eight and a gold chase variant appears', 'Career as a graded slab; contact as a shipping label'],
    risk: 'One cheap texture and it becomes a toy shop. It needs real lighting, glare and print detail everywhere.',
  },
  {
    slug: 'versus',
    code: 'C',
    name: 'Versus',
    line: 'Player 1: Akash James. Class: AI architect. Difficulty: unfair.',
    why: 'A gamer whose robots trash-talk people. Fighting-game menus are bragging by design: stats, titles, taunts, ratings, and his career even has an acquisition finisher.',
    moves: ['Title-screen slam over the pixel hero', 'Scroll speed fills a combo counter', 'Projects as a character-select roster with VS screens', 'The film’s acts fire super cut-ins; contact is a continue countdown'],
    risk: 'The loudest of the three. Some recruiters will love it; some won’t get past the title screen.',
  },
]

export default function LabIndex() {
  useLoaderRelease('600 1rem "Clash Display"')
  return (
    <main className="lab-hub">
      <header className="lab-hub-head">
        <p className="lab-kicker">akashjames.com · lab · 26 Nov 2026</p>
        <h1>Three ways to be<br />impossible to forget.</h1>
        <p className="lab-lede">
          Each proposal is a working homepage, not a mockup. All three run on the same rewritten content
          (LinkedIn, eight project READMEs, the YouTube channel and Medium) and keep the two things that
          are already his: the pixel-assembled selfie and the cyborg film.
        </p>
      </header>

      <section className="lab-proposals" aria-label="Proposals">
        {PROPOSALS.map(p => (
          <article key={p.slug} className={`lab-card lab-card-${p.slug}`}>
            <a className="lab-shot" href={`#/lab/${p.slug}`} aria-label={`Open ${p.name}`}>
              <img src={`/lab/previews/${p.slug}-desktop.webp`} alt="" loading="lazy" width="1440" height="900"
                onError={e => { e.currentTarget.style.visibility = 'hidden' }} />
              <img className="lab-shot-phone" src={`/lab/previews/${p.slug}-phone.webp`} alt="" loading="lazy" width="390" height="844"
                onError={e => { e.currentTarget.style.display = 'none' }} />
            </a>
            <div className="lab-card-body">
              <p className="lab-code">Proposal {p.code}</p>
              <h2>{p.name}</h2>
              <p className="lab-line">{p.line}</p>
              <p>{p.why}</p>
              <ul>{p.moves.map(m => <li key={m}>{m}</li>)}</ul>
              <p className="lab-risk"><strong>Risk.</strong> {p.risk}</p>
              <a className="lab-open" href={`#/lab/${p.slug}`}>Open {p.name} <ArrowUpRight size={18} /></a>
            </div>
          </article>
        ))}
      </section>

      <section className="lab-pick" aria-labelledby="lab-pick-title">
        <p className="lab-kicker">The verdict</p>
        <h2 id="lab-pick-title">My pick: Subject 001.</h2>
        <p className="lab-lede">
          It’s the only one where the gimmick is the job. Cameras that remember is what he sells at BLUE, and the page proves
          it on the visitor: it watches, it remembers, and it hands you a cited write-up of your own visit. That ending is the
          screenshot people send around, and it still reads as a Director of AI rather than a toy.
        </p>
        <ul className="lab-pick-notes">
          <li><strong>Subject 001.</strong> Best concept, best copy, most credible. Weakest point: it’s dense. The graph and the class list reward people who read; skimmers only get the boxes.</li>
          <li><strong>Mint in Box.</strong> The most shareable first five seconds and the most fun to touch. Weakest point: a toy is a toy, and the packaging chrome sits between you and the work.</li>
          <li><strong>Versus.</strong> The single loudest moment of the three (the VS screen). Weakest point: the joke is front-loaded and the genre tires by section six.</li>
        </ul>
        <p className="lab-lede">Whichever you pick, the content, film, pixel hero and the bench are already wired into it.</p>
      </section>

      <section className="lab-killed" aria-labelledby="lab-killed-title">
        <h2 id="lab-killed-title">Killed in review</h2>
        <p className="lab-lede">First instincts, and why each one died before it got a line of code.</p>
        <ol>
          {KILLED.map(([name, why]) => (
            <li key={name}><s>{name}</s><span>{why}</span></li>
          ))}
        </ol>
      </section>

      <section className="lab-receipts" aria-labelledby="lab-receipts-title">
        <h2 id="lab-receipts-title">Receipts</h2>
        <p className="lab-lede">The content was rebuilt from your LinkedIn, the READMEs, the YouTube feed and Medium. Every number has a source.</p>
        <dl>
          {RECEIPTS.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
        </dl>
        <h3>Decided</h3>
        <ul>{DECIDED.map(q => <li key={q}>{q}</li>)}</ul>
      </section>

      <section className="lab-extra">
        <h2>Also on the bench</h2>
        <p className="lab-lede">An isometric anatomy of his workbench: his robots, boards and the mug Noir keeps spotting. Labels only. Hover a thing, or let it tour itself.</p>
        <LazyBench className="lab-bench" />
        <a className="lab-open" href="#/lab/bench">Open it full screen <ArrowUpRight size={18} /></a>
      </section>

      <footer className="lab-foot">
        <a href="#/">← The current site</a>
        <a href="#/chat">Ask Veronica</a>
      </footer>
    </main>
  )
}

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, Mail, ExternalLink, Award, BookOpen, FileCode2, Cpu,
  Brain, Camera, Sparkles, ShieldCheck, GraduationCap, BadgeCheck,
  ChevronLeft, ChevronRight, WandSparkles
} from 'lucide-react'
import * as si from 'simple-icons'
import { Counter } from 'counterapi';
import {
  COUNTER, LINKS, HIGHLIGHTS, NOW_ROLES, PAST_ROLES, PROJECTS, HONOURS,
  TITLES, YT_VIDEOS, SECTION_LINKS, MEDIUM_POSTS
} from './data'

const cn = (...c) => c.filter(Boolean).join(' ')
const Section = ({ id, className, children }) => (
  <section id={id} className={cn("relative mx-auto w-full max-w-6xl scroll-mt-28 px-4 sm:px-6 md:px-8", className)}>
    {children}
  </section>
)
const K = ({ children }) => <span className="text-zinc-200/90">{children}</span>

const BgFX = () => (
  <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-[#0b0b0e] via-[#0b0b0e] to-[#0b1220]"/>
    <div className="absolute -right-1/4 top-[-20%] h-[80vh] w-[80vw] rounded-full bg-[conic-gradient(at_70%_30%,rgba(239,68,68,0.25),rgba(190,18,60,0.22),rgba(168,85,247,0.20),rgba(239,68,68,0.25))] blur-3xl"/>
    <div className="absolute -left-1/3 bottom-[-20%] h-[70vh] w-[70vw] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(127,29,29,0.22),transparent_60%)] blur-3xl"/>
    <div className="absolute inset-0 bg-[linear-gradient(transparent_95%,rgba(255,255,255,0.05)_95%)] bg-[length:100%_4px] mix-blend-overlay opacity-30"/>
  </div>
)

const Pill = ({ children, className }) => (
  <span className={cn("inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200 backdrop-blur", className)}>
    {children}
  </span>
)

const A = ({ href, children, className }) => {
  const isInternal = typeof href === 'string' && href.startsWith('#')
  return (
    <a
      href={href}
      {...(isInternal ? {} : { target: '_blank', rel: 'noreferrer' })}
      className={cn('group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-100 transition hover:translate-y-[-1px] hover:bg-white/10', className)}
    >
      {children}
      {!isInternal && <ExternalLink className="h-4 w-4 opacity-70 transition group-hover:translate-x-0.5"/>}
    </a>
  )
}

const BrandIcon = ({ icon, className }) => (
  <svg className={cn('h-4 w-4', className)} role="img" viewBox="0 0 24 24" aria-hidden="true">
    <path d={icon?.path} fill="currentColor" />
  </svg>
)

// BADGES kept here (contains JSX icons)
const BADGES = [
  { icon: <WandSparkles className="h-4 w-4"/>, label: 'Generative AI Builder' },
  { icon: <ShieldCheck className="h-4 w-4"/>, label: 'Z by HP Global Data Science Ambassador' },
  { icon: <Cpu className="h-4 w-4"/>, label: 'NVIDIA Jetson AI Ambassador' },
  { icon: <BadgeCheck className="h-4 w-4"/>, label: 'Jetson AI Research Lab Member' },
]

// SKILLS kept here (contains JSX icons)
const SKILLS = [
  { icon: <Brain className="h-4 w-4"/>, name: 'Generative AI', items: ['qLoRA','SFT','DPO','Prompt/Routing','Agents'] },
  { icon: <Camera className="h-4 w-4"/>, name: 'Multimodal', items: ['Vision-Language','Video QA','Re-ID','Tracking'] },
  { icon: <FileCode2 className="h-4 w-4"/>, name: 'RAG / Retrieval', items: ['Hybrid sparse+dense','GraphRAG','Qdrant','Re-rank','Dedup/Cluster'] },
  { icon: <Cpu className="h-4 w-4"/>, name: 'Acceleration', items: ['DeepStream','TensorRT','CUDA','Triton'] },
]

// Scroll spy: returns active section id (without #)
const useScrollSpy = (hashes, offset = 160) => {
  const [active, setActive] = React.useState(hashes[0]?.slice(1) || '')
  React.useEffect(() => {
    const ids = hashes.map((h) => h.slice(1))
    const handler = () => {
      const y = window.scrollY + offset
      let cur = ids[0]
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && y >= el.offsetTop) cur = id
      }
      setActive(cur)
    }
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    window.addEventListener('resize', handler)
    return () => { window.removeEventListener('scroll', handler); window.removeEventListener('resize', handler) }
  }, [hashes, offset])
  return active
}

const useIsMobile = (bp = 768) => {
  const [m, setM] = React.useState(false)
  React.useEffect(() => {
    const q = window.matchMedia(`(max-width:${bp - 1}px)`)
    const up = () => setM(q.matches)
    up(); q.addEventListener('change', up)
    return () => q.removeEventListener('change', up)
  }, [bp])
  return m
}

const useAutoHideHeader = () => {
  const [hidden, setHidden] = React.useState(false)
  React.useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      const down = y > last && y > 80
      setHidden(down)
      last = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return hidden
}

const useHasScrolled = (threshold = 40) => {
  const [scrolled, setScrolled] = React.useState(false)
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])
  return scrolled
}

const ScrollDown = () => {
  const hide = useHasScrolled(40) // tweak threshold if you want

  return (
    <AnimatePresence>
      {!hide && (
        <motion.a
          href="#highlights"
          aria-label="Scroll to highlights"
          className="group absolute inset-x-0 bottom-6 z-20 flex justify-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.25 }}
        >
          <div className="relative">
            <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-fuchsia-500/30 via-pink-500/30 to-rose-500/30 blur-lg opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative flex flex-col items-center gap-2">
              <div className="h-9 w-5 rounded-full border border-white/25 bg-white/5 backdrop-blur-sm flex items-start justify-center overflow-hidden">
                <motion.span
                  initial={{ opacity: 0, y: 2 }}
                  animate={{ opacity: [0, 1, 1, 0], y: [2, 2, 18, 18] }}
                  transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 0.4 }}
                  className="mt-1 h-1.5 w-1.5 rounded-full bg-white/90"
                />
              </div>
              <span className="text-xs font-medium text-zinc-300/80 group-hover:text-zinc-100">Scroll</span>
            </div>
          </div>
        </motion.a>
      )}
    </AnimatePresence>
  )
}

const useSiteViews = () => {
  const [views, setViews] = React.useState(null);
  React.useEffect(() => {
    let mounted = true;
    const onceKey = `counterapi:${COUNTER.workspace}:${COUNTER.counter}:hit`;
    const shouldHit = !sessionStorage.getItem(onceKey);

    const client = new Counter({
      workspace: COUNTER.workspace,
      timeout: 5000,
    });

    (async () => {
      try {
        const res = shouldHit
          ? await client.up(COUNTER.counter)
          : await client.get(COUNTER.counter);

        const v =
          res?.data?.up_count ??
          res?.value ??
          null;

        if (shouldHit) sessionStorage.setItem(onceKey, '1');
        if (mounted && v != null) setViews(v);
      } catch (e) {
        console.error('CounterAPI error:', e);
      }
    })();

    return () => { mounted = false; };
  }, []);
  return views;
};

const Header = () => {
  const active = useScrollSpy(SECTION_LINKS.map((s) => s.href), 160)
  const isMobile = useIsMobile()
  const hidden = useAutoHideHeader()

  return (
    <header
      className="fixed top-4 left-0 right-0 z-50"
      style={{ transform: hidden && isMobile ? 'translateY(-140%)' : 'translateY(0)', transition: 'transform .25s ease' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="relative rounded-2xl border border-white/10 bg-black/40 backdrop-blur overflow-hidden">
          <div className="relative flex items-center px-3 sm:px-4 py-3">
            <a href="#top" className="font-semibold tracking-wide text-zinc-100">AJ</a>
            <nav className="pointer-events-auto absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:flex items-center gap-1 rounded-xl border border-white/10 bg-black/30 p-1">
              {SECTION_LINKS.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  className={cn(
                    'rounded-lg px-2.5 py-1.5 text-[13px]',
                    active === s.href.slice(1)
                      ? 'text-zinc-100 bg-white/10'
                      : 'text-zinc-300 hover:text-zinc-100 hover:bg-white/10'
                  )}
                >
                  {s.label}
                </a>
              ))}
            </nav>
            <nav className="ml-auto flex items-center gap-2 sm:gap-3">
              <SocialButton href={LINKS.medium} icon={si.siMedium} label="Medium" />
              <SocialButton href={LINKS.github} icon={si.siGithub} label="GitHub" />
              <SocialButton href={LINKS.twitter} icon={si.siX} label="X" />
              <SocialButton href={LINKS.instagram} icon={si.siInstagram} label="Instagram" />
              <a href={LINKS.email} className="group hidden rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-200 hover:bg-white/10 sm:inline-flex"><Mail className="h-4 w-4"/></a>
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}

const Hero = () => {
  const [idx, setIdx] = React.useState(0)
  React.useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % TITLES.length), 2800)
    return () => clearInterval(t)
  }, [])

  return (
    <section id="top" className="relative h-[100svh] w-full overflow-hidden">
      <img src="/hero.jpg" alt="Akash James" className="absolute inset-0 h-full w-full object-cover brightness-[.65] saturate-90" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/55 to-black/80"/>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(2,6,23,0.2),transparent_55%)]"/>

      <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col items-center justify-center px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-balance text-4xl font-extrabold tracking-tight text-zinc-50 sm:text-6xl md:text-7xl"
        >
          Akash <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-fuchsia-400 to-red-400">James</span>
        </motion.h1>

        <div className="mt-4 h-8 sm:h-9">
          <AnimatePresence mode="wait">
            <motion.p
              key={idx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35 }}
              className="text-sm font-medium text-zinc-300 sm:text-base"
            >
              {TITLES[idx]}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {BADGES.map((b, i) => (
            <Pill key={i}>
              {b.icon}
              {b.label}
            </Pill>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <A href="#projects">See work <ArrowRight className="h-4 w-4"/></A>
          <A href="#contact" className="border-fuchsia-500/40 bg-fuchsia-500/10 hover:bg-fuchsia-500/20">Contact</A>
        </div>
      </div>
      <ScrollDown />
    </section>
  )
}

const PopCard = ({ kpi, title, sub, gradient }) => (
  <motion.div
    whileHover={{ y: -6, scale: 1.02 }}
    transition={{ type: 'spring', stiffness: 220, damping: 18 }}
    className="relative group"
  >
    {/* Glow border */}
    <div
      aria-hidden
      className={`absolute -inset-[1.5px] rounded-2xl bg-gradient-to-br ${gradient} opacity-80 blur-sm transition-opacity group-hover:opacity-100`}
    />
    {/* Inner card */}
    <div className="relative rounded-2xl border border-white/10 bg-zinc-900/60 p-5 sm:p-6 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
      <div className="text-4xl font-extrabold tracking-tight text-zinc-50">{kpi}</div>
      <div className="mt-1 text-base font-medium text-zinc-100">{title}</div>
      {sub ? <div className="mt-1 text-sm text-zinc-400">{sub}</div> : null}
    </div>
  </motion.div>
)

const Highlights = () => {
  const gradients = [
    'from-fuchsia-500 via-pink-500 to-rose-500',
    'from-amber-400 via-orange-500 to-rose-500',
    'from-sky-400 via-indigo-500 to-fuchsia-500',
    'from-emerald-400 via-teal-500 to-cyan-500',
  ]
  return (
    <Section id="highlights" className="pt-12">
      {/* no visible title per requirement */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {HIGHLIGHTS.map((h, i) => (
          <PopCard
            key={h.title}
            kpi={h.kpi}
            title={h.title}
            sub={h.sub}
            gradient={gradients[i % gradients.length]}
          />
        ))}
      </div>
    </Section>
  )
}

const About = () => (
  <Section id="about" className="pt-12">
    <div className="mb-6 flex items-center gap-3">
      <Sparkles className="h-5 w-5 text-zinc-300"/>
      <h2 className="text-xl font-semibold text-zinc-100">About</h2>
    </div>

    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
      <div className="pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(60%_60%_at_50%_50%,#000,transparent)]">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:40px_1px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:1px_40px]" />
      </div>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-pretty text-lg leading-7 text-zinc-300 sm:text-xl sm:leading-8"
      >
        I architect and ship <K>agentic AI</K> systems that actually launch—<K>video-first data lakes</K>, retrieval engines, and <K>fine-tuned LLMs</K>. Former research scholar at <K>UC Berkeley</K>; <K>Z by HP Global Data Science Ambassador</K>; and <K>NVIDIA Jetson AI Research Lab</K> member. If it runs on GPUs or edge silicon, I squeeze more out of it.
      </motion.p>

      <div className="relative z-10 mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-black/30 p-3">
          <div className="text-xs uppercase tracking-wide text-zinc-400">Focus</div>
          <div className="mt-1 font-medium text-zinc-100">Agentic systems • Multimodal • RAG</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/30 p-3">
          <div className="text-xs uppercase tracking-wide text-zinc-400">Tooling</div>
          <div className="mt-1 font-medium text-zinc-100">qLoRA • SFT • DPO • Qdrant • DeepStream</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/30 p-3">
          <div className="text-xs uppercase tracking-wide text-zinc-400">Vibe</div>
          <div className="mt-1 font-medium text-zinc-100">Outlaw energy. Production over slides.</div>
        </div>
      </div>

      <div className="relative z-10 mt-6 flex flex-wrap items-center gap-2">
        <span className="text-sm text-zinc-400">Currently:</span>
        <motion.span
          className="text-sm font-semibold text-transparent bg-clip-text"
          style={{ backgroundImage: 'linear-gradient(90deg,#fb7185, #f472b6, #ef4444)', backgroundSize: '200% 100%' }}
          animate={{ backgroundPosition: ['0% 50%','100% 50%'] }}
          transition={{ duration: 6, repeat: Infinity, repeatType: 'mirror' }}
        >
          Founding AI Architect — Stealth (video data lake with agentic capabilities)
        </motion.span>
      </div>
    </div>
  </Section>
)

const RoleCard = ({ r }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
    <div className="flex items-center justify-between">
      <div className="text-zinc-200 font-semibold">{r.title}</div>
      <div className="text-xs text-zinc-400">{r.period}</div>
    </div>
    <div className="text-sm text-zinc-400">{r.org}</div>
    <p className="mt-2 text-sm text-zinc-300/90">{r.blurb}</p>
    <div className="mt-3 flex flex-wrap gap-2">
      {r.tags?.map((t) => (
        <Pill key={t} className="bg-black/40">{t}</Pill>
      ))}
    </div>
  </div>
)

const Experience = () => (
  <Section id="experience" className="pt-12">
    <div className="mb-6 flex items-center gap-3">
      <GraduationCap className="h-5 w-5 text-zinc-300"/>
      <h2 className="text-xl font-semibold text-zinc-100">Experience</h2>
    </div>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {NOW_ROLES.map((r) => <RoleCard key={r.title} r={r}/>) }
      {PAST_ROLES.map((r) => <RoleCard key={r.title} r={r}/>) }
    </div>
  </Section>
)

const SkillTile = ({ s }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
    <div className="mb-2 flex items-center gap-2 text-zinc-100">
      {s.icon}
      <span className="font-medium">{s.name}</span>
    </div>
    <div className="text-sm text-zinc-400">{s.items.join(' • ')}</div>
  </div>
)

const Skills = () => (
  <Section id="skills" className="pt-12">
    <div className="mb-6 flex items-center gap-3">
      <Cpu className="h-5 w-5 text-zinc-300"/>
      <h2 className="text-xl font-semibold text-zinc-100">Skills</h2>
    </div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {SKILLS.map((s) => <SkillTile key={s.name} s={s}/>) }
    </div>
  </Section>
)

const ProjectSlide = ({ p, isDraggingRef }) => (
  <div className="min-w-full p-3 sm:p-4 md:p-6">
    <a
      href={p.url}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => { if (isDraggingRef?.current) e.preventDefault(); }}
      className="group block h-full rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.03] p-6 md:p-8 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
    >
      <div className="flex items-center justify-between">
        <div className="font-medium text-zinc-100">{p.name}</div>
        <ArrowRight className="h-4 w-4 text-zinc-400 transition-transform group-hover:translate-x-1"/>
      </div>
      <p className="mt-2 text-sm text-zinc-300/90">{p.desc}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {p.tags?.map((t) => (
          <Pill key={t} className="bg-black/40">{t}</Pill>
        ))}
      </div>
      <div className="mt-4 inline-flex items-center gap-2 text-sm text-zinc-200 opacity-80 group-hover:opacity-100">
        <span>Open</span>
        <ExternalLink className="h-4 w-4"/>
      </div>
    </a>
  </div>
)

const Carousel = ({ items }) => {
  const [i, setI] = React.useState(0)
  const [paused, setPaused] = React.useState(false)
  const count = items.length
  const go = (d) => setI((prev) => (prev + d + count) % count)

  const dragging = React.useRef(false)
  const wheelState = React.useRef({ acc: 0, last: 0 })

  React.useEffect(() => {
    if (paused) return
    const t = setInterval(() => go(1), 6500)
    return () => clearInterval(t)
  }, [count, paused])

  const onWheel = (e) => {
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
    const now = performance.now()
    const THRESH = 320
    const COOLDOWN = 700
    const st = wheelState.current
    st.acc += e.deltaY
    if (Math.abs(st.acc) > THRESH && (now - st.last) > COOLDOWN) {
      e.preventDefault()
      go(st.acc > 0 ? 1 : -1)
      st.acc = 0
      st.last = now
    }
  }

  return (
    <div
      className="relative px-6 sm:px-8 md:px-10"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'ArrowLeft') go(-1); if (e.key === 'ArrowRight') go(1) }}
      onWheel={onWheel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <motion.div
          className="flex"
          animate={{ x: `-${i * 100}%` }}
          transition={{ type: 'spring', stiffness: 80, damping: 16 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.18}
          onDragStart={() => { dragging.current = true; setPaused(true) }}
          onDragEnd={(e, info) => {
            const { offset, velocity } = info
            const PX = 120
            const VX = 800
            if (offset.x < -PX || velocity.x < -VX) go(1)
            else if (offset.x > PX || velocity.x > VX) go(-1)
            setTimeout(() => { dragging.current = false; setPaused(false) }, 120)
          }}
        >
          {items.map((p) => (
            <ProjectSlide key={p.name} p={p} isDraggingRef={dragging} />
          ))}
        </motion.div>
      </div>

      <button onClick={() => go(-1)} className="absolute left-1.5 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/50 p-2 backdrop-blur hover:bg-black/70">
        <ChevronLeft className="h-5 w-5"/>
      </button>
      <button onClick={() => go(1)} className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/50 p-2 backdrop-blur hover:bg-black/70">
        <ChevronRight className="h-5 w-5"/>
      </button>

      <div className="pointer-events-none absolute inset-x-0 bottom-3 md:bottom-4 flex items-center justify-center gap-1.5">
        {items.map((_, idx) => (
          <span key={idx} className={cn("h-1 w-3 rounded-full", idx === i ? 'bg-zinc-200' : 'bg-zinc-600/50')} />
        ))}
      </div>
    </div>
  )
}

const Projects = () => (
  <Section id="projects" className="pt-12">
    <div className="mb-6 flex items-center gap-3">
      <FileCode2 className="h-5 w-5 text-zinc-300"/>
      <h2 className="text-xl font-semibold text-zinc-100">Featured Projects</h2>
    </div>
    <Carousel items={PROJECTS} />
  </Section>
)

const SocialButton = ({ href, icon, label }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    style={{ '--brand': icon ? `#${icon.hex}` : undefined }}
    className="group rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-200 hover:bg-white/10 hover:text-[var(--brand)]"
  >
    <BrandIcon icon={icon} />
    <span className="sr-only">{label}</span>
  </a>
)

// ------- YouTube helpers/cards (no Jina; no cross-origin fetch) --------
const getYTid = (u) => { try { const url = new URL(u); return url.searchParams.get('v') || url.pathname.split('/').pop() } catch { return '' } }
const ytThumb = (u) => {
  const id = getYTid(u)
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : ''
}

const ExternalVideoCard = ({ url, title }) => {
  const domain = (() => { try { return new URL(url).hostname.replace(/^www\./,'') } catch { return url } })()
  const thumb = /youtube\.com|youtu\.be/.test(domain) ? ytThumb(url) : ''
  return (
    <a href={url} target="_blank" rel="noreferrer" className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10">
      <div className="aspect-video w-full bg-black/40">
        {thumb ? <img src={thumb} alt="" className="h-full w-full object-cover"/> : <div className="flex h-full w-full items-center justify-center text-zinc-400">Preview</div>}
      </div>
      <div className="p-4">
        <div className="text-xs text-zinc-400">{domain}</div>
        <div className="mt-1 font-medium text-zinc-100">{title}</div>
        <div className="mt-3 inline-flex items-center gap-2 text-sm text-zinc-200 opacity-80 group-hover:opacity-100"><span>Watch</span><ExternalLink className="h-4 w-4"/></div>
      </div>
    </a>
  )
}

const YouTube = () => (
  <Section id="videos" className="pt-12">
    <div className="mb-6 flex items-center gap-3">
      <BookOpen className="h-5 w-5 text-zinc-300"/>
      <h2 className="text-xl font-semibold text-zinc-100">Talks & Videos</h2>
    </div>
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {YT_VIDEOS.map((u) => {
        const id = getYTid(u)
        return (
          <div key={u} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <div className="aspect-video w-full">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${id}`}
                title="YouTube video"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        )
      })}
      <ExternalVideoCard url="https://www.nvidia.com/en-us/on-demand/session/gtc25-s74465/" title="NVIDIA GTC 2025 — Session S74465" />
    </div>
  </Section>
)

// ---------------- Writing (no Jina; static list only) -------------------
const isLikelyMediumPost = (u) => {
  try {
    const url = new URL(u)
    const h = url.hostname
    const p = url.pathname
    const hostOK = h === 'akash-james.medium.com' || h.endsWith('.medium.com') || h === 'medium.com'
    const pathOK = p.includes('/@akash-james/') || h === 'akash-james.medium.com' || p.startsWith('/p/')
    const bad = p.startsWith('/m/') || p.startsWith('/membership') || p.startsWith('/tag/')
    return hostOK && pathOK && !bad
  } catch { return false }
}

const BlogCard = ({ item }) => {
  const url = item.url
  const domain = React.useMemo(() => {
    try { return new URL(url).hostname.replace(/^www\./,'') } catch { return url }
  }, [url])
  const icon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="group block h-56 w-64 sm:w-72 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.03] p-4 hover:bg-white/10"
    >
      <div className="flex h-full flex-col">
        <div className="mb-3 flex items-center gap-3">
          <img src={icon} alt="" className="h-5 w-5 rounded-sm" />
          <span className="text-xs text-zinc-400">{domain}</span>
        </div>
        <div
          className="font-medium text-zinc-100"
          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {item.title || domain}
        </div>
        {/* No remote snippet (CORS) */}
        <div className="mt-auto inline-flex items-center gap-2 pt-3 text-sm text-zinc-200 opacity-80 transition group-hover:opacity-100">
          <span>Read</span>
          <ExternalLink className="h-4 w-4" />
        </div>
      </div>
    </a>
  )
}

const Publications = () => {
  const railRef = React.useRef(null)
  const MEDIUM_EXCLUDE_SLUGS = ['hey-mathijs-503a864e2ccc']
  const posts = MEDIUM_POSTS
    .filter(x => isLikelyMediumPost(x.url))
    .filter(x => !MEDIUM_EXCLUDE_SLUGS.some(s => x.url.includes(s)))
    .filter((x, i, arr) => arr.findIndex(y => y.url === x.url) === i)

  const scrollByCards = (dir) => {
    const el = railRef.current
    if (!el) return
    const amount = Math.round(el.clientWidth * 0.9)
    el.scrollBy({ left: dir * amount, behavior: 'smooth' })
  }

  return (
    <Section id="writing" className="pt-12">
      <div className="mb-6 flex items-center gap-3">
        <BookOpen className="h-5 w-5 text-zinc-300" />
        <h2 className="text-xl font-semibold text-zinc-100">Publications & Writing</h2>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#0b0b0e] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#0b0b0e] to-transparent" />

        <div
          ref={railRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none]"
          style={{ WebkitOverflowScrolling: 'touch' }}
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'ArrowLeft') scrollByCards(-1); if (e.key === 'ArrowRight') scrollByCards(1) }}
          onWheel={(e) => { if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) { e.preventDefault(); scrollByCards(e.deltaY > 0 ? 1 : -1) } }}
        >
          {posts.map((x) => (
            <motion.div
              key={x.url}
              className="snap-start w-64 sm:w-72 shrink-0"
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            >
              <BlogCard item={x} />
            </motion.div>
          ))}
        </div>

        <button onClick={() => scrollByCards(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/50 p-2 backdrop-blur hover:bg-black/70">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button onClick={() => scrollByCards(1)} className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/50 p-2 backdrop-blur hover:bg-black/70">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </Section>
  )
}

const LinkCard = ({ item }) => {
  const url = item.url
  const domain = React.useMemo(() => {
    try { return new URL(url).hostname.replace(/^www\./,'') } catch { return url }
  }, [url])
  const icon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`

  return (
    <a href={url} target="_blank" rel="noreferrer" className="group block rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.03] p-5 hover:bg-white/10">
      <div className="mb-3 flex items-center gap-3">
        <img src={icon} alt="" className="h-5 w-5 rounded-sm" />
        <span className="text-xs text-zinc-400">{domain}</span>
      </div>
      <div className="font-medium text-zinc-100">{item.title || domain}</div>
      {/* No remote snippet */}
      <div className="mt-3 inline-flex items-center gap-2 text-sm text-zinc-200 opacity-80 group-hover:opacity-100">
        <span>Read</span>
        <ExternalLink className="h-4 w-4"/>
      </div>
    </a>
  )
}

const Honours = () => (
  <Section id="honours" className="pt-12">
    <div className="mb-6 flex items-center gap-3">
      <Award className="h-5 w-5 text-zinc-300"/>
      <h2 className="text-xl font-semibold text-zinc-100">Honours</h2>
    </div>
    <ul className="space-y-2">
      {HONOURS.map((x) => (
        <li key={x.url}>
          <a className="inline-flex items-center gap-2 text-zinc-200 hover:underline" href={x.url} target="_blank" rel="noreferrer">
            {x.title}
            <ExternalLink className="h-4 w-4"/>
          </a>
        </li>
      ))}
    </ul>
  </Section>
)

const Contact = () => (
  <Section id="contact" className="pt-16 pb-20">
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
      <h2 className="text-xl font-semibold text-zinc-100">Let’s build something outrageous.</h2>
      <p className="mt-2 text-zinc-400">Speaking • Consulting • Collabs</p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <A href={LINKS.email}><Mail className="h-4 w-4"/> Email</A>
        <A href={LINKS.github}><span style={{'--brand': `#${si.siGithub.hex}`}} className="group-hover:text-[var(--brand)]"><BrandIcon icon={si.siGithub}/></span> GitHub</A>
        <A href={LINKS.medium}><span style={{'--brand': `#${si.siMedium.hex}`}} className="group-hover:text-[var(--brand)]"><BrandIcon icon={si.siMedium}/></span> Medium</A>
        <A href={LINKS.twitter}><span style={{'--brand': `#${si.siX.hex}`}} className="group-hover:text-[var(--brand)]"><BrandIcon icon={si.siX}/></span> X</A>
        <A href={LINKS.instagram}><span style={{'--brand': `#${si.siInstagram.hex}`}} className="group-hover:text-[var(--brand)]"><BrandIcon icon={si.siInstagram}/></span> Instagram</A>
      </div>
    </div>
  </Section>
)

export default function App() {
  const views = useSiteViews();

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
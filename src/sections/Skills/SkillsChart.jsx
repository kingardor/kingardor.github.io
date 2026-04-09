import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Section } from '../../shared/components/Primitives'
import {
  siPytorch, siDocker, siKubernetes, siFastapi,
  siGooglecloud, siNvidia, siOnnx, siGithubactions,
  siHuggingface, siLangchain, siOpencv,
} from 'simple-icons'

/* ── Icon renderer ── */
function SiIcon({ icon, size = 18 }) {
  if (!icon) return null
  return (
    <svg role="img" viewBox="0 0 24 24" width={size} height={size}
      fill="currentColor" aria-hidden style={{ flexShrink: 0, opacity: 0.7 }}>
      <path d={icon.path} />
    </svg>
  )
}

const ROWS = [
  {
    label: 'Domains',
    skills: [
      { name: 'AI / ML' },
      { name: 'Computer Vision' },
      { name: 'Deep Learning' },
      { name: 'Agentic Systems' },
      { name: 'Multimodal AI' },
      { name: 'Video Intelligence' },
      { name: 'Natural Language Processing' },
      { name: 'Edge AI' },
    ],
    duration: 40,   /* seconds for one full loop */
    dir: 'normal',  /* normal = left, reverse = right */
    size: 'clamp(2.2rem, 5vw, 4rem)',
    weight: 900,
    gap: '3rem',
    iconSize: 32,
  },
  {
    label: 'Frameworks',
    skills: [
      { name: 'PyTorch',      icon: siPytorch },
      { name: 'Transformers', icon: siHuggingface },
      { name: 'LangChain',    icon: siLangchain },
      { name: 'OpenCV',       icon: siOpencv },
      { name: 'DeepStream',   icon: siNvidia },
      { name: 'TensorRT',     icon: siNvidia },
      { name: 'ONNX',         icon: siOnnx },
      { name: 'LlamaIndex' },
      { name: 'Qdrant' },
      { name: 'YOLO' },
      { name: 'RAG' },
    ],
    duration: 28,
    dir: 'reverse',
    size: 'clamp(1.5rem, 3.2vw, 2.8rem)',
    weight: 700,
    gap: '2.5rem',
    iconSize: 22,
  },
  {
    label: 'Tools & Infra',
    skills: [
      { name: 'Docker',         icon: siDocker },
      { name: 'Kubernetes',     icon: siKubernetes },
      { name: 'FastAPI',        icon: siFastapi },
      { name: 'GCP',            icon: siGooglecloud },
      { name: 'NVIDIA Jetson',  icon: siNvidia },
      { name: 'GitHub Actions', icon: siGithubactions },
      { name: 'qLoRA' },
      { name: 'SFT' },
      { name: 'DPO' },
      { name: 'CLIP' },
      { name: 'Whisper' },
      { name: 'GStreamer' },
    ],
    duration: 52,
    dir: 'normal',
    size: 'clamp(1.1rem, 2.4vw, 2rem)',
    weight: 600,
    gap: '2rem',
    iconSize: 16,
  },
]

function Dot() {
  return (
    <span aria-hidden style={{ color: 'var(--nm-text-subtle)', flexShrink: 0, lineHeight: 1 }}>·</span>
  )
}

function Chip({ skill, active, onEnter, onLeave, iconSize }) {
  const isActive = active === skill.name
  return (
    <span
      className="inline-flex items-center shrink-0 select-none"
      style={{ gap: '0.45em', pointerEvents: 'auto' }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {skill.icon && (
        <span style={{ color: isActive ? 'var(--nm-text)' : 'var(--nm-text-dim)', transition: 'color 0.2s', display: 'inline-flex', alignItems: 'center' }}>
          <SiIcon icon={skill.icon} size={iconSize} />
        </span>
      )}
      <span style={{
        color: isActive ? 'var(--nm-text)' : 'var(--nm-text-dim)',
        textShadow: isActive ? '0 0 40px rgba(220,38,38,1), 0 0 80px rgba(220,38,38,0.5)' : 'none',
        transform: isActive ? 'scale(1.06)' : 'scale(1)',
        display: 'inline-block',
        transition: 'color 0.2s, text-shadow 0.2s, transform 0.2s',
      }}>
        {skill.name}
      </span>
    </span>
  )
}

/* ── RAF-driven tape with drag interaction ── */
function TapeRow({ row, index }) {
  const wrapRef  = useRef(null)
  const stateRef = useRef({ pos: 0, vel: 0, baseVel: 0, dragging: false, lastX: 0, lastT: 0 })
  const [active,    setActive]   = useState(null)
  const [isDragging, setDragging] = useState(false)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return

    /* Compute px/frame from duration + element width */
    const oneSet  = el.scrollWidth / 3
    const base    = (oneSet / row.duration / 60) * (row.dir === 'normal' ? -1 : 1)
    const s       = stateRef.current
    s.vel         = base
    s.baseVel     = base

    let raf
    const loop = () => {
      if (!s.dragging) {
        /* Ease velocity back to base */
        s.vel += (s.baseVel - s.vel) * 0.05
      }

      s.pos += s.vel

      /* Seamless wrap */
      if (s.pos < -oneSet) s.pos += oneSet
      if (s.pos >  0)      s.pos -= oneSet

      el.style.transform = `translateX(${s.pos}px)`
      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [row.duration, row.dir])

  const onPointerDown = (e) => {
    const s = stateRef.current
    s.dragging = true
    s.lastX    = e.clientX
    s.lastT    = performance.now()
    setDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e) => {
    const s = stateRef.current
    if (!s.dragging) return
    const now = performance.now()
    const dt  = Math.max(1, now - s.lastT)
    const dx  = e.clientX - s.lastX
    /* Convert px/ms → px/frame (≈16.67 ms/frame at 60 fps) */
    s.vel  = (dx / dt) * 16.67
    s.lastX = e.clientX
    s.lastT = now
  }

  const onPointerUp = () => {
    stateRef.current.dragging = false
    setDragging(false)
  }

  const items = [...row.skills, ...row.skills, ...row.skills]

  return (
    <motion.div
      className="relative overflow-hidden"
      initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      style={{
        maskImage: 'linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)',
        paddingBlock: '0.65rem',
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
        userSelect: 'none',
      }}
    >
      <div
        ref={wrapRef}
        className="flex items-center whitespace-nowrap"
        style={{
          gap: row.gap,
          fontFamily: 'Outfit, sans-serif',
          fontWeight: row.weight,
          fontSize: row.size,
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}
      >
        {items.map((skill, i) => (
          <React.Fragment key={i}>
            <Chip
              skill={skill}
              active={active}
              iconSize={row.iconSize}
              onEnter={() => !isDragging && setActive(skill.name)}
              onLeave={() => setActive(null)}
            />
            <Dot />
          </React.Fragment>
        ))}
      </div>
    </motion.div>
  )
}

export default function SkillsChart() {
  return (
    <Section id="skills" className="py-20 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mb-14"
      >
        <h2
          className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-none"
          style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--nm-text)' }}
        >
          Skills
        </h2>
        <div
          className="mt-4 h-px w-full"
          style={{ background: 'linear-gradient(to right, var(--nm-accent) 0%, var(--nm-border) 40%, transparent 100%)' }}
        />
      </motion.div>

      <div className="relative flex flex-col gap-1">
        <div aria-hidden className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(220,38,38,0.05), transparent 70%)' }}
        />
        {ROWS.map((row, i) => (
          <React.Fragment key={i}>
            {i > 0 && <div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.04)' }} />}
            <TapeRow row={row} index={i} />
          </React.Fragment>
        ))}
      </div>

      <motion.p
        className="hud-text text-[10px] text-center mt-10"
        style={{ color: 'var(--nm-text-subtle)', letterSpacing: '0.12em' }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        DRAG TO SCRUB · HOVER TO HIGHLIGHT
      </motion.p>
    </Section>
  )
}

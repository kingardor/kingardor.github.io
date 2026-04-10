import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Section } from '../../shared/components/Primitives'
import { Brain, Camera, DatabaseZap, Cpu } from 'lucide-react'

/* ─── Data ─────────────────────────────────────────────────────────────── */
const SKILLS = [
  {
    icon: Brain,
    name: 'Generative AI',
    items: ['qLoRA', 'SFT', 'DPO', 'Prompt Engineering', 'Agents', 'LLM Routing'],
  },
  {
    icon: Camera,
    name: 'Multimodal',
    items: ['Vision-Language', 'Video QA', 'Re-ID', 'Object Tracking'],
  },
  {
    icon: DatabaseZap,
    name: 'RAG / Retrieval',
    items: ['Hybrid Search', 'GraphRAG', 'Qdrant', 'Re-rank', 'Dedup'],
  },
  {
    icon: Cpu,
    name: 'Acceleration',
    items: ['DeepStream', 'TensorRT', 'CUDA', 'Triton'],
  },
]

/* ─── Animation variants ────────────────────────────────────────────────── */
const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 220, damping: 26 },
  },
}

/* ─── Skill Tile ────────────────────────────────────────────────────────── */
function SkillTile({ skill, index }) {
  const Icon = skill.icon
  const num = String(index + 1).padStart(2, '0')

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hovered"
      initial="rest"
      animate="rest"
      className="nm-card group relative overflow-hidden p-6 flex flex-col gap-4"
      style={{ cursor: 'default' }}
    >
      {/* Red top accent bar — animates in on hover */}
      <motion.span
        variants={{
          rest:    { scaleX: 0, originX: 0 },
          hovered: { scaleX: 1, originX: 0 },
        }}
        transition={{ duration: 0.28, ease: [0.32, 0, 0.67, 0] }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'var(--nm-accent)',
          borderRadius: '1rem 1rem 0 0',
          transformOrigin: 'left',
        }}
      />

      {/* Lift shadow on hover */}
      <motion.div
        variants={{
          rest:    { boxShadow: '0 0 0 0 transparent' },
          hovered: { boxShadow: '0 12px 32px rgba(0,0,0,0.55)' },
        }}
        transition={{ duration: 0.22 }}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          pointerEvents: 'none',
        }}
      />

      {/* Ghost index number */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-0.15em',
          right: '0.35rem',
          fontSize: '5.5rem',
          lineHeight: 1,
          fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif",
          fontWeight: 800,
          color: 'var(--nm-text)',
          opacity: 0.08,
          userSelect: 'none',
          pointerEvents: 'none',
          letterSpacing: '-0.04em',
        }}
      >
        {num}
      </span>

      {/* Category header */}
      <div className="relative flex items-center gap-3">
        <Icon
          aria-hidden="true"
          style={{ color: 'var(--nm-accent)', flexShrink: 0 }}
          className="h-5 w-5"
        />
        <span
          style={{
            fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif",
            fontWeight: 700,
            fontSize: '1.05rem',
            color: 'var(--nm-text)',
            lineHeight: 1.2,
          }}
        >
          {skill.name}
        </span>
      </div>

      {/* Skill pills */}
      <div className="relative flex flex-wrap gap-2">
        {skill.items.map((item) => (
          <span
            key={item}
            className="nm-pill hud-text"
            style={{
              fontSize: '0.65rem',
              color: 'var(--nm-text-muted)',
              padding: '0.28rem 0.75rem',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </motion.div>
  )
}

/* ─── Section ───────────────────────────────────────────────────────────── */
export default function Skills() {
  const gridRef = useRef(null)
  const inView  = useInView(gridRef, { once: true, amount: 0.15 })

  return (
    <Section id="skills-list" className="pt-8 pb-4">

      {/* Section heading */}
      <div className="mb-10">
        <h2
          style={{
            fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            lineHeight: 1.05,
            color: 'var(--nm-text)',
            marginBottom: '1rem',
          }}
        >
          Core Skills
        </h2>
        <hr
          style={{
            border: 'none',
            borderTop: '1px solid var(--nm-border)',
            width: '100%',
          }}
        />
      </div>

      {/* Skill tiles grid */}
      <motion.div
        ref={gridRef}
        variants={containerVariants}
        initial="hidden"
        animate={inView ? 'show' : 'hidden'}
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        {SKILLS.map((skill, i) => (
          <SkillTile key={skill.name} skill={skill} index={i} />
        ))}
      </motion.div>

    </Section>
  )
}

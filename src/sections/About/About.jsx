import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Section, K } from '../../shared/components/Primitives'

const INFO_TILES = [
  {
    label: 'Focus',
    value: 'Agentic systems · Multimodal · RAG',
  },
  {
    label: 'Tooling',
    value: 'qLoRA · SFT · DPO · Qdrant · DeepStream',
  },
  {
    label: 'Vibe',
    value: 'Outlaw energy. Production over slides.',
  },
]

export default function About() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const containerVariants = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 18 } },
  }

  return (
    <Section id="about" className="pt-16">
      {/* Section heading */}
      <motion.div
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate={inView ? 'show' : 'hidden'}
        className="mb-10 text-center"
      >
        <motion.h2
          variants={itemVariants}
          className="text-4xl sm:text-5xl font-black tracking-tight"
          style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--nm-text)' }}
        >
          About
        </motion.h2>
        <motion.div
          variants={itemVariants}
          className="mt-4 h-px w-full"
          style={{ background: 'linear-gradient(90deg, transparent, var(--nm-accent), transparent)' }}
        />
      </motion.div>

      {/* Editorial bio */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={inView ? 'show' : 'hidden'}
        className="space-y-8 flex flex-col items-center text-center"
      >
        <motion.p
          variants={itemVariants}
          className="text-xl sm:text-2xl leading-relaxed font-light max-w-3xl"
          style={{ color: 'var(--nm-text)' }}
        >
          I architect and ship <K>agentic AI</K> systems that actually launch —{' '}
          <K>video-first data lakes</K>, retrieval engines, and{' '}
          <K>fine-tuned LLMs</K>. Former research scholar at{' '}
          <K>UC Berkeley</K>;{' '}
          <K>Z by HP Global Data Science Ambassador</K>; and{' '}
          <K>NVIDIA Jetson AI Research Lab</K> member. If it runs on GPUs or edge silicon, I squeeze more out of it.
        </motion.p>

        {/* Currently badge */}
        <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-3">
          <span
            className="hud-text text-[10px] px-3 py-1 nm-pill"
            style={{ color: 'var(--nm-text-muted)' }}
          >
            Currently
          </span>
          <motion.span
            className="text-sm font-semibold text-transparent bg-clip-text"
            style={{
              backgroundImage: 'linear-gradient(90deg, #dc2626, #f97316, #dc2626)',
              backgroundSize: '200% 100%',
            }}
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
          >
            Director of AI — MyBlue.ai
          </motion.span>
        </motion.div>

        {/* Info tiles */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full"
        >
          {INFO_TILES.map((tile) => (
            <div key={tile.label} className="nm-card p-4 text-center">
              <div
                className="hud-text text-[10px] mb-2"
                style={{ color: 'var(--nm-accent)' }}
              >
                {tile.label}
              </div>
              <div
                className="text-sm font-medium leading-relaxed"
                style={{ color: 'var(--nm-text)' }}
              >
                {tile.value}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </Section>
  )
}

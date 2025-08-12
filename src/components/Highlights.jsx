import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

import { Section } from './Section'

const highlights = [
    {
        title: "5+ years of experience in AI",
        description: "From architecting and shipping agentic AI systems to fine-tuning LLMs."
    },
    {
        title: "Multiple deployed pipelines",
        description: "Experience in deploying modular and low-latency pipelines for video analytics and more."
    },
    {
        title: "Multimodal Platform Expertise",
        description: "Hands-on experience in building systems with Vision-Language, Video QA, and RAG."
    },
    {
        title: "Patented Face Recognition Pipeline",
        description: "Invented a low-resource face recognition pipeline for efficient feature comparison."
    },
    {
        title: "Global Data Science Ambassador",
        description: "Recognized by Z by HP as a Global Data Science Ambassador."
    },
    {
        title: "NVIDIA Jetson AI Ambassador",
        description: "Acknowledged as an NVIDIA Jetson AI Ambassador and Research Lab Member."
    }
]

const Highlights = () => (
  <Section id="highlights" className="pt-12">
    <div className="mb-6 flex items-center gap-3">
      <Sparkles className="h-5 w-5 text-zinc-300"/>
      <h2 className="text-xl font-semibold text-zinc-100">Highlights</h2>
    </div>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {highlights.map((highlight, index) => (
            <motion.div
                key={index}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.5 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
            >
                <h3 className="text-lg font-semibold text-zinc-100">{highlight.title}</h3>
                <p className="mt-2 text-zinc-400">{highlight.description}</p>
            </motion.div>
        ))}
    </div>
  </Section>
)

export default Highlights

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

import { TITLES, BADGES } from '../lib/data'
import { Pill } from './Pill'
import { A } from './A'

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
    </section>
  )
}

export default Hero

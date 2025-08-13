import React from 'react'
import { motion } from 'framer-motion'
import AnimatedBadges from './AnimatedBadges'
import ChatBar from './ChatBar'
import ScrollDown from './ScrollDown'

export default function Hero({ onSubmit }) {
  return (
    <section id="top" className="relative h-[100svh] w-full overflow-hidden">
      <img src="/hero.jpg" alt="Akash James" className="absolute inset-0 h-full w-full object-cover brightness-[.65] saturate-90" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/55 to-black/80"/>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(2,6,23,0.2),transparent_55%)]"/>
      <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col items-center justify-end px-6 text-center gap-5 sm:gap-6 pb-28 sm:pb-36 md:pb-44">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="text-balance text-4xl font-extrabold tracking-tight text-zinc-50 sm:text-6xl md:text-7xl">
          Akash <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-fuchsia-400 to-red-400">James</span>
        </motion.h1>

        <AnimatedBadges />
        <ChatBar onSubmit={onSubmit} />
      </div>

      <ScrollDown />
    </section>
  )
}

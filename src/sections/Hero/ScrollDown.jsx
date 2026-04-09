import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useHasScrolled from '../../shared/hooks/useHasScrolled'

export default function ScrollDown() {
  const hide = useHasScrolled(40)
  return (
    <AnimatePresence>
      {!hide && (
        <motion.a
          href="#highlights"
          aria-label="Scroll to highlights"
          className="absolute inset-x-0 bottom-8 z-20 flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.3, delay: 1.8 }}
        >
          {/* Animated vertical line */}
          <div
            className="w-[1px] h-8 animate-scroll-line"
            style={{ background: 'linear-gradient(to bottom, var(--nm-accent), transparent)' }}
          />
          <span
            className="hud-text"
            style={{ fontSize: '0.55rem', color: 'var(--nm-text-subtle)' }}
          >
            scroll
          </span>
        </motion.a>
      )}
    </AnimatePresence>
  )
}

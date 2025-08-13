import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useHasScrolled from '../../hooks/useHasScrolled'

export default function ScrollDown() {
  const hide = useHasScrolled(40)
  return (
    <AnimatePresence>
      {!hide && (
        <motion.a
          href="#highlights"
          aria-label="Scroll to highlights"
          className="group absolute inset-x-0 bottom-10 sm:bottom-10 z-20 flex justify-center"
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
              <span className="text-xs font-medium text-zinc-300/80 group-hover:text-zinc-100">Scroll to see more!</span>
            </div>
          </div>
        </motion.a>
      )}
    </AnimatePresence>
  )
}

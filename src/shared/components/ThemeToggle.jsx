import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

const iconVariants = {
  initial: { rotate: -90, scale: 0, opacity: 0 },
  animate: {
    rotate: 0,
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 260, damping: 20 },
  },
  exit: {
    rotate: 90,
    scale: 0,
    opacity: 0,
    transition: { duration: 0.18, ease: 'easeIn' },
  },
}

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        position: 'relative',
        overflow: 'visible',
        borderRadius: '0.75rem',
        padding: '0.5rem',
        border: '1px solid var(--nm-border)',
        background: 'var(--nm-surface)',
        boxShadow: '3px 3px 8px var(--nm-shadow-dark), -2px -2px 5px var(--nm-shadow-light)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        flexShrink: 0,
      }}
    >
      {/* Star dots — visible in dark mode */}
      {[
        { top: -5, left: -5, size: 3, delay: '0s' },
        { top: -6, right: -3, size: 2.5, delay: '0.05s' },
        { bottom: -4, right: -6, size: 2, delay: '0.1s' },
      ].map((s, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            top: s.top,
            left: s.left,
            right: s.right,
            bottom: s.bottom,
            width: s.size,
            height: s.size,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.75)',
            opacity: isDark ? 1 : 0,
            transform: isDark ? 'scale(1)' : 'scale(0)',
            transition: `opacity 0.3s ease ${s.delay}, transform 0.35s ease ${s.delay}`,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Cloud blobs — visible in light mode */}
      {[
        { top: -8, right: -10, width: 18, height: 6, delay: '0.05s', bumpSize: 9, bumpLeft: 2 },
        { bottom: -7, left: -10, width: 14, height: 5, delay: '0.1s', bumpSize: 7, bumpLeft: 2 },
      ].map((c, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            top: c.top,
            right: c.right,
            bottom: c.bottom,
            left: c.left,
            width: c.width,
            height: c.height,
            borderRadius: 99,
            background: 'rgba(255,255,255,0.85)',
            opacity: isDark ? 0 : 1,
            transform: isDark ? 'translateY(4px)' : 'translateY(0)',
            transition: `opacity 0.4s ease ${c.delay}, transform 0.4s ease ${c.delay}`,
            pointerEvents: 'none',
          }}
        >
          <span style={{
            position: 'absolute',
            width: c.bumpSize,
            height: c.bumpSize,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.85)',
            top: -(c.bumpSize / 2),
            left: c.bumpLeft,
          }} />
        </span>
      ))}

      {/* Animated icon */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          variants={iconVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {isDark
            ? <Moon size={16} color="var(--nm-accent)" />
            : <Sun size={16} color="#f59e0b" />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}

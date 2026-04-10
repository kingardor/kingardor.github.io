import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, ArrowUpRight } from 'lucide-react'
import { ASSISTANT } from '../../data'

export default function ChatFAB({ onClick }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const hero = document.getElementById('top')
    if (!hero) { setVisible(true); return }

    const obs = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0.05 }
    )
    obs.observe(hero)
    return () => obs.disconnect()
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          aria-label={`Chat with ${ASSISTANT.name}`}
          className="fixed z-50 bottom-6 right-5 md:bottom-8 md:right-8 outline-none"
          initial={{ opacity: 0, y: 24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={onClick}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              padding: '0.5rem 0.85rem 0.5rem 0.55rem',
              background: 'var(--nm-surface)',
              border: '1px solid var(--nm-border)',
              borderRadius: '99px',
              boxShadow:
                '0 0 28px rgba(220,38,38,0.18), 6px 6px 18px var(--nm-shadow-dark), -2px -2px 6px var(--nm-shadow-light)',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            {/* Icon bubble */}
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--nm-accent), var(--nm-accent-2))',
                boxShadow: '0 0 16px rgba(220,38,38,0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <MessageCircle size={16} color="#fff" aria-hidden />
            </div>

            {/* Label */}
            <div style={{ lineHeight: 1.15 }}>
              <div
                style={{
                  fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif",
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  color: 'var(--nm-text)',
                  letterSpacing: '-0.01em',
                }}
              >
                {ASSISTANT.name}
              </div>
              <div
                className="hud-text"
                style={{
                  fontSize: '0.48rem',
                  color: 'var(--nm-text-muted)',
                  letterSpacing: '0.07em',
                }}
              >
                {ASSISTANT.acronym.toUpperCase()}
              </div>
            </div>

            {/* Arrow */}
            <ArrowUpRight
              size={14}
              aria-hidden
              style={{ color: 'var(--nm-accent)', flexShrink: 0, marginLeft: 2 }}
            />
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  )
}

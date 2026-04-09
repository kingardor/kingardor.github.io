import React, { createContext, useContext, useState, useEffect, useRef } from 'react'

const ThemeCtx = createContext({ theme: 'dark', toggle: () => {} })

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark'
    return localStorage.getItem('aj-theme') || 'dark'
  })
  const timerRef = useRef(null)

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
    localStorage.setItem('aj-theme', theme)
  }, [theme])

  // Cancel timer on unmount
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  const toggle = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    document.documentElement.setAttribute('data-transitioning', '')
    setTheme(t => t === 'dark' ? 'light' : 'dark')
    timerRef.current = setTimeout(
      () => document.documentElement.removeAttribute('data-transitioning'),
      450
    )
  }

  return <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>
}

export const useTheme = () => useContext(ThemeCtx)

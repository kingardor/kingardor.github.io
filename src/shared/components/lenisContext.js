import { createContext, useContext } from 'react'

// Default values are ref-like objects so consumers work without the provider.
export const ScrollProgressContext = createContext({ current: 0 })
export const LenisContext = createContext({ current: null })

/** Returns a mutable ref whose .current holds the Lenis instance (or null) */
export function useLenis() {
  return useContext(LenisContext)
}

/** Returns a mutable ref whose .current holds scroll progress 0–1.
 *  Read inside requestAnimationFrame or R3F useFrame — NOT in render. */
export function useScrollProgress() {
  return useContext(ScrollProgressContext)
}

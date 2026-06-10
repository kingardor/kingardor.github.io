// Device/preference gates, evaluated once at module load.
// Drives the mobile/reduced-motion fallback matrix: story video → poster,
// pinned cinematics → stacked layouts, guided tour → disabled.

export const isMobile =
  typeof window !== 'undefined' &&
  (window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches)

export const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

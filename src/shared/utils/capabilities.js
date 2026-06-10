// Device/preference gates, evaluated once at module load.
// Drives the mobile/reduced-motion fallback matrix: WebGL canvas → poster,
// pinned cinematics → stacked layouts, guided tour → disabled.

export const isMobile =
  typeof window !== 'undefined' &&
  (window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches)

export const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** 0 = no WebGL / don't render the monolith, 1 = low (reduced subdivisions), 2 = full */
export function webglTier() {
  if (isMobile || prefersReduced || window.__PRERENDER) return 0
  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    if (!gl) return 0
    // Heuristic: low device memory or few cores → reduced geometry
    const lowEnd =
      (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)
    return lowEnd ? 1 : 2
  } catch {
    return 0
  }
}

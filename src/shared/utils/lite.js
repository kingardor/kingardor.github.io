/**
 * Lite rendering: phones, tablets and machines without graphics acceleration.
 *
 * Measured on a Pixel 10 (Nov 2026): the full portrait stage stacked about a
 * dozen screen-sized layers, Chrome logged "tile memory limits exceeded, some
 * content may not draw" hundreds of times a second and left whole rectangles
 * blank, and its GPU (PowerVR, over ANGLE/Vulkan) drew blend modes wrong. On
 * a laptop without graphics acceleration the same stack is drawn on the CPU.
 *
 * Lite draws the portrait from two layers (backdrop + subject) and switches
 * off blend modes and backdrop blurs page-wide (html.is-lite, index.css).
 * Touch devices can't steer the lights anyway. `?stage=full` / `?stage=lite`
 * force either mode for testing.
 */
let lite = null

function hasGpu() {
  try {
    const c = document.createElement('canvas')
    // null when the browser would only render WebGL in software
    const gl = c.getContext('webgl', { failIfMajorPerformanceCaveat: true })
    if (!gl) return false
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
}

export function isLite() {
  if (lite !== null) return lite
  if (typeof window === 'undefined') return (lite = false)
  const forced = location.search.match(/[?&]stage=(full|lite)\b/) || location.hash.match(/[?&]stage=(full|lite)\b/)
  if (forced) lite = forced[1] === 'lite'
  else lite = window.matchMedia('(hover: none), (pointer: coarse)').matches || !hasGpu()
  return lite
}

/** Called once at boot (main.jsx): marks <html> so CSS can drop costly effects. */
export function applyLite() {
  if (typeof document !== 'undefined' && isLite()) document.documentElement.classList.add('is-lite')
}

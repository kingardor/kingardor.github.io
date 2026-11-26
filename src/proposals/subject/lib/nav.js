// Scroll-to that cooperates with the global Lenis instance.
let lenisRef = null
export function bindLenis(ref) { lenisRef = ref }

export function scrollToId(id, { offset = 0, immediate = false } = {}) {
  const el = typeof id === 'string' ? document.getElementById(id) : id
  if (!el) return
  const lenis = lenisRef?.current
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (lenis) lenis.scrollTo(el, { offset, immediate: immediate || reduce, duration: 1.4 })
  else el.scrollIntoView({ behavior: reduce || immediate ? 'auto' : 'smooth' })
}

export function lockScroll(on) {
  const lenis = lenisRef?.current
  if (lenis) { if (on) lenis.stop(); else lenis.start() }
  document.documentElement.classList.toggle('sj-locked', on)
}

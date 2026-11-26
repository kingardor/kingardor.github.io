import { useEffect } from 'react'

/**
 * The boot loader (index.html → main.jsx) waits for the hero to report that
 * its display font is ready (4 s safety cap). Layouts other than Home call
 * this with the font they open on, e.g. useLoaderRelease('800 1rem "Mona Sans"').
 */
export default function useLoaderRelease(font) {
  useEffect(() => {
    const release = () => { window.__resolveHeroReady?.(); window.__resolveHeroReady = null }
    Promise.race([
      font && document.fonts ? document.fonts.load(font) : Promise.resolve(),
      new Promise(r => setTimeout(r, 3000)),
    ]).then(release, release)
  }, [font])
}

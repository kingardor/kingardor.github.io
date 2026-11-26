import React from 'react'
import { flushSync } from 'react-dom'

// Section anchors scroll within Home. Only route hashes change the React view.
const readRoute = () => location.hash.startsWith('#/') ? location.hash.slice(1) : '/'

export default function useHashPath() {
  const [path, setPath] = React.useState(readRoute)
  const currentRoute = React.useRef(path)
  React.useEffect(() => {
    const onHash = () => {
      // An in-page anchor (#vs-story, #career) only scrolls: the browser has
      // already jumped, so put the route back instead of leaving the page.
      if (!location.hash.startsWith('#/') && location.hash.length > 1 && currentRoute.current !== '/') {
        history.replaceState(history.state, '', `${location.pathname}${location.search}#${currentRoute.current}`)
        return
      }
      const newPath = readRoute()
      if (newPath === currentRoute.current) return
      currentRoute.current = newPath
      if (document.startViewTransition) {
        document.startViewTransition(() => {
          flushSync(() => {
            setPath(newPath)
          })
        })
      } else {
        setPath(newPath)
      }
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return path
}
import React from 'react'
import { flushSync } from 'react-dom'

// Section anchors scroll within Home. Only route hashes change the React view.
const readRoute = () => location.hash.startsWith('#/') ? location.hash.slice(1) : '/'

export default function useHashPath() {
  const [path, setPath] = React.useState(readRoute)
  const currentRoute = React.useRef(path)
  React.useEffect(() => {
    const onHash = () => {
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
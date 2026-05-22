import React from 'react'
import { flushSync } from 'react-dom'

export default function useHashPath() {
  const [path, setPath] = React.useState(location.hash.slice(1) || '/')
  React.useEffect(() => {
    const onHash = () => {
      const newPath = location.hash.slice(1) || '/'
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
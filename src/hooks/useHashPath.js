import React from 'react'
export default function useHashPath() {
  const [path, setPath] = React.useState(location.hash.slice(1) || '/')
  React.useEffect(() => {
    const onHash = () => setPath(location.hash.slice(1) || '/')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return path
}
import React from 'react'
export default function useAutoHideHeader() {
  const [hidden, setHidden] = React.useState(false)
  React.useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      if (y > last && y > 80) {
        setHidden(true) // scrolling down, hide
      } else if (y < last) {
        setHidden(false) // scrolling up, show
      }
      last = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return hidden
}

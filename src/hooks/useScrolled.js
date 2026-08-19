import { useEffect, useState } from 'react'

/** True once the page has scrolled past `offset` px. Drives the navbar border. */
export function useScrolled(offset = 8) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > offset)
    onScroll()   // set the correct state on mount, e.g. after a deep-link refresh
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [offset])

  return scrolled
}

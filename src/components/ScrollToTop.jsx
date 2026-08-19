import { useEffect } from 'react'
import { useLocation } from 'react-router'

/**
 * On route change, scroll to the top AND move focus to <main>.
 *
 * The focus half is the part single-page apps usually miss: without it, a
 * keyboard or screen-reader user who activates a nav link stays focused on the
 * navbar, with no indication that the page content changed.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    document.getElementById('main')?.focus({ preventScroll: true })
  }, [pathname])

  return null
}

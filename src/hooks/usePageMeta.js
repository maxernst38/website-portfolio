import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { seo } from '../content/site.js'

/**
 * Keeps <title> and the meta description in sync with the current route.
 *
 * This matters for more than browser tabs: most screen readers announce the
 * document title on navigation, which in a single-page app is the only signal
 * that the page changed at all.
 */
export function usePageMeta() {
  const { pathname } = useLocation()

  useEffect(() => {
    const meta = seo.pages[pathname]
    if (!meta) return

    document.title = meta.title

    let tag = document.querySelector('meta[name="description"]')
    if (!tag) {
      tag = document.createElement('meta')
      tag.setAttribute('name', 'description')
      document.head.appendChild(tag)
    }
    tag.setAttribute('content', meta.description)
  }, [pathname])
}

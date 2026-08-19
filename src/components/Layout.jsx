import { Outlet } from 'react-router'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'
import ScrollToTop from './ScrollToTop.jsx'
import { usePageMeta } from '../hooks/usePageMeta.js'

export default function Layout() {
  usePageMeta()

  return (
    <>
      <ScrollToTop />

      {/* First focusable element on the page. */}
      <a
        href="#main"
        className="sr-only rounded-input bg-brand-600 px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[100]"
      >
        Skip to content
      </a>

      <Navbar />

      {/* tabIndex allows ScrollToTop to move focus here on route change. */}
      <main id="main" tabIndex={-1} className="focus:outline-none">
        <Outlet />
      </main>

      <Footer />
    </>
  )
}

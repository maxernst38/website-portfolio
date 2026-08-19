import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { nav, profile } from '../content/site.js'
import { useScrolled } from '../hooks/useScrolled.js'
import { Menu, X } from './icons.jsx'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const scrolled = useScrolled()
  const headerRef = useRef(null)

  // Close on navigation.
  useEffect(() => { setOpen(false) }, [pathname])

  // Close on Escape and on a click outside the header.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    const onClick = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onClick)
    }
  }, [open])

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-50 bg-white/80 backdrop-blur-md transition-[border-color] duration-300 supports-[backdrop-filter]:bg-white/70 ${
        scrolled || open ? 'border-b border-hairline' : 'border-b border-transparent'
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-base font-semibold text-ink"
        >
          {profile.shortName}
          <span className="h-[5px] w-[5px] rounded-full bg-brand-600" aria-hidden="true" />
        </Link>

        {/* Desktop navigation */}
        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `relative inline-flex h-16 items-center px-3 text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'text-brand-600 after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-brand-600'
                        : 'text-body hover:text-ink'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-input text-ink transition-colors duration-200 hover:bg-brand-50 md:hidden"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/*
        Disclosure panel, not a full-screen overlay. Animating
        grid-template-rows 0fr -> 1fr is the clean way to transition to an
        auto height. No body-scroll lock: that is an overlay concern, and
        skipping it avoids the iOS scroll-restore bug.
      */}
      <div
        id="mobile-nav"
        /* `inert` when collapsed: the panel is only visually hidden (it still
           occupies the DOM for the height transition), so without this a screen
           reader would read a second copy of the nav that sighted users cannot
           see. inert removes it from the a11y tree and from tab order at once. */
        inert={!open}
        className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-soft md:hidden ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0">
          <nav aria-label="Mobile" className="container-page border-t border-hairline bg-white pb-3">
            <ul>
              {nav.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `block border-b border-hairline py-3.5 text-base font-medium last:border-b-0 ${
                        isActive ? 'text-brand-600' : 'text-body'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  )
}

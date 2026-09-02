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
      data-chrome
      /* Opaque, not translucent. The page behind the header is white, so any
         transparency mixed the bar toward grey and left a visible seam against
         the hero directly below it. */
      className={`sticky top-0 z-50 bg-chrome transition-[border-color] duration-300 ${
        scrolled || open ? 'border-b border-chrome-line' : 'border-b border-transparent'
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-mono text-base font-semibold tracking-tight text-chrome-ink"
        >
          {profile.shortName}
          <span className="h-[5px] w-[5px] rounded-full bg-accent" aria-hidden="true" />
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
                    `relative inline-flex h-16 items-center px-3 font-mono text-sm transition-colors duration-200 ${
                      isActive
                        ? 'text-accent after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-accent'
                        : 'text-chrome-body hover:text-chrome-ink'
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
          className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-input text-chrome-ink transition-colors duration-200 hover:bg-chrome-raised md:hidden"
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
          <nav aria-label="Mobile" className="container-page border-t border-chrome-line bg-chrome pb-3">
            <ul>
              {nav.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `block border-b border-chrome-line py-3.5 font-mono text-base last:border-b-0 ${
                        isActive ? 'text-accent' : 'text-chrome-body'
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

import { Link } from 'react-router'
import { nav, profile } from '../content/site.js'
import SocialLinks from './SocialLinks.jsx'

/**
 * The closing half of the dark chrome.
 *
 * Matches the navbar rather than the page, so the light content sits between
 * two dark bands instead of fading out at the bottom. The blueprint grid is the
 * same one the hero uses, which ties the two ends of the page together.
 */
export default function Footer() {
  return (
    <footer data-chrome className="blueprint border-t border-chrome-line bg-chrome py-12">
      <div className="container-page">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 font-mono font-semibold text-chrome-ink"
            >
              {profile.shortName}
              <span className="h-[5px] w-[5px] rounded-full bg-accent" aria-hidden="true" />
            </Link>
            <p className="mt-3 max-w-xs text-sm text-chrome-muted">{profile.tagline}</p>
          </div>

          <nav aria-label="Footer">
            <h2 className="font-mono text-eyebrow font-semibold uppercase text-accent">Pages</h2>
            <ul className="mt-3 space-y-2">
              {nav.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-sm text-chrome-body transition-colors duration-200 hover:text-chrome-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-mono text-eyebrow font-semibold uppercase text-accent">Elsewhere</h2>
            <SocialLinks className="mt-1 -ml-3" tone="chrome" />
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-chrome-line pt-6 font-mono text-xs text-chrome-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {profile.name}</p>
          <p>Built with React, Vite and Tailwind CSS.</p>
        </div>
      </div>
    </footer>
  )
}

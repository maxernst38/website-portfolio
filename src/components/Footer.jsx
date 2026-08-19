import { Link } from 'react-router'
import { nav, profile } from '../content/site.js'
import SocialLinks from './SocialLinks.jsx'

export default function Footer() {
  return (
    <footer className="border-t border-hairline bg-surface-subtle py-12">
      <div className="container-page">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 font-semibold text-ink">
              {profile.shortName}
              <span className="h-[5px] w-[5px] rounded-full bg-brand-600" aria-hidden="true" />
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted">{profile.tagline}</p>
          </div>

          <nav aria-label="Footer">
            <h2 className="text-eyebrow font-semibold uppercase text-ink">Pages</h2>
            <ul className="mt-3 space-y-2">
              {nav.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-sm text-body transition-colors duration-200 hover:text-brand-600"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-eyebrow font-semibold uppercase text-ink">Elsewhere</h2>
            <SocialLinks className="mt-1 -ml-3" />
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-hairline pt-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {profile.name}</p>
          <p>Built with React, Vite and Tailwind CSS.</p>
        </div>
      </div>
    </footer>
  )
}

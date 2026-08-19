import { contact } from '../content/site.js'
import { iconMap, ExternalLink } from './icons.jsx'

/**
 * Renders contact.socials in one of two shapes:
 *   variant="icon" — a compact row of icon buttons (hero, footer)
 *   variant="tile" — labelled cards with handles (contact page)
 */
export default function SocialLinks({
  items = contact.socials,
  variant = 'icon',
  className = '',
}) {
  if (variant === 'tile') {
    return (
      <div className={`grid gap-4 sm:grid-cols-3 ${className}`}>
        {items.map((item) => {
          const Glyph = iconMap[item.icon] ?? ExternalLink
          const external = /^https?:\/\//.test(item.href)
          return (
            <a
              key={item.label}
              href={item.href}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="group flex items-center gap-3 rounded-card border border-hairline bg-surface p-4 text-left shadow-card transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover"
            >
              <span className="rounded-lg bg-brand-50 p-2.5 text-brand-600">
                <Glyph className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block font-medium text-ink">{item.label}</span>
                <span className="block truncate text-sm text-muted">{item.handle}</span>
              </span>
              <ArrowGlyph />
            </a>
          )
        })}
      </div>
    )
  }

  return (
    <ul className={`flex items-center gap-2 ${className}`}>
      {items.map((item) => {
        const Glyph = iconMap[item.icon] ?? ExternalLink
        const external = /^https?:\/\//.test(item.href)
        return (
          <li key={item.label}>
            <a
              href={item.href}
              aria-label={item.label}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="inline-flex h-11 w-11 items-center justify-center rounded-input text-muted transition-colors duration-200 hover:bg-brand-50 hover:text-brand-600"
            >
              <Glyph className="h-5 w-5" />
            </a>
          </li>
        )
      })}
    </ul>
  )
}

function ArrowGlyph() {
  return (
    <span className="ml-auto shrink-0 text-hairline-strong transition-colors duration-200 group-hover:text-brand-600">
      <ExternalLink className="h-4 w-4" />
    </span>
  )
}

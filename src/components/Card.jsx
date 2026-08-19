import { Link } from 'react-router'

/**
 * The shared surface behind nav cards, project cards and contact tiles:
 * a hairline border at rest, a soft lift on hover.
 *
 * Pass `to`/`href` only when the WHOLE card should be one link. A card that
 * contains its own links (like ProjectCard) must stay a plain <div> — nesting
 * interactive elements is invalid HTML — and should use `focus-within:` to
 * mirror the hover state for keyboard users.
 */
export default function Card({
  to,
  href,
  as: Tag = 'div',
  interactive = true,
  className = '',
  children,
  ...rest
}) {
  const classes = [
    'group relative overflow-hidden rounded-card border border-hairline bg-surface shadow-card',
    interactive &&
      'transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (to) return <Link to={to} className={classes} {...rest}>{children}</Link>

  if (href) {
    const external = /^https?:\/\//.test(href)
    return (
      <a
        href={href}
        className={classes}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...rest}
      >
        {children}
      </a>
    )
  }

  return <Tag className={classes} {...rest}>{children}</Tag>
}

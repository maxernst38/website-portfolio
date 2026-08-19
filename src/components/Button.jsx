import { Link } from 'react-router'

/**
 * Polymorphic button: renders a react-router <Link> with `to`, an <a> with
 * `href`, and a <button> otherwise — so the same visual style is always on the
 * semantically correct element.
 *
 * Variant classes are complete literal strings in a lookup object, never
 * assembled from fragments: Tailwind v4 only sees class names that appear
 * verbatim in the source.
 */
const VARIANTS = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-card',
  secondary:
    'bg-white text-ink border border-hairline hover:border-brand-200 hover:bg-brand-50/60',
  ghost:
    'text-brand-600 hover:bg-brand-50',
}

const SIZES = {
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
}

export default function Button({
  to,
  href,
  variant = 'primary',
  size = 'md',
  icon: IconCmp,
  iconPosition = 'right',
  className = '',
  children,
  ...rest
}) {
  const classes = [
    'inline-flex items-center justify-center gap-2 rounded-input font-medium',
    'transition-[background-color,border-color,box-shadow,transform] duration-200',
    'active:translate-y-px',
    VARIANTS[variant] ?? VARIANTS.primary,
    SIZES[size] ?? SIZES.md,
    className,
  ].join(' ')

  const content = (
    <>
      {IconCmp && iconPosition === 'left' && <IconCmp className="h-4 w-4" />}
      {children}
      {IconCmp && iconPosition === 'right' && <IconCmp className="h-4 w-4" />}
    </>
  )

  if (to) {
    return <Link to={to} className={classes} {...rest}>{content}</Link>
  }

  if (href) {
    const external = /^https?:\/\//.test(href)
    return (
      <a
        href={href}
        className={classes}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...rest}
      >
        {content}
      </a>
    )
  }

  return <button type="button" className={classes} {...rest}>{content}</button>
}

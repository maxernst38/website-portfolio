import { ImageIcon } from './icons.jsx'

/**
 * Renders a photo, or a correctly-sized grey placeholder when there isn't one
 * yet. This is what lets the whole site be designed before any real photos
 * exist: `src: null` in site.js reserves exactly the space the real image will
 * occupy, so nothing reflows when the photo lands.
 *
 * The placeholder prints its intended alt text and aspect ratio, so the grey
 * boxes double as a shooting list.
 */
export default function Media({
  src,
  alt,
  ratio = '4/3',
  label,
  rounded = 'rounded-card',
  eager = false,
  className = '',
  imgClassName = '',
}) {
  // Inline aspectRatio rather than an aspect-* class: Tailwind v4 cannot see
  // class names assembled at runtime, so a data-driven ratio must not go
  // through a class string or it silently produces no CSS.
  const style = { aspectRatio: ratio.replace('/', ' / ') }
  const base = `relative overflow-hidden ${rounded} ${className}`

  if (import.meta.env.DEV && src && !alt) {
    console.warn('[Media] image supplied without alt text:', src)
  }

  if (src) {
    return (
      <div className={`${base} bg-slate-100`} style={style}>
        <img
          src={src}
          alt={alt ?? ''}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={eager ? 'high' : 'auto'}
          className={`absolute inset-0 h-full w-full object-cover ${imgClassName}`}
        />
      </div>
    )
  }

  // Scaffolding only — there is genuinely nothing here to describe, and
  // announcing "placeholder image" would be noise.
  //
  // In development the box prints the intended alt text and aspect ratio, so
  // the placeholders double as a shooting list. In production it shows a plain
  // neutral panel instead: visitors should never see "TODO: photo of the arm"
  // on a live page, and a quiet empty frame reads as deliberate.
  if (import.meta.env.DEV) {
    return (
      <div
        className={`${base} grid place-items-center border border-dashed border-hairline-strong bg-slate-100/80`}
        style={style}
        aria-hidden="true"
      >
        <div className="flex flex-col items-center gap-1.5 px-4 text-center">
          <ImageIcon className="h-6 w-6 text-slate-400" />
          <span className="text-xs font-medium text-slate-500">{label ?? alt ?? 'Photo'}</span>
          <span className="text-[11px] tabular-nums text-slate-400">{ratio}</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`${base} grid place-items-center bg-slate-100`}
      style={style}
      aria-hidden="true"
    >
      <ImageIcon className="h-7 w-7 text-slate-300" />
    </div>
  )
}

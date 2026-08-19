import { useCallback, useEffect, useRef, useState } from 'react'
import Media from './Media.jsx'
import { Pause, Play } from './icons.jsx'

/**
 * Crossfading photo slideshow.
 *
 * Degrades sensibly: with zero or one usable photo there is nothing to cycle,
 * so it renders a plain <Media> and no controls appear. That means it works
 * unchanged whether site.js has no photos yet, one, or six.
 *
 * Accessibility notes, because auto-advancing carousels are a classic trap:
 *  - Under prefers-reduced-motion it does not auto-advance at all; the dots
 *    still work, so the content stays reachable.
 *  - WCAG 2.2.2 (Pause, Stop, Hide) requires an explicit control for anything
 *    that moves on its own, so there is a real pause button — hover-to-pause
 *    alone would not satisfy it, and would strand touch users regardless.
 *  - Advancing also pauses when the tab is hidden, so a backgrounded page is
 *    not burning through the deck.
 *  - Inactive slides are aria-hidden, so a screen reader reads one image, not
 *    a pile of them.
 */
export default function Slideshow({
  items = [],
  ratio = '4/5',
  interval = 5000,
  className = '',
  imgClassName = '',
}) {
  const photos = items.filter((p) => p?.src)
  const canCycle = photos.length > 1

  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const reducedRef = useRef(false)

  useEffect(() => {
    reducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedRef.current) setPlaying(false)
  }, [])

  const go = useCallback(
    (next) => setIndex(((next % photos.length) + photos.length) % photos.length),
    [photos.length],
  )

  useEffect(() => {
    if (!canCycle || !playing) return
    const tick = () => {
      if (!document.hidden) setIndex((i) => (i + 1) % photos.length)
    }
    const id = setInterval(tick, interval)
    return () => clearInterval(id)
  }, [canCycle, playing, interval, photos.length])

  // Nothing to cycle through — behave exactly like a single image.
  if (!canCycle) {
    return (
      <Media
        {...(photos[0] ?? items[0] ?? {})}
        ratio={ratio}
        eager
        className={className}
        imgClassName={imgClassName}
      />
    )
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); setPlaying(false); go(index + 1) }
    if (e.key === 'ArrowLeft') { e.preventDefault(); setPlaying(false); go(index - 1) }
  }

  return (
    <div
      className={`relative overflow-hidden rounded-card ${className}`}
      style={{ aspectRatio: ratio.replace('/', ' / ') }}
      role="group"
      aria-roledescription="carousel"
      aria-label="Photos"
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      {photos.map((photo, i) => (
        <img
          key={photo.src}
          src={photo.src}
          alt={photo.alt ?? ''}
          loading={i === 0 ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={i === 0 ? 'high' : 'auto'}
          aria-hidden={i !== index}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-soft ${
            i === index ? 'opacity-100' : 'opacity-0'
          } ${imgClassName}`}
        />
      ))}

      {/* Controls. Always visible rather than hover-revealed, so they exist for
          touch and keyboard users too. */}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-3 bg-gradient-to-t from-black/35 to-transparent px-4 pb-3 pt-8">
        <ul className="flex items-center gap-1.5">
          {photos.map((photo, i) => (
            <li key={photo.src}>
              <button
                type="button"
                onClick={() => { setPlaying(false); go(i) }}
                aria-label={`Show photo ${i + 1} of ${photos.length}`}
                aria-current={i === index ? 'true' : undefined}
                className={`block h-2 rounded-pill transition-all duration-300 ${
                  i === index ? 'w-6 bg-white' : 'w-2 bg-white/55 hover:bg-white/80'
                }`}
              />
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setPlaying((v) => !v)}
          aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}
          className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded-pill bg-white/20 text-white backdrop-blur-sm transition-colors duration-200 hover:bg-white/35"
        >
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Announces slide changes without moving focus. */}
      <span className="sr-only" aria-live="polite">
        Photo {index + 1} of {photos.length}
      </span>
    </div>
  )
}

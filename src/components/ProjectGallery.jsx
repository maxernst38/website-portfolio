import { useState } from 'react'
import Media from './Media.jsx'
import { Play } from './icons.jsx'

/**
 * The media gallery on a project page: stills and clips, in the order site.js
 * lists them.
 *
 * This site has no live demos — projects are shown, not driven, and the code
 * itself lives on GitHub. So this is the main event on a project page rather
 * than decoration, which is why the first item runs full width and loads
 * eagerly instead of sitting in a uniform grid.
 *
 * Videos are click-to-load. A YouTube <iframe> costs ~700 kB and sets cookies
 * the moment it mounts, so what renders at rest is a poster and a play button;
 * the iframe is only created once someone actually asks for it. That keeps a
 * project page cheap for the majority who scroll past, and means no
 * third-party frame loads for anyone who never presses play.
 */

function YouTubeEmbed({ id, poster, alt, eager }) {
  const [playing, setPlaying] = useState(false)

  if (playing) {
    return (
      <div className="relative overflow-hidden rounded-card bg-chrome" style={{ aspectRatio: '16 / 9' }}>
        <iframe
          // autoplay is correct here: the visitor just clicked play. It is not
          // autoplay-on-load, which is what the policy actually objects to.
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={alt || 'Project video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={alt ? `Play video: ${alt}` : 'Play video'}
      className="group/play relative block w-full overflow-hidden rounded-card border border-hairline bg-chrome"
      style={{ aspectRatio: '16 / 9' }}
    >
      {poster ? (
        <img
          src={poster}
          alt=""
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-soft group-hover/play:scale-[1.02]"
        />
      ) : (
        <span className="absolute inset-0 bg-gradient-to-br from-chrome-raised to-chrome" aria-hidden="true" />
      )}

      {/* Scrim: keeps the play button legible over a bright poster. */}
      <span className="absolute inset-0 bg-black/25 transition-colors duration-200 group-hover/play:bg-black/35" aria-hidden="true" />

      <span className="absolute inset-0 grid place-items-center" aria-hidden="true">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/95 shadow-card-hover transition-transform duration-200 group-hover/play:scale-105">
          {/* pl-0.5 optically centres the triangle, which is visually
              right-heavy inside a circle. */}
          <Play className="h-6 w-6 pl-0.5 text-ink" />
        </span>
      </span>

      {alt && (
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-10 text-left text-sm text-white">
          {alt}
        </span>
      )}
    </button>
  )
}

function GalleryItem({ item, eager }) {
  if (item.kind === 'video') {
    if (item.provider === 'youtube' && item.id) {
      return <YouTubeEmbed id={item.id} poster={item.poster} alt={item.alt} eager={eager} />
    }
    // An unrecognised provider, or a video with no id yet: fall through to the
    // placeholder rather than rendering a dead play button.
    return <Media src={null} alt={item.alt} ratio="16/9" className="border border-hairline" />
  }

  return (
    <figure>
      <Media
        src={item.src}
        alt={item.alt}
        ratio="16/9"
        eager={eager}
        className="border border-hairline"
      />
      {item.alt && (
        <figcaption className="mt-2 text-sm text-muted">{item.alt}</figcaption>
      )}
    </figure>
  )
}

export default function ProjectGallery({ media = [], className = '' }) {
  const items = media.filter(Boolean)
  if (items.length === 0) return null

  const [lead, ...rest] = items

  return (
    <div className={className}>
      <GalleryItem item={lead} eager />

      {/* Two-up below the lead: enough to read a still at, without making the
          page a scroll marathon when a project has six of them. */}
      {rest.length > 0 && (
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {rest.map((item, i) => (
            <GalleryItem key={item.id ?? item.src ?? item.alt ?? i} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}

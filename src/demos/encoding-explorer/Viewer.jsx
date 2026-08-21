/* AUTO-SYNCED from Latent-Space-3D-Explorer/web/src — do not edit here.
   Change it in that repo and re-run: node scripts/sync_portfolio.mjs */

/**
 * The viewer component. This file is the portable unit: `scripts/sync_portfolio.mjs`
 * copies it, scene.js, loadBundle.js and palette.js into the portfolio site as
 * source, where Vite code-splits three.js into the demo's lazy chunk.
 *
 * Styling uses the portfolio's design tokens (text-ink, border-hairline,
 * rounded-card, brand-600 …) so the embedded copy matches the surrounding page
 * with no overrides. web/src/index.css redeclares those same tokens so the
 * standalone build looks identical — if you rename one, rename it in both.
 *
 * Every Tailwind class here is written out in full. Tailwind v4 never sees
 * classes assembled at runtime, so per-class colours come from inline styles.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { loadBundle } from './loadBundle.js'
import { highlightColor } from './palette.js'
import { createScene } from './scene.js'

const MAX_HIGHLIGHTS = 8

export default function Viewer({ bundleUrl, height = 520 }) {
  const canvasRef = useRef(null)
  const sceneRef = useRef(null)
  const wrapRef = useRef(null)

  const [bundle, setBundle] = useState(null)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState([]) // class ids, in click order
  const [search, setSearch] = useState('')
  const [hovered, setHovered] = useState(-1)
  const [labels, setLabels] = useState([])
  const [tooltip, setTooltip] = useState(null)
  const [options, setOptions] = useState({
    showCentroids: true,
    showHulls: false,
    showAxes: false,
    outlierMode: false,
    spinning: true,
  })

  /* ── Data ───────────────────────────────────────────────────────────── */

  useEffect(() => {
    const controller = new AbortController()
    setBundle(null)
    setError(null)
    setSelected([])

    loadBundle(bundleUrl, { signal: controller.signal })
      .then(setBundle)
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message)
      })

    return () => controller.abort()
  }, [bundleUrl])

  /* ── Scene lifecycle ────────────────────────────────────────────────── */

  useEffect(() => {
    if (!canvasRef.current) return
    const scene = createScene(canvasRef.current)
    scene.onHover(setHovered)
    scene.onLabels(setLabels)
    sceneRef.current = scene

    // Respect the same motion preference the rest of the site does.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setOptions((o) => ({ ...o, spinning: false }))
    }

    return () => {
      scene.dispose()
      sceneRef.current = null
    }
  }, [])

  // A spinning WebGL canvas the visitor has scrolled past is pure battery drain.
  useEffect(() => {
    const node = wrapRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => sceneRef.current?.setRunning(entry.isIntersecting),
      { threshold: 0.01 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (bundle) sceneRef.current?.setBundle(bundle)
  }, [bundle])

  const highlights = useMemo(
    () => new Map(selected.map((id, i) => [id, highlightColor(i)])),
    [selected],
  )

  useEffect(() => {
    sceneRef.current?.setHighlights(highlights)
  }, [highlights])

  useEffect(() => {
    sceneRef.current?.setOptions(options)
  }, [options])

  /* ── Interaction ────────────────────────────────────────────────────── */

  const onPointerMove = useCallback((event) => {
    sceneRef.current?.setPointer(event)
    const rect = event.currentTarget.getBoundingClientRect()
    setTooltip({ x: event.clientX - rect.left, y: event.clientY - rect.top })
  }, [])

  const onPointerLeave = useCallback(() => {
    sceneRef.current?.clearPointer()
    setTooltip(null)
  }, [])

  const toggleClass = useCallback((id) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((c) => c !== id)
        : current.length >= MAX_HIGHLIGHTS
          ? current
          : [...current, id],
    )
  }, [])

  const toggleOption = useCallback((key) => {
    setOptions((current) => ({ ...current, [key]: !current[key] }))
  }, [])

  /* ── Render ─────────────────────────────────────────────────────────── */

  if (error) {
    return (
      <div className="rounded-card border border-dashed border-hairline-strong bg-surface-subtle p-10 text-center">
        <p className="font-medium text-ink">Could not load that dataset.</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-body">{error}</p>
      </div>
    )
  }

  const classes = bundle?.manifest.classes ?? []
  const visibleClasses = search
    ? classes.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : classes
  const soloClass = selected.length === 1 ? classes[selected[0]] : null

  return (
    <div
      ref={wrapRef}
      className="overflow-hidden rounded-card border border-hairline bg-surface-subtle"
    >
      <div className="relative" style={{ height }}>
        <canvas
          ref={canvasRef}
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          className="block h-full w-full cursor-grab touch-none active:cursor-grabbing"
          role="img"
          aria-label={
            bundle
              ? `${bundle.manifest.count} images from ${bundle.manifest.name}, positioned in 3D by visual similarity. Drag to rotate.`
              : 'Loading the embedding view'
          }
        />

        {!bundle && (
          <div className="absolute inset-0 grid place-items-center" role="status">
            <div className="flex flex-col items-center gap-3">
              <span
                className="h-6 w-6 animate-spin rounded-pill border-2 border-brand-200 border-t-brand-600"
                aria-hidden="true"
              />
              <span className="text-sm text-muted">Loading embeddings…</span>
            </div>
          </div>
        )}

        {bundle && <Stats manifest={bundle.manifest} outlierMode={options.outlierMode} />}

        {labels.map((label) => (
          <span
            key={label.id}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-input px-1.5 py-0.5 text-xs font-medium"
            style={{
              left: label.x,
              top: label.y - 10,
              color: label.color,
              background: 'rgba(255,255,255,0.82)',
            }}
          >
            {label.name}
          </span>
        ))}

        {bundle && tooltip && hovered >= 0 && (
          <HoverCard bundle={bundle} index={hovered} at={tooltip} height={height} />
        )}
      </div>

      {bundle && (
        <Controls
          classes={visibleClasses}
          allClasses={classes}
          selected={selected}
          highlights={highlights}
          search={search}
          onSearch={setSearch}
          onToggleClass={toggleClass}
          onClearClasses={() => setSelected([])}
          options={options}
          onToggleOption={toggleOption}
          onReset={() => sceneRef.current?.resetCamera()}
          onFocus={() => soloClass && sceneRef.current?.focusClass(soloClass.id)}
          canFocus={Boolean(soloClass?.centroid)}
        />
      )}

      {bundle && soloClass?.eigenImages && !options.outlierMode && (
        <EigenStrip bundle={bundle} entry={soloClass} color={highlights.get(soloClass.id)} />
      )}
    </div>
  )
}

/* ── Pieces ───────────────────────────────────────────────────────────── */

function Stats({ manifest, outlierMode }) {
  return (
    <div className="pointer-events-none absolute left-4 top-4 rounded-input bg-white/80 px-3 py-2 text-xs text-muted backdrop-blur-sm">
      <p className="font-medium text-ink">{manifest.name}</p>
      <p className="mt-0.5">
        {manifest.count.toLocaleString()} images · {manifest.classes.length} classes
      </p>
      <p className="mt-0.5">
        {outlierMode
          ? 'Colour = distance from own class centroid'
          : `3 components hold ${(manifest.projection.totalExplained * 100).toFixed(0)}% of variance`}
      </p>
    </div>
  )
}

function HoverCard({ bundle, index, at, height }) {
  const { manifest, items, atlas } = bundle
  const names = items.classes[index].map((id) => manifest.classes[id]?.name).filter(Boolean)
  const distance = items.distance[index]

  // Flip the card across the cursor near the edges so it never leaves the canvas.
  const flipX = at.x > 260
  const flipY = at.y > height - 150

  return (
    <div
      className="pointer-events-none absolute z-10 w-max max-w-[240px] rounded-card border border-hairline bg-white p-2 shadow-card-hover"
      style={{
        left: at.x + (flipX ? -12 : 12),
        top: at.y + (flipY ? -12 : 12),
        transform: `translate(${flipX ? '-100%' : '0'}, ${flipY ? '-100%' : '0'})`,
      }}
    >
      {atlas && (
        <div
          className="rounded-input bg-surface-subtle bg-no-repeat"
          style={atlas.styleFor(index, 128)}
          aria-hidden="true"
        />
      )}
      <p className="mt-2 max-w-[128px] truncate text-xs font-medium text-ink">
        {items.name[index]}
      </p>
      {names.length > 0 && <p className="text-xs text-muted">{names.join(', ')}</p>}
      {distance !== null && (
        <p className="text-xs text-muted">
          {distance.toFixed(2)} from centroid
          {distance >= manifest.outlierThreshold && (
            <span className="ml-1 font-medium text-brand-600">· outlier</span>
          )}
        </p>
      )}
    </div>
  )
}

function Controls({
  classes,
  allClasses,
  selected,
  highlights,
  search,
  onSearch,
  onToggleClass,
  onClearClasses,
  options,
  onToggleOption,
  onReset,
  onFocus,
  canFocus,
}) {
  const toggles = [
    { key: 'showCentroids', label: 'Centroids' },
    { key: 'showHulls', label: 'Hulls' },
    { key: 'showAxes', label: 'Variance axis' },
    { key: 'outlierMode', label: 'Outliers' },
    { key: 'spinning', label: 'Spin' },
  ]

  return (
    <div className="border-t border-hairline bg-white">
      <div className="flex flex-wrap items-center gap-2 px-4 py-3">
        {toggles.map((toggle) => (
          <button
            key={toggle.key}
            type="button"
            onClick={() => onToggleOption(toggle.key)}
            aria-pressed={options[toggle.key]}
            className={
              options[toggle.key]
                ? 'inline-flex h-8 items-center rounded-pill border border-brand-200 bg-brand-50 px-3 text-xs font-medium text-brand-700'
                : 'inline-flex h-8 items-center rounded-pill border border-hairline bg-white px-3 text-xs font-medium text-body hover:border-brand-200'
            }
          >
            {toggle.label}
          </button>
        ))}

        <span className="ml-auto flex gap-2">
          {canFocus && (
            <button
              type="button"
              onClick={onFocus}
              className="inline-flex h-8 items-center rounded-pill border border-hairline bg-white px-3 text-xs font-medium text-body hover:border-brand-200"
            >
              Fly to class
            </button>
          )}
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-8 items-center rounded-pill border border-hairline bg-white px-3 text-xs font-medium text-body hover:border-brand-200"
          >
            Reset view
          </button>
        </span>
      </div>

      {!options.outlierMode && (
        <div className="border-t border-hairline px-4 py-3">
          <div className="mb-2 flex items-center gap-3">
            <input
              type="search"
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder={`Filter ${allClasses.length} classes…`}
              className="h-8 w-48 rounded-input border border-hairline px-2.5 text-xs text-ink placeholder:text-muted"
            />
            <p className="text-xs text-muted">
              {selected.length
                ? `${selected.length} of ${MAX_HIGHLIGHTS} highlighted`
                : 'Pick a class to colour it'}
            </p>
            {selected.length > 0 && (
              <button
                type="button"
                onClick={onClearClasses}
                className="text-xs font-medium text-brand-600 hover:text-brand-700"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex max-h-24 flex-wrap gap-1.5 overflow-y-auto">
            {classes.map((entry) => {
              const color = highlights.get(entry.id)
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => onToggleClass(entry.id)}
                  aria-pressed={Boolean(color)}
                  className="inline-flex h-7 items-center gap-1.5 rounded-pill border px-2.5 text-xs font-medium"
                  style={
                    color
                      ? { borderColor: color, color, background: `${color}14` }
                      : undefined
                  }
                >
                  <span
                    className="h-2 w-2 rounded-pill"
                    style={{ background: color ?? '#cbd5e1' }}
                    aria-hidden="true"
                  />
                  {entry.name}
                  <span className="text-muted">{entry.count}</span>
                </button>
              )
            })}
            {classes.length === 0 && (
              <p className="text-xs text-muted">No class matches “{search}”.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * The images at either end of a class's axis of maximum variance — what the
 * cluster's longest dimension actually corresponds to, shown rather than named.
 */
function EigenStrip({ bundle, entry, color }) {
  const { atlas, items } = bundle
  if (!atlas) return null

  const row = (indices, label) => (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 text-right text-xs text-muted">{label}</span>
      <div className="flex gap-1.5 overflow-x-auto">
        {indices.map((index) => (
          <div
            key={index}
            className="shrink-0 rounded-input border border-hairline bg-no-repeat"
            style={atlas.styleFor(index, 56)}
            title={items.name[index]}
          />
        ))}
      </div>
    </div>
  )

  return (
    <div className="border-t border-hairline bg-white px-4 py-3">
      <p className="mb-2 text-xs text-muted">
        <span className="font-medium" style={{ color }}>
          {entry.name}
        </span>{' '}
        along its axis of maximum variance — the two ends of what this class varies in.
      </p>
      <div className="space-y-1.5">
        {row(entry.eigenImages.low, 'one end')}
        {row(entry.eigenImages.high, 'other end')}
      </div>
    </div>
  )
}

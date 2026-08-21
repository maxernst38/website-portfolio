/* AUTO-SYNCED from Latent-Space-3D-Explorer/web/src — do not edit here.
   Change it in that repo and re-run: node scripts/sync_portfolio.mjs */

/**
 * Entry point for the embedded portfolio demo.
 *
 * `scripts/sync_portfolio.mjs` copies this file into the portfolio as
 * src/demos/encoding-explorer/index.jsx, alongside Viewer.jsx and its modules.
 * It is kept here rather than written by hand over there so that the demo and
 * the viewer it embeds stay in one repo, reviewed together.
 *
 * The registry lazy-loads this, so three.js lands in its own chunk and costs
 * the rest of the site nothing until someone opens the project page.
 */

import { useEffect, useState } from 'react'
import Viewer from './Viewer.jsx'

// Bundles are synced into the site's public/ directory, so they're fetched by
// URL at runtime rather than imported and hashed by Vite.
const BUNDLES_ROOT = '/bundles'

export default function EncodingExplorerDemo() {
  const [bundles, setBundles] = useState(null)
  const [active, setActive] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetch(`${BUNDLES_ROOT}/index.json`)
      .then((response) => (response.ok ? response.json() : []))
      .then((list) => {
        if (cancelled) return
        setBundles(list)
        setActive(list[0] ?? null)
      })
      // An empty list renders the viewer's own "could not load" state, which is
      // a better failure than throwing into the page's error boundary.
      .catch(() => !cancelled && setBundles([]))
    return () => {
      cancelled = true
    }
  }, [])

  if (!bundles) {
    return (
      <div
        className="grid min-h-[420px] place-items-center rounded-card border border-hairline bg-surface-subtle"
        role="status"
      >
        <span className="text-sm text-muted">Loading datasets…</span>
      </div>
    )
  }

  return (
    <div>
      {bundles.length > 1 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {bundles.map((bundle) => (
            <button
              key={bundle.id}
              type="button"
              onClick={() => setActive(bundle)}
              aria-pressed={active?.id === bundle.id}
              className={
                active?.id === bundle.id
                  ? 'inline-flex h-8 items-center rounded-pill border border-brand-200 bg-brand-50 px-3 text-xs font-medium text-brand-700'
                  : 'inline-flex h-8 items-center rounded-pill border border-hairline bg-white px-3 text-xs font-medium text-body hover:border-brand-200'
              }
            >
              {bundle.name}
              <span className="ml-1.5 text-muted">{bundle.count}</span>
            </button>
          ))}
        </div>
      )}

      <Viewer
        bundleUrl={active ? `${BUNDLES_ROOT}/${active.id}` : `${BUNDLES_ROOT}/missing`}
        height={500}
      />

      <p className="mt-3 text-sm text-muted">
        Every point is one image, placed by what CLIP sees in it. Drag to rotate, hover a
        point to see the picture, and pick a class to colour it. “Outliers” shades each
        image by how far it sits from its own class centroid — which is where mislabelled
        data tends to show up.
      </p>
    </div>
  )
}

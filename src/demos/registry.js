import { lazy } from 'react'

/**
 * LIVE DEMO REGISTRY
 *
 * Each entry is an interactive app that runs inside a project page at
 * /projects/<project-slug>. To attach one to a project, set that project's
 * `demo` field in src/content/site.js to the key used here.
 *
 * Every demo is behind `lazy(() => import(...))`, which makes Vite split it
 * into its own chunk. Nothing here is downloaded until a visitor actually
 * opens that project — so a demo pulling in three.js or deck.gl (hundreds of
 * kB) costs the rest of the site nothing.
 *
 * To add a demo:
 *   1. Create src/demos/<name>/index.jsx exporting a default component
 *   2. Register it below
 *   3. Point a project at it: `demo: '<name>'` in site.js
 *
 * The component gets the full content width and should manage its own height.
 * It runs entirely in the browser — there is no server behind this site.
 *
 * NOTE: src/demos/encoding-explorer/ and public/bundles/ are generated, not
 * hand-written. They are copied in from the Latent-Space-3D-Explorer repo by
 * its scripts/sync_portfolio.mjs; edit them there and re-run that script, or
 * the next sync silently discards the change.
 */
export const demos = {
  'encoding-explorer': {
    label: 'Explore the embedding space',
    // Shown under the heading, to set expectations before it loads.
    note: 'Runs entirely in your browser — nothing is uploaded.',
    load: lazy(() => import('./encoding-explorer/index.jsx')),
  },
}

export function getDemo(key) {
  return key ? demos[key] ?? null : null
}

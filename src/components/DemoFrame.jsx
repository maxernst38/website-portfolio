import { Component, Suspense } from 'react'

/**
 * Wrapper every live demo mounts inside.
 *
 * Two jobs, both about containment: show something sensible while the demo's
 * chunk downloads, and stop a crashing demo from taking the whole site down.
 * An experimental demo throwing during render would otherwise white-screen the
 * page — including the navbar — which is a bad trade for an optional extra.
 */
class DemoErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[demo] crashed:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="rounded-card border border-dashed border-hairline-strong bg-surface-subtle p-10 text-center">
          <p className="font-medium text-ink">This demo hit a problem.</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-body">
            The rest of the page is fine — it&rsquo;s just this widget. Reloading usually
            sorts it, and the source link above always works.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            className="mt-5 inline-flex h-11 items-center rounded-input border border-hairline bg-white px-5 text-sm font-medium text-ink hover:border-brand-200"
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function DemoSkeleton() {
  return (
    <div
      className="grid min-h-[420px] place-items-center rounded-card border border-hairline bg-surface-subtle"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3">
        <span
          className="h-6 w-6 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600"
          aria-hidden="true"
        />
        <span className="text-sm text-muted">Loading demo…</span>
      </div>
    </div>
  )
}

export default function DemoFrame({ children }) {
  return (
    <DemoErrorBoundary>
      <Suspense fallback={<DemoSkeleton />}>{children}</Suspense>
    </DemoErrorBoundary>
  )
}

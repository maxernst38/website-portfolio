import { useCopyToClipboard } from '../hooks/useCopyToClipboard.js'
import { Check, Copy } from './icons.jsx'

/** Copy-to-clipboard with a short "Copied!" confirmation. */
export default function CopyButton({
  value,
  label = 'Copy email',
  copiedLabel = 'Copied!',
  className = '',
}) {
  const { copied, copy } = useCopyToClipboard()

  return (
    <button
      type="button"
      onClick={() => copy(value)}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-input border border-hairline bg-white px-5 text-sm font-medium text-ink transition-[background-color,border-color] duration-200 hover:border-brand-200 hover:bg-brand-50/60 ${className}`}
    >
      {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
      {/* aria-live so screen readers hear the confirmation, not just see it. */}
      <span aria-live="polite">{copied ? copiedLabel : label}</span>
    </button>
  )
}

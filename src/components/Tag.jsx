/**
 * Small chip for tech tags and skills.
 *
 * Monospaced and square-cornered rather than a rounded pill: these are labels
 * on a specification, and the pill shape was the softest thing on the page.
 */
const TONES = {
  neutral: 'bg-surface-subtle text-body border-hairline',
  brand: 'bg-brand-50 text-brand-700 border-brand-200',
}

export default function Tag({ tone = 'neutral', className = '', children }) {
  return (
    <span
      className={`inline-flex items-center rounded-input border px-2 py-0.5 font-mono text-xs ${
        TONES[tone] ?? TONES.neutral
      } ${className}`}
    >
      {children}
    </span>
  )
}

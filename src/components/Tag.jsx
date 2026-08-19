/** Small pill for tech tags and skills. */
const TONES = {
  neutral: 'bg-surface-subtle text-body border-hairline',
  brand: 'bg-brand-50 text-brand-700 border-brand-100',
}

export default function Tag({ tone = 'neutral', className = '', children }) {
  return (
    <span
      className={`inline-flex items-center rounded-pill border px-2.5 py-1 text-xs font-medium ${
        TONES[tone] ?? TONES.neutral
      } ${className}`}
    >
      {children}
    </span>
  )
}

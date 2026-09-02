/** Eyebrow / heading / description trio, used at the top of every section. */
export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  as: Tag = 'h2',
  className = '',
}) {
  const centered = align === 'center'
  return (
    <div className={`${centered ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'} ${className}`}>
      {eyebrow && (
        <p
          className={`flex items-center gap-2.5 font-mono text-eyebrow font-semibold uppercase text-brand-600 ${
            centered ? 'justify-center' : ''
          }`}
        >
          {/* Short rule before the label — a section marker rather than a
              caption. Hidden when centred, where it would read as a strikethrough. */}
          {!centered && <span className="h-px w-6 bg-brand-400" aria-hidden="true" />}
          {eyebrow}
        </p>
      )}
      <Tag className={`text-title ${eyebrow ? 'mt-3' : ''}`}>{title}</Tag>
      {description && <p className="mt-4 text-lg text-body">{description}</p>}
    </div>
  )
}

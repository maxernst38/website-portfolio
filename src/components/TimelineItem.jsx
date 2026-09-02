import Tag from './Tag.jsx'

/**
 * One entry on the resume timeline. Used for BOTH experience and education —
 * site.js deliberately gives them an identical shape so this component is
 * written once.
 */
export default function TimelineItem({ item, isLast = false }) {
  const current = item.end === 'Present'

  return (
    <li className={`relative pl-8 print-break-inside-avoid ${isLast ? '' : 'pb-10'}`}>
      {/* Timeline dot. The rail itself is a border on the parent <ol>. */}
      {/* Square rather than round, to match the chip and card corners. */}
      <span
        className={`absolute left-0 top-1.5 h-3 w-3 rotate-45 border border-brand-600 ${
          current ? 'bg-accent ring-4 ring-brand-100' : 'bg-surface'
        }`}
        aria-hidden="true"
      />

      <h3 className="text-base font-semibold text-ink">{item.title}</h3>

      <p className="mt-0.5 text-sm font-medium text-brand-600">
        {item.orgUrl ? (
          <a
            href={item.orgUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-700"
          >
            {item.org}
          </a>
        ) : (
          item.org
        )}
      </p>

      <p className="mt-1 font-mono text-xs tabular-nums text-muted">
        {item.start} – {item.end}
        {item.location ? ` · ${item.location}` : ''}
      </p>

      {item.bullets?.length > 0 && (
        <ul className="mt-3 space-y-2">
          {item.bullets.map((bullet) => (
            <li key={bullet} className="relative pl-4 text-sm text-body">
              <span
                className="absolute left-0 top-2 h-1.5 w-1.5 rounded-full bg-hairline-strong"
                aria-hidden="true"
              />
              {bullet}
            </li>
          ))}
        </ul>
      )}

      {item.tags?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      )}
    </li>
  )
}

import { Link } from 'react-router'
import Card from './Card.jsx'
import Media from './Media.jsx'
import Tag from './Tag.jsx'
import { iconMap, ArrowRight, ExternalLink } from './icons.jsx'

/**
 * A project card contains its own links, so — unlike NavCard — the card itself
 * must NOT be a link: nesting interactive elements is invalid HTML. Instead the
 * hover treatment is mirrored with focus-within, so keyboard users get the same
 * affordance when they tab into it.
 */
export default function ProjectCard({ project }) {
  return (
    <Card
      interactive={false}
      className="flex h-full flex-col transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover focus-within:-translate-y-0.5 focus-within:border-brand-200 focus-within:shadow-card-hover"
    >
      <div className="relative">
        <Media
          {...project.image}
          ratio="16/9"
          rounded="rounded-none"
          imgClassName="transition-transform duration-500 ease-soft group-hover:scale-[1.03]"
        />
        {project.demo && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-pill bg-white/90 px-2.5 py-1 text-xs font-medium text-ink shadow-card backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            Live demo
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-eyebrow font-semibold uppercase text-muted">
          {project.year} · {project.role}
        </p>

        <h3 className="mt-2 text-lg font-semibold text-ink">
          {/* Links to the project's own page, where the full write-up and any
              live demo live. External links stay in the row at the bottom. */}
          <Link
            to={`/projects/${project.slug}`}
            className="transition-colors duration-200 hover:text-brand-600"
          >
            {project.title}
          </Link>
        </h3>

        <p className="mt-2 text-sm text-body">{project.blurb}</p>

        {project.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        )}

        <Link
          to={`/projects/${project.slug}`}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600"
        >
          {project.demo ? 'Try it live' : 'Read more'}
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>

        {project.links.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-4 border-t border-hairline pt-4">
            {project.links.map((link) => {
              const Glyph = iconMap[link.icon] ?? ExternalLink
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 transition-colors duration-200 hover:text-brand-700"
                >
                  <Glyph className="h-4 w-4" />
                  {link.label}
                </a>
              )
            })}
          </div>
        )}
      </div>
    </Card>
  )
}

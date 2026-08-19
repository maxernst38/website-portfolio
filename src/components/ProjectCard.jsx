import Card from './Card.jsx'
import Media from './Media.jsx'
import Tag from './Tag.jsx'
import { iconMap, ExternalLink } from './icons.jsx'

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
      <Media
        {...project.image}
        ratio="16/9"
        rounded="rounded-none"
        imgClassName="transition-transform duration-500 ease-soft group-hover:scale-[1.03]"
      />

      <div className="flex flex-1 flex-col p-5">
        <p className="text-eyebrow font-semibold uppercase text-muted">
          {project.year} · {project.role}
        </p>

        <h3 className="mt-2 text-lg font-semibold text-ink">
          {project.links[0]?.href && !project.links[0].href.startsWith('TODO') ? (
            <a
              href={project.links[0].href}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-200 hover:text-brand-600"
            >
              {project.title}
            </a>
          ) : (
            project.title
          )}
        </h3>

        <p className="mt-2 text-sm text-body">{project.blurb}</p>

        {project.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        )}

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

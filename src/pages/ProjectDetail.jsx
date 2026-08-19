import { useEffect } from 'react'
import { Link, useParams } from 'react-router'
import DemoFrame from '../components/DemoFrame.jsx'
import Media from '../components/Media.jsx'
import Section from '../components/Section.jsx'
import Tag from '../components/Tag.jsx'
import { iconMap, ArrowRight, ExternalLink } from '../components/icons.jsx'
import { profile, projects } from '../content/site.js'
import { getDemo } from '../demos/registry.js'
import NotFound from './NotFound.jsx'

export default function ProjectDetail() {
  const { slug } = useParams()
  const project = projects.find((p) => p.slug === slug)
  const demo = getDemo(project?.demo)

  // seo.pages has no entry for dynamic routes, so usePageMeta leaves the title
  // alone and this sets it. Child effects run before the parent's, so this is
  // not overwritten.
  useEffect(() => {
    if (project) document.title = `${project.title} — ${profile.name}`
  }, [project])

  if (!project) return <NotFound />

  return (
    <Section>
      <Link
        to="/projects"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors duration-200 hover:text-brand-600"
      >
        <ArrowRight className="h-4 w-4 rotate-180" />
        All projects
      </Link>

      <header className="mt-6 max-w-2xl">
        <p className="text-eyebrow font-semibold uppercase text-muted">
          {project.year} · {project.role}
        </p>
        <h1 className="mt-3 text-title">{project.title}</h1>
        <p className="mt-4 text-lg text-body">{project.description}</p>

        {project.tags?.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        )}

        {project.links?.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-4">
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
      </header>

      {demo ? (
        <section className="mt-12" aria-label={demo.label}>
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-eyebrow font-semibold uppercase text-muted">{demo.label}</h2>
            {demo.note && <p className="text-sm text-muted">{demo.note}</p>}
          </div>
          <DemoFrame>
            <demo.load />
          </DemoFrame>
        </section>
      ) : (
        <div className="mt-12">
          <Media {...project.image} ratio="16/9" className="border border-hairline" />
        </div>
      )}
    </Section>
  )
}

import { useEffect } from 'react'
import { Link, useParams } from 'react-router'
import Button from '../components/Button.jsx'
import ProjectGallery from '../components/ProjectGallery.jsx'
import Section from '../components/Section.jsx'
import Tag from '../components/Tag.jsx'
import { iconMap, ArrowRight, ExternalLink } from '../components/icons.jsx'
import { profile, projects } from '../content/site.js'
import NotFound from './NotFound.jsx'

export default function ProjectDetail() {
  const { slug } = useParams()
  const project = projects.find((p) => p.slug === slug)

  // seo.pages has no entry for dynamic routes, so usePageMeta leaves the title
  // alone and this sets it. Child effects run before the parent's, so this is
  // not overwritten.
  useEffect(() => {
    if (project) document.title = `${project.title} — ${profile.name}`
  }, [project])

  if (!project) return <NotFound />

  // The repo is the call to action on every project page: there is nothing to
  // interact with here, so the next step for an interested reader is the code.
  // It gets a real button; anything else stays a plain text link beside it.
  const links = project.links ?? []
  const source = links.find((l) => l.icon === 'github')
  const others = links.filter((l) => l !== source)

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
        <p className="font-mono text-eyebrow font-semibold uppercase text-muted">
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

        {links.length > 0 && (
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
            {source && (
              <Button
                href={source.href}
                variant="primary"
                icon={iconMap.github}
                iconPosition="left"
                target="_blank"
                rel="noopener noreferrer"
              >
                Code and usage on GitHub
              </Button>
            )}

            {others.map((link) => {
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

      <ProjectGallery media={project.media} className="mt-12" />
    </Section>
  )
}

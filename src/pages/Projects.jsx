import ProjectCard from '../components/ProjectCard.jsx'
import Reveal from '../components/Reveal.jsx'
import Section from '../components/Section.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import { projects } from '../content/site.js'

export default function Projects() {
  return (
    <Section>
      <Reveal>
        <SectionHeading
          eyebrow="Projects"
          title="Things I’ve built."
          description="A few projects worth talking about — what the problem was, what I made, and how it turned out."
          as="h1"
        />
      </Reveal>

      {projects.length === 0 ? (
        <p className="mt-10 rounded-card border border-dashed border-hairline-strong p-10 text-center text-body">
          Nothing here yet — projects are on the way.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:gap-8">
          {projects.map((project, i) => (
            <Reveal key={project.slug} delay={i * 80}>
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
      )}
    </Section>
  )
}

import Button from '../components/Button.jsx'
import Section from '../components/Section.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import { ArrowRight } from '../components/icons.jsx'

export default function NotFound() {
  return (
    <Section className="min-h-[60vh] grid place-items-center">
      <div>
        <SectionHeading
          eyebrow="404"
          title="This page took a wrong turn."
          description="The link may be out of date, or the page may have moved. Everything else is still where you left it."
          align="center"
          as="h1"
        />
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button to="/" icon={ArrowRight}>Back home</Button>
          <Button to="/projects" variant="secondary">See my work</Button>
        </div>
      </div>
    </Section>
  )
}

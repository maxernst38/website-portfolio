import Button from '../components/Button.jsx'
import Card from '../components/Card.jsx'
import Reveal from '../components/Reveal.jsx'
import Section from '../components/Section.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import Tag from '../components/Tag.jsx'
import { Mail } from '../components/icons.jsx'
import { contact, tutoring } from '../content/site.js'

function SubHeading({ children }) {
  return (
    <h2 className="font-mono text-eyebrow font-semibold uppercase text-muted">{children}</h2>
  )
}

export default function Tutoring() {
  const mailto = `mailto:${contact.email}?subject=${encodeURIComponent(tutoring.emailSubject)}`

  return (
    <>
      <Section>
        <SectionHeading
          eyebrow="Tutoring"
          title={tutoring.headline}
          description={tutoring.blurb}
          as="h1"
        />
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href={mailto} icon={Mail} iconPosition="left">
            Book an intro call
          </Button>
        </div>

        <section className="mt-16">
          <SubHeading>Subjects</SubHeading>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {tutoring.subjects.map((subject, i) => (
              <Reveal key={subject.title} delay={(i % 3) * 90}>
                <Card interactive={false} className="flex h-full flex-col p-6">
                  <h3 className="text-lg font-semibold text-ink">{subject.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-body">{subject.description}</p>
                  {subject.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {subject.tags.map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </div>
                  )}
                </Card>
              </Reveal>
            ))}
          </div>
        </section>
      </Section>

      <Section bg="subtle">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12">
          <section className="lg:col-span-5">
            <SubHeading>Sessions</SubHeading>
            <div className="mt-5 space-y-4">
              {tutoring.formats.map((format) => (
                <Card key={format.title} interactive={false} className="p-6">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-lg font-semibold text-ink">{format.title}</h3>
                    <p className="shrink-0 font-mono text-sm text-brand-600">
                      {format.rate ?? 'Rates on request'}
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-body">{format.description}</p>
                </Card>
              ))}
            </div>
          </section>

          <section className="mt-12 lg:col-span-7 lg:mt-0">
            <SubHeading>How it works</SubHeading>
            <ol className="mt-5 space-y-6">
              {tutoring.steps.map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-input border border-brand-200 bg-brand-50 font-mono text-sm font-semibold text-brand-700"
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-ink">{step.title}</h3>
                    <p className="mt-1 text-sm text-body">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-2xl">
          <SubHeading>Questions</SubHeading>
          <dl className="mt-5 divide-y divide-hairline border-y border-hairline">
            {tutoring.faqs.map((faq) => (
              <div key={faq.q} className="py-5">
                <dt className="font-semibold text-ink">{faq.q}</dt>
                <dd className="mt-1.5 text-body">{faq.a}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-12 rounded-card border border-hairline bg-surface-subtle p-6 text-center sm:p-8">
            <p className="text-lg font-semibold text-ink">Ready to start?</p>
            <p className="mt-2 text-sm text-muted">
              Tell me the subject, the level, and what you’re working towards.
            </p>
            <Button href={mailto} icon={Mail} iconPosition="left" className="mt-6">
              Email {contact.email}
            </Button>
          </div>
        </div>
      </Section>
    </>
  )
}

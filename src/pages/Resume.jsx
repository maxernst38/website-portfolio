import Button from '../components/Button.jsx'
import Section from '../components/Section.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import Tag from '../components/Tag.jsx'
import TimelineItem from '../components/TimelineItem.jsx'
import { Download } from '../components/icons.jsx'
import { profile, resume } from '../content/site.js'

function Timeline({ heading, items }) {
  return (
    <section className="mt-12 first:mt-0">
      <h2 className="text-eyebrow font-semibold uppercase text-muted">{heading}</h2>
      {/* The rail is a left border on the list; dots sit on top of it. */}
      <ol className="mt-5 border-l border-hairline pl-0 [&>li]:ml-[7px]">
        {items.map((item, i) => (
          <TimelineItem
            key={`${item.org}-${item.title}`}
            item={item}
            isLast={i === items.length - 1}
          />
        ))}
      </ol>
    </section>
  )
}

export default function Resume() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Resume"
        title="Experience & education."
        description={resume.summary}
        as="h1"
      />

      <div className="mt-12 lg:grid lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-8">
          <Timeline heading="Experience" items={resume.experience} />
          <Timeline heading="Education" items={resume.education} />
        </div>

        {/*
          `self-start` is required for sticky to work here: a stretched grid
          item fills the row and has nothing left to stick within.
          Order matters on mobile — recruiters read experience first.
        */}
        <aside className="mt-12 lg:col-span-4 lg:mt-0 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-card border border-hairline bg-surface-subtle p-6">
            <h2 className="text-eyebrow font-semibold uppercase text-muted">Skills</h2>
            <div className="mt-4 space-y-4">
              {resume.skills.map((group) => (
                <div key={group.group}>
                  <h3 className="text-sm font-semibold text-ink">{group.group}</h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {group.items.map((item) => (
                      <Tag key={item}>{item}</Tag>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {resume.facts?.length > 0 && (
              <dl className="mt-6 space-y-3 border-t border-hairline pt-6">
                {resume.facts.map((fact) => (
                  <div key={fact.label}>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                      {fact.label}
                    </dt>
                    <dd className="mt-0.5 text-sm text-ink">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {/* Appears automatically once profile.resumePdf is set in site.js. */}
            {profile.resumePdf && (
              <Button
                href={profile.resumePdf}
                variant="secondary"
                icon={Download}
                iconPosition="left"
                className="no-print mt-6 w-full"
                download
              >
                Download PDF
              </Button>
            )}
          </div>
        </aside>
      </div>
    </Section>
  )
}

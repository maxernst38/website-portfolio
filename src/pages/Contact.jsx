import Button from '../components/Button.jsx'
import CopyButton from '../components/CopyButton.jsx'
import Reveal from '../components/Reveal.jsx'
import Section from '../components/Section.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import SocialLinks from '../components/SocialLinks.jsx'
import { Mail } from '../components/icons.jsx'
import { contact } from '../content/site.js'

export default function Contact() {
  const mailto = `mailto:${contact.email}?subject=${encodeURIComponent(contact.emailSubject)}`

  return (
    <Section>
      <div className="mx-auto max-w-2xl">
        <SectionHeading
          eyebrow="Contact"
          title={contact.headline}
          description={contact.blurb}
          align="center"
          as="h1"
        />

        <Reveal delay={80}>
          <div className="mt-10 rounded-card border border-hairline bg-surface-subtle p-6 text-center sm:p-8">
            <p className="text-sm text-muted">Email me directly</p>
            {/* select-all makes the address one click to highlight. */}
            <p className="mt-2 select-all text-lg font-medium text-ink sm:text-xl">
              {contact.email}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button href={mailto} icon={Mail} iconPosition="left">
                Email me
              </Button>
              <CopyButton value={contact.email} />
            </div>
          </div>
        </Reveal>

        <Reveal delay={160}>
          <SocialLinks variant="tile" className="mt-6" />
        </Reveal>

        {/* ── OPTIONAL LATER: a real submitting contact form ────────────────────
            There is deliberately no form here. A form that looks like it works
            but silently drops messages is worse than no form at all — a
            recruiter would type a paragraph, hit Send, and never hear back.

            Two ways to add a working one:

            1. A Vercel Function (preferred — this site is already on Vercel).
               Create api/contact.js, read the fields from the request body, and
               send with Resend/Postmark/Nodemailer using an API key stored as a
               Vercel environment variable. The key stays server-side.

            2. A third-party endpoint, no backend: Web3Forms (web3forms.com) or
               Formspree. POST the fields to their URL with an access key. The
               key is public in client code — that is by design for these
               services; spam control is a honeypot field plus a captcha.

            Either way it is roughly 25 lines of JSX plus a useState for the
            idle/sending/sent/error states.
           ──────────────────────────────────────────────────────────────────── */}
      </div>
    </Section>
  )
}

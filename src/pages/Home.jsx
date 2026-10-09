import Button from '../components/Button.jsx'
import Slideshow from '../components/Slideshow.jsx'
import NavCard from '../components/NavCard.jsx'
import Reveal from '../components/Reveal.jsx'
import Section from '../components/Section.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import SocialLinks from '../components/SocialLinks.jsx'
import { ChevronDown } from '../components/icons.jsx'
import { heroCtas, homeCards, profile } from '../content/site.js'

/**
 * The hero is the third dark band, continuous with the navbar above it.
 *
 * The blueprint grid runs behind everything and is masked off at the bottom, so
 * the texture fades out rather than stopping on a hard line where the light
 * content begins.
 *
 * It fills the viewport below the sticky navbar -- hence the 4rem, which is the
 * navbar's h-16 -- so the Explore cue sits on the fold. min-h, not h, lets the
 * band grow instead of clipping on short landscape screens.
 */
function Hero() {
  return (
    <section
      data-chrome
      className="relative flex min-h-[calc(100svh-4rem)] flex-col overflow-hidden bg-chrome pb-10 pt-16 lg:pt-24"
    >
      <div
        className="blueprint pointer-events-none absolute inset-0"
        style={{ maskImage: 'linear-gradient(to bottom, #000 55%, transparent)' }}
        aria-hidden="true"
      />

      <div className="container-page relative flex flex-1 flex-col">
        <div className="grid flex-1 items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            {profile.availability && (
              <p className="inline-flex animate-fade-up items-center gap-2 rounded-pill border border-chrome-line bg-chrome-raised px-3 py-1 font-mono text-xs text-chrome-body">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                </span>
                {profile.availability}
              </p>
            )}

            <h1 className="mt-6 animate-fade-up text-display text-chrome-ink [animation-delay:80ms]">
              {profile.name}
            </h1>

            {/* Monospaced, so the role line reads as a readout rather than a
                subtitle. */}
            <p className="mt-4 animate-fade-up font-mono text-sm uppercase tracking-widest text-accent [animation-delay:160ms]">
              {profile.role} · {profile.location}
            </p>

            <p className="mt-5 max-w-xl animate-fade-up text-lg text-chrome-body [animation-delay:240ms]">
              {profile.bio}
            </p>

            <div className="mt-8 flex animate-fade-up flex-wrap items-center gap-3 [animation-delay:320ms]">
              {heroCtas.map((cta) => (
                <Button
                  key={cta.label}
                  to={cta.to}
                  href={cta.href}
                  /* site.js says what a button *is*; the hero decides how that
                     reads on a dark band. */
                  variant={cta.variant === 'secondary' ? 'outline' : cta.variant}
                  size="lg"
                >
                  {cta.label}
                </Button>
              ))}
            </div>

            <SocialLinks
              tone="chrome"
              className="mt-6 -ml-3 animate-fade-up [animation-delay:400ms]"
            />
          </div>

          <div className="relative lg:col-span-5">
            <div
              className="absolute -inset-6 rounded-full bg-brand-500/20 blur-3xl"
              aria-hidden="true"
            />
            <Slideshow
              items={profile.photos}
              ratio="4/5"
              className="ticked relative border border-chrome-line shadow-card-hover"
            />
          </div>
        </div>

        <div className="mt-auto flex justify-center pt-12">
          <a
            href="#explore"
            className="inline-flex flex-col items-center gap-1 font-mono text-xs uppercase tracking-widest text-chrome-muted transition-colors duration-200 hover:text-accent"
          >
            Explore
            <ChevronDown className="h-4 w-4 animate-bounce" />
          </a>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <>
      <Hero />

      <Section id="explore" bg="subtle">
        <Reveal>
          <SectionHeading
            eyebrow="Explore"
            title="Where to next?"
            description="A few places to get a sense of what I do and how to reach me."
          />
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {homeCards.map((card, i) => (
            <Reveal key={card.to} delay={i * 90}>
              <NavCard card={card} className="h-full" />
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  )
}

import Button from '../components/Button.jsx'
import Slideshow from '../components/Slideshow.jsx'
import NavCard from '../components/NavCard.jsx'
import Reveal from '../components/Reveal.jsx'
import Section from '../components/Section.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import SocialLinks from '../components/SocialLinks.jsx'
import { ChevronDown } from '../components/icons.jsx'
import { heroCtas, homeCards, profile } from '../content/site.js'

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-white pb-20 pt-16 lg:pb-28 lg:pt-24">
      <div className="container-page">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            {profile.availability && (
              <p className="inline-flex animate-fade-up items-center gap-2 rounded-pill border border-hairline bg-white px-3 py-1 text-xs font-medium text-body">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                {profile.availability}
              </p>
            )}

            <h1 className="mt-6 animate-fade-up text-display [animation-delay:80ms]">
              Hi, I’m {profile.name}.
            </h1>

            <p className="mt-4 animate-fade-up text-lg font-medium text-brand-600 [animation-delay:160ms]">
              {profile.role} · {profile.location}
            </p>

            <p className="mt-5 max-w-xl animate-fade-up text-lg text-body [animation-delay:240ms]">
              {profile.bio}
            </p>

            <div className="mt-8 flex animate-fade-up flex-wrap items-center gap-3 [animation-delay:320ms]">
              {heroCtas.map((cta) => (
                <Button key={cta.label} to={cta.to} href={cta.href} variant={cta.variant} size="lg">
                  {cta.label}
                </Button>
              ))}
            </div>

            <SocialLinks className="mt-6 -ml-3 animate-fade-up [animation-delay:400ms]" />
          </div>

          <div className="relative lg:col-span-5">
            <div
              className="absolute -inset-6 rounded-full bg-brand-200/35 blur-3xl"
              aria-hidden="true"
            />
            <Slideshow
              items={profile.photos}
              ratio="4/5"
              className="relative border border-hairline shadow-card"
            />
          </div>
        </div>

        <div className="mt-16 flex justify-center">
          <a
            href="#explore"
            className="inline-flex flex-col items-center gap-1 text-sm text-muted transition-colors duration-200 hover:text-brand-600"
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
            description="Three places to get a sense of what I do and how to reach me."
          />
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-3 sm:gap-6">
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

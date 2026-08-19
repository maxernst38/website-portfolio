import Card from './Card.jsx'
import Media from './Media.jsx'
import { ArrowRight } from './icons.jsx'

/** One destination in the home page navigation grid. The whole card is a link. */
export default function NavCard({ card, className = '' }) {
  return (
    <Card to={card.to} className={`flex flex-col ${className}`}>
      <Media
        {...card.image}
        ratio="4/3"
        rounded="rounded-none"
        imgClassName="transition-transform duration-500 ease-soft group-hover:scale-[1.03]"
      />
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-ink">{card.title}</h3>
        <p className="mt-1.5 text-sm text-body">{card.description}</p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600">
          {card.cta}
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Card>
  )
}

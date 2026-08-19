import Card from './Card.jsx'
import { ArrowRight } from './icons.jsx'

/** One destination button in the home page hub. The whole surface is a link. */
export default function NavCard({ card, className = '' }) {
  return (
    <Card
      to={card.to}
      className={`flex items-center justify-between gap-4 px-6 py-5 ${className}`}
    >
      <span className="text-lg font-semibold text-ink">{card.label}</span>
      <ArrowRight className="h-5 w-5 shrink-0 text-brand-600 transition-transform duration-200 group-hover:translate-x-0.5" />
    </Card>
  )
}

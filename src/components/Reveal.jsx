import { useInView } from '../hooks/useInView.js'

/** Fades and lifts its children in once, the first time they scroll into view. */
export default function Reveal({ delay = 0, as: Tag = 'div', className = '', children }) {
  const [ref, inView] = useInView()

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-[opacity,transform] duration-500 ease-soft ${
        inView ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
      } ${className}`}
    >
      {children}
    </Tag>
  )
}

/** Vertical rhythm + page container. Every page section goes through this. */
const BACKGROUNDS = {
  white: 'bg-surface',
  subtle: 'bg-surface-subtle',
}

export default function Section({
  id,
  as: Tag = 'section',
  bg = 'white',
  className = '',
  containerClassName = '',
  children,
}) {
  return (
    <Tag id={id} className={`${BACKGROUNDS[bg] ?? BACKGROUNDS.white} py-16 sm:py-20 lg:py-24 ${className}`}>
      <div className={`container-page ${containerClassName}`}>{children}</div>
    </Tag>
  )
}

import { useEffect, useRef, useState } from 'react'

/**
 * One-shot "has this scrolled into view yet?" — the whole scroll-reveal
 * mechanism, in place of a ~40 kB animation library.
 *
 * Under prefers-reduced-motion it starts as already-in-view, so content is
 * never hidden from people who opted out of animation.
 */
export function useInView({ threshold = 0.15, rootMargin = '0px 0px -10% 0px' } = {}) {
  const ref = useRef(null)
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [inView, setInView] = useState(reduced)

  useEffect(() => {
    if (reduced || !ref.current) return
    const el = ref.current
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          io.disconnect()   // one-shot: never animate back out
        }
      },
      { threshold, rootMargin },
    )
    io.observe(el)
    // Required: React StrictMode double-invokes effects in development.
    return () => io.disconnect()
  }, [reduced, threshold, rootMargin])

  return [ref, inView]
}

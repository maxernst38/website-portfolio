import { useCallback, useEffect, useRef, useState } from 'react'

/** Copies text and reports a short-lived "copied" state for button feedback. */
export function useCopyToClipboard(resetAfter = 2000) {
  const [copied, setCopied] = useState(false)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = useCallback(
    async (value) => {
      try {
        // Requires a secure context — localhost and HTTPS both qualify.
        await navigator.clipboard.writeText(value)
        setCopied(true)
        clearTimeout(timer.current)
        timer.current = setTimeout(() => setCopied(false), resetAfter)
        return true
      } catch {
        return false   // caller falls back to letting the user select the text
      }
    },
    [resetAfter],
  )

  return { copied, copy }
}
